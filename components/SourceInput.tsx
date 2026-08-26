'use client';

import { useRef, useState } from 'react';
import { demosFor, type Demo } from '@/lib/demos';
import type { Skill } from '@/lib/types';

export type PickedSource =
  | { kind: 'upload'; file: File; objectUrl: string; duration: number }
  | { kind: 'youtube'; url: string; videoId: string };

const YOUTUBE = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i;
export const youtubeId = (url: string) => YOUTUBE.exec(url.trim())?.[1] ?? null;

/** Đọc độ dài video ngay ở trình duyệt, trước khi gửi đi.
 *  Chặn sớm ở đây thì một video mười phút không bao giờ rời khỏi máy giáo viên. */
function readDuration(objectUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => resolve(Number.isFinite(v.duration) ? v.duration : 0);
    v.onerror = () => resolve(0);
    v.src = objectUrl;
  });
}

const MAX_SECONDS = 90;

const KIND_TONE: Record<Demo['kind'], { label: string; cls: string }> = {
  faults: { label: 'có lỗi',      cls: 'text-warn bg-warn/10' },
  clean:  { label: 'không lỗi',   cls: 'text-calm bg-calm/10' },
  refuse: { label: 'từ chối chấm', cls: 'text-mist bg-white/[0.07]' },
};

type Tab = 'demo' | 'upload' | 'youtube';

export function SourceInput({
  skill, onPick, disabled, thorough, onThorough,
}: {
  skill: Skill | null;
  onPick: (s: PickedSource) => void;
  disabled?: boolean;
  thorough: boolean;
  onThorough: (v: boolean) => void;
}) {
  const [tab, setTab] = useState<Tab>('demo');
  const [drag, setDrag] = useState(false);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const demos = skill ? demosFor(skill) : [];

  async function take(file: File | undefined) {
    setErr(null);
    if (!file) return;
    if (!file.type.startsWith('video/')) return setErr('Tệp này không phải video.');
    const objectUrl = URL.createObjectURL(file);
    const duration = await readDuration(objectUrl);
    if (duration > MAX_SECONDS) {
      URL.revokeObjectURL(objectUrl);
      return setErr(`Video dài ${Math.round(duration)} giây. Catch chỉ nhận tối đa ${MAX_SECONDS} giây — mười lăm giây là đủ.`);
    }
    onPick({ kind: 'upload', file, objectUrl, duration });
  }

  function takeUrl(raw: string) {
    setErr(null);
    const id = youtubeId(raw);
    if (!id) return setErr('Cần một đường dẫn YouTube công khai, dạng youtube.com/watch?v=… hoặc youtu.be/…');
    onPick({ kind: 'youtube', url: raw.trim(), videoId: id });
  }

  const TABS: [Tab, string][] = [['demo', 'Xem thử ngay'], ['upload', 'Tải video lên'], ['youtube', 'Dán link YouTube']];

  return (
    <div>
      <div role="tablist" aria-label="Cách đưa video vào" className="mb-3 inline-flex rounded-xl border border-line bg-deep/70 p-1">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => { setTab(k); setErr(null); }}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition
              ${tab === k ? 'bg-raised text-foam' : 'text-mist hover:text-foam'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'demo' && (
        <div className="rounded-2xl border border-line bg-surface/40 p-5">
          {demos.length === 0 ? (
            <p className="text-sm leading-relaxed text-mist">
              Chưa có video mẫu cho nội dung này. Dùng tab <em>Tải video lên</em> hoặc <em>Dán link YouTube</em>.
            </p>
          ) : (
            <>
              <p className="mb-3.5 text-[13px] leading-relaxed text-mist">
                Bấm một video là chấm thật ngay, không phải màn dựng sẵn. Đã nói trước kết quả để
                thầy biết đang xem cái gì.
              </p>
              <ul className="space-y-2.5">
                {demos.map((d) => (
                  <li key={d.url}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => takeUrl(d.url)}
                      className="group w-full rounded-xl border border-line bg-deep/60 p-3.5 text-left transition hover:border-aqua/40 hover:bg-deep disabled:opacity-50"
                    >
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="text-sm font-semibold tracking-tight">{d.title}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${KIND_TONE[d.kind].cls}`}>
                          {KIND_TONE[d.kind].label}
                        </span>
                        <span className="ml-auto font-mono text-[11px] text-dim">~{d.seconds}s</span>
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-mist">{d.expect}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {tab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); void take(e.dataTransfer.files?.[0]); }}
          className={`rounded-2xl border border-dashed p-8 text-center transition-colors
            ${drag ? 'border-aqua bg-aqua/[0.06]' : 'border-line bg-surface/40'}`}
        >
          <svg viewBox="0 0 48 24" aria-hidden className="mx-auto h-8 w-20 text-aqua/70" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1 15c4-5 7-5 11 0s7 5 11 0 7-5 11 0 7 5 11 0" />
            <path d="M1 21c4-5 7-5 11 0s7 5 11 0 7-5 11 0 7 5 11 0" opacity=".45" />
          </svg>
          <p className="mt-4 text-[15px] font-medium">Kéo video vào đây, hoặc</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="mt-2.5 rounded-xl border border-line bg-raised px-4 py-2 text-sm font-medium transition hover:border-aqua/40 hover:bg-raised/70 disabled:opacity-50"
          >
            chọn tệp từ máy
          </button>
          <input ref={inputRef} type="file" accept="video/*" className="sr-only"
            onChange={(e) => void take(e.target.files?.[0] ?? undefined)} />
          <p className="mt-4 text-xs leading-relaxed text-dim">
            Mười đến hai mươi giây, quay từ bờ. Tối đa {MAX_SECONDS} giây.
            <br />
            Video được xoá khỏi máy chủ ngay sau khi chấm xong.
          </p>
        </div>
      )}

      {tab === 'youtube' && (
        <div className="rounded-2xl border border-line bg-surface/40 p-6">
          <label htmlFor="yt" className="block text-[15px] font-medium">Đường dẫn video YouTube công khai</label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="yt" type="url" inputMode="url" value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') takeUrl(url); }}
              placeholder="https://www.youtube.com/watch?v=…"
              className="min-w-0 flex-1 rounded-xl border border-line bg-deep px-3.5 py-2.5 text-sm placeholder:text-dim/70 focus:border-aqua/50"
            />
            <button type="button" onClick={() => takeUrl(url)} disabled={disabled}
              className="rounded-xl bg-aqua px-4 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110 disabled:opacity-50">
              Dùng link này
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-dim">
            Video riêng tư hoặc không công khai thì Gemini không đọc được.
          </p>
        </div>
      )}

      {/* ── Chấm hai lượt ──
          Mặc định BẬT. Lỗi bịa không cố định — đo được ngày 26/08: cùng model,
          cùng video, lượt có lượt không. Giao hai lượt rồi chỉ giữ phần chung là
          cách rẻ nhất bóc bớt thứ nghe có lý mà không có thật. */}
      <label className="mt-3.5 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-deep/40 px-4 py-3">
        <input
          type="checkbox" checked={thorough}
          onChange={(e) => onThorough(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[#2ad4ee]"
        />
        <span>
          <span className="text-sm font-medium">Chấm kỹ — hỏi model hai lượt</span>
          <span className="mt-0.5 block text-[13px] leading-relaxed text-mist">
            Chỉ giữ lỗi xuất hiện ở <strong className="font-medium text-foam">cả hai lượt</strong>. Chậm hơn một chút,
            nhưng bóc được những lỗi model chỉ thấy một lần — đúng loại lỗi nghe có lý mà không có thật.
          </span>
        </span>
      </label>

      {err && (
        <p role="alert" className="mt-3 rounded-xl border border-warn/30 bg-warn/[0.08] px-3.5 py-2.5 text-sm text-warn">
          {err}
        </p>
      )}
    </div>
  );
}
