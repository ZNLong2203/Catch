'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BY_CODE, SEVERITY_META, SKILL_META } from '@/lib/faults';
import type { Analysis, Fault, Severity } from '@/lib/types';
import type { PickedSource } from './SourceInput';
import { mmss } from '@/lib/time';

const TONE: Record<Severity, { dot: string; text: string; ring: string; bg: string; rail: string }> = {
  red:   { dot: 'bg-danger', text: 'text-danger', ring: 'border-danger/40', bg: 'bg-danger/[0.07]', rail: 'bg-danger' },
  amber: { dot: 'bg-warn',   text: 'text-warn',   ring: 'border-warn/35',   bg: 'bg-warn/[0.07]',   rail: 'bg-warn' },
  green: { dot: 'bg-calm',   text: 'text-calm',   ring: 'border-calm/30',   bg: 'bg-calm/[0.06]',   rail: 'bg-calm' },
};

/* ── Trình phát ─────────────────────────────────────────────────────────
   Hai đường vào cần hai cách tua khác nhau, nhưng phần còn lại của màn hình
   không cần biết điều đó — nó chỉ gọi seek(giây). */

function useYouTubeBridge(enabled: boolean) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [time, setTime] = useState({ current: 0, duration: 0 });

  const post = useCallback((body: object) => {
    ref.current?.contentWindow?.postMessage(JSON.stringify(body), '*');
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Xin YouTube gửi tiến độ về. Không cần tải iframe_api — chỉ cần enablejsapi=1
    // trong địa chỉ nhúng rồi bắt tay bằng postMessage.
    const hello = setInterval(() => post({ event: 'listening', id: 'catch' }), 500);
    const stop = setTimeout(() => clearInterval(hello), 6000);

    const onMsg = (e: MessageEvent) => {
      if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
      try {
        const d = JSON.parse(e.data as string);
        const info = d?.info;
        if (!info) return;
        setTime((t) => ({
          current: typeof info.currentTime === 'number' ? info.currentTime : t.current,
          duration: typeof info.duration === 'number' && info.duration > 0 ? info.duration : t.duration,
        }));
      } catch { /* YouTube cũng gửi cả tin không phải JSON */ }
    };
    window.addEventListener('message', onMsg);
    return () => { clearInterval(hello); clearTimeout(stop); window.removeEventListener('message', onMsg); };
  }, [enabled, post]);

  const seek = useCallback((s: number) => {
    post({ event: 'command', func: 'seekTo', args: [s, true] });
    post({ event: 'command', func: 'playVideo', args: [] });
  }, [post]);

  return { ref, time, seek };
}

/* ── Thanh thời gian có mốc ─────────────────────────────────────────────
   Đây là thứ biến "AI bảo thế" thành "tự xem mà kiểm", và là lý do một ban
   giám khảo có quyền tin sản phẩm này. Không bao giờ được cắt. */

function Rail({
  faults, duration, current, onSeek, activeAt,
}: {
  faults: Fault[]; duration: number; current: number; onSeek: (s: number) => void; activeAt: number | null;
}) {
  const pct = (s: number) => (duration > 0 ? Math.min(100, Math.max(0, (s / duration) * 100)) : 0);

  return (
    <div className="px-1 pb-1 pt-4">
      <div
        className="relative h-1.5 w-full rounded-full bg-line"
        role="group"
        aria-label="Mốc thời gian của các lỗi"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-aqua/50 transition-[width] duration-150"
          style={{ width: `${pct(current)}%` }}
        />
        {faults.map((f) => {
          const spec = BY_CODE.get(f.code)!;
          const on = activeAt === f.at;
          return (
            <button
              key={`${f.code}-${f.at}`}
              type="button"
              onClick={() => onSeek(f.at)}
              title={`${mmss(f.at)} — ${spec.label}`}
              aria-label={`Xem lại lỗi ${spec.label} tại phút ${mmss(f.at)}`}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-2"
              style={{ left: `${pct(f.at)}%` }}
            >
              <span
                className={`block rounded-full ring-2 ring-abyss transition-all
                  ${TONE[spec.severity].rail}
                  ${on ? 'size-4 shadow-[0_0_0_5px_rgba(255,255,255,.10)]' : 'size-2.5 group-hover:size-3.5'}`}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] tabular-nums text-dim">
        <span>{mmss(current)}</span>
        <span>{duration > 0 ? mmss(duration) : '—:—'}</span>
      </div>
    </div>
  );
}

/* ── Thẻ lỗi ────────────────────────────────────────────────────────── */

function FaultCard({
  fault, index, active, onSeek, onDismiss,
}: {
  fault: Fault; index: number; active: boolean; onSeek: (s: number) => void; onDismiss: () => void;
}) {
  const spec = BY_CODE.get(fault.code)!;
  const tone = TONE[spec.severity];

  return (
    <article
      className={`animate-rise rounded-2xl border p-4 transition-all duration-200
        ${active ? `${tone.ring} ${tone.bg}` : 'border-line bg-surface/50 hover:border-line/80 hover:bg-surface/80'}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-full ${tone.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight">{spec.label}</h3>
            <button
              type="button"
              onClick={() => onSeek(fault.at)}
              className={`rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums transition
                ${tone.text} bg-white/[0.06] hover:bg-white/[0.12]`}
            >
              ▸ {mmss(fault.at)}
            </button>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-foam/90">{fault.note}</p>

          <p className="mt-2.5 border-l-2 border-line pl-3 text-[13px] leading-relaxed text-mist">
            <span className="eyebrow mr-1.5">Nhìn thấy</span>
            {fault.evidence}
          </p>

          <details className="group mt-3">
            <summary className="cursor-pointer list-none text-[13px] font-medium text-aqua/90 transition hover:text-aqua">
              Sửa thế nào ở buổi sau
              <span aria-hidden className="ml-1 inline-block transition-transform group-open:rotate-90">›</span>
            </summary>
            <p className="mt-2 rounded-xl bg-deep/70 p-3 text-[13px] leading-relaxed text-mist">{spec.drill}</p>
          </details>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <span className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] tabular-nums text-dim">
                tin cậy {Math.round(fault.confidence * 100)}%
              </span>
              {fault.confirmed && (
                <span
                  title="Lỗi này xuất hiện ở cả hai lượt hỏi model độc lập"
                  className="rounded-md bg-calm/10 px-1.5 py-0.5 text-[11px] font-medium text-calm"
                >
                  hai lượt đều thấy
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg px-2 py-1 text-xs text-dim transition hover:bg-white/[0.06] hover:text-mist"
            >
              Thầy thấy không đúng — bỏ lỗi này
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Màn hình soi ───────────────────────────────────────────────────── */

export function Review({
  analysis, source, onReset, onSave, suggestedLabel,
}: {
  analysis: Analysis;
  source: PickedSource;
  onReset: () => void;
  /** Lưu em này vào buổi học rồi chuyển sang em kế tiếp. */
  onSave: (label: string, dismissed: string[]) => void;
  suggestedLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isYt = source.kind === 'youtube';
  const yt = useYouTubeBridge(isYt);

  const [local, setLocal] = useState({ current: 0, duration: source.kind === 'upload' ? source.duration : 0 });
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [label, setLabel] = useState(suggestedLabel);

  const time = isYt ? yt.time : local;
  const seek = useCallback((s: number) => {
    if (isYt) return yt.seek(s);
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = s;
    void v.play().catch(() => { /* trình duyệt chặn tự phát — không sao, đã tua đúng chỗ */ });
  }, [isYt, yt]);

  const key = (f: Fault) => `${f.code}-${f.at}`;
  const live = analysis.faults.filter((f) => !dismissed.has(key(f)));
  const gone = analysis.faults.filter((f) => dismissed.has(key(f)));

  /* Lỗi nào đang được xem — mốc gần nhất phía sau đầu đọc, trong vòng 4 giây. */
  const activeAt = useMemo(() => {
    let best: number | null = null;
    for (const f of live) if (f.at <= time.current + 0.4 && time.current - f.at < 4) {
      if (best === null || f.at > best) best = f.at;
    }
    return best;
  }, [live, time.current]);

  const groups = (['red', 'amber', 'green'] as Severity[])
    .map((sev) => ({ sev, items: live.filter((f) => BY_CODE.get(f.code)!.severity === sev) }))
    .filter((g) => g.items.length > 0);

  const top = live[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
      {/* ── Cột trái: khung hình ── */}
      <div className="lg:sticky lg:top-6">
        <div className="card overflow-hidden p-2">
          <div className="overflow-hidden rounded-xl bg-black">
            {isYt ? (
              <iframe
                ref={yt.ref}
                title="Video đang soi"
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
                src={`https://www.youtube.com/embed/${source.videoId}?enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
              />
            ) : (
              <video
                ref={videoRef}
                src={source.objectUrl}
                controls
                playsInline
                className="aspect-video w-full bg-black"
                onLoadedMetadata={(e) => setLocal((t) => ({ ...t, duration: e.currentTarget.duration || t.duration }))}
                onTimeUpdate={(e) => setLocal((t) => ({ ...t, current: e.currentTarget.currentTime }))}
              />
            )}
          </div>
          <Rail faults={live} duration={time.duration} current={time.current} onSeek={seek} activeAt={activeAt} />
        </div>

        <p className="mt-3 px-1 text-[13px] leading-relaxed text-dim">
          Bấm vào chấm màu trên thanh thời gian để xem lại đúng giây đó.
          Catch xếp thứ tự, thầy là người quyết.
          {analysis.meta.passes > 1 && analysis.meta.unconfirmed ? (
            <>
              {' '}Có <strong className="font-medium text-warn">{analysis.meta.unconfirmed}</strong> lỗi
              chỉ xuất hiện ở một trong hai lượt hỏi nên đã bị loại — chúng thường là suy đoán trôi nổi.
            </>
          ) : null}
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 px-1 font-mono text-[11px] tabular-nums text-dim">
          <div className="flex gap-1.5"><dt>kiểu</dt><dd className="text-mist">{SKILL_META[analysis.skill].label}</dd></div>
          <div className="flex gap-1.5"><dt>model</dt><dd className="text-mist">{analysis.meta.model}</dd></div>
          <div className="flex gap-1.5"><dt>thời gian</dt><dd className="text-mist">{(analysis.meta.ms / 1000).toFixed(1)}s</dd></div>
          {analysis.meta.tokensIn != null && (
            <div className="flex gap-1.5"><dt>token vào</dt><dd className="text-mist">{analysis.meta.tokensIn.toLocaleString('vi-VN')}</dd></div>
          )}
          <div className="flex gap-1.5"><dt>lượt hỏi</dt><dd className="text-mist">{analysis.meta.passes}</dd></div>
          {analysis.meta.dropped > 0 && (
            <div className="flex gap-1.5"><dt>bỏ vì thiếu mốc</dt><dd className="text-warn">{analysis.meta.dropped}</dd></div>
          )}
          {analysis.meta.unconfirmed != null && analysis.meta.unconfirmed > 0 && (
            <div className="flex gap-1.5">
              <dt>chỉ một lượt thấy</dt><dd className="text-warn">{analysis.meta.unconfirmed}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* ── Cột phải: lỗi ── */}
      <div>
        {analysis.refused ? (
          <div className="card border-warn/30 bg-warn/[0.06] p-6">
            <div className="flex items-start gap-3">
              <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-warn/15 text-warn">!</span>
              <div>
                <h2 className="text-base font-semibold text-warn">Catch không chấm video này</h2>
                <p className="mt-2 text-sm leading-relaxed text-foam/90">{analysis.refused}</p>
                <p className="mt-3 text-[13px] leading-relaxed text-mist">
                  Một kết quả sai mà nghe có lý còn nguy hiểm hơn không có kết quả nào — thầy sẽ tin nó
                  và sửa nhầm em. Nên khi không nhìn rõ, Catch nói thẳng là không nhìn rõ.
                </p>
              </div>
            </div>
          </div>
        ) : live.length === 0 && gone.length === 0 ? (
          <div className="card p-6">
            <h2 className="text-base font-semibold text-calm">Không thấy lỗi nào trong danh sách</h2>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Catch không cố tìm lỗi cho đủ. Không có nghĩa là em bơi hoàn hảo — chỉ có nghĩa là
              trong mười lăm giây này, không lỗi nào trong bảng hiện ra đủ rõ để báo.
            </p>
          </div>
        ) : (
          <>
            {top && (
              <div className="card mb-5 p-5">
                <p className="eyebrow">Buổi sau, sửa cái này trước</p>
                <p className="mt-2 text-[15px] font-medium leading-snug">
                  <span className={TONE[BY_CODE.get(top.code)!.severity].text}>{BY_CODE.get(top.code)!.label}</span>
                  {' — '}
                  <button onClick={() => seek(top.at)} className="font-mono text-sm underline decoration-dotted underline-offset-4 hover:text-aqua">
                    xem lại {mmss(top.at)}
                  </button>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-mist">
                  {SEVERITY_META[BY_CODE.get(top.code)!.severity].why}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {groups.map(({ sev, items }) => (
                <section key={sev}>
                  <div className="mb-2.5 flex items-baseline gap-2.5">
                    <span aria-hidden className={`size-2 rounded-full ${TONE[sev].dot}`} />
                    <h2 className={`text-sm font-semibold ${TONE[sev].text}`}>{SEVERITY_META[sev].label}</h2>
                    <span className="text-xs text-dim">{items.length} lỗi</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((f, i) => (
                      <FaultCard
                        key={key(f)}
                        fault={f}
                        index={i}
                        active={activeAt === f.at}
                        onSeek={seek}
                        onDismiss={() => setDismissed((s) => new Set(s).add(key(f)))}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {gone.length > 0 && (
              <details className="mt-5 rounded-xl border border-line bg-deep/50 px-4 py-3">
                <summary className="cursor-pointer text-[13px] text-dim">
                  {gone.length} lỗi thầy đã bỏ
                </summary>
                <ul className="mt-2.5 space-y-1.5">
                  {gone.map((f) => (
                    <li key={key(f)} className="flex items-center justify-between gap-3 text-[13px] text-mist">
                      <span>{BY_CODE.get(f.code)!.label} · {mmss(f.at)}</span>
                      <button
                        onClick={() => setDismissed((s) => { const n = new Set(s); n.delete(key(f)); return n; })}
                        className="text-dim underline decoration-dotted underline-offset-2 hover:text-foam"
                      >
                        lấy lại
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        )}

        {/* ── Lưu vào buổi học ──
            Tên các em nằm trong localStorage của chính máy giáo viên và không đi
            đâu cả. Không có cơ sở dữ liệu, không có tài khoản. */}
        <form
          className="card mt-6 p-4"
          onSubmit={(e) => { e.preventDefault(); onSave(label.trim() || suggestedLabel, [...dismissed]); }}
        >
          <label htmlFor="ten-em" className="eyebrow">Ghi vào buổi học</label>
          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
            <input
              id="ten-em"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Tên em, hoặc số thứ tự"
              className="min-w-0 flex-1 rounded-xl border border-line bg-deep px-3.5 py-2.5 text-sm placeholder:text-dim/60 focus:border-aqua/50"
            />
            <button
              type="submit"
              className="rounded-xl bg-aqua px-4 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110"
            >
              Lưu, chấm em tiếp theo
            </button>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-dim">
            Tên em chỉ nằm trên máy này, không gửi đi đâu. Lỗi thầy đã bỏ cũng được ghi nhớ.
          </p>
        </form>

        <button
          type="button"
          onClick={onReset}
          className="mt-3 w-full rounded-xl border border-line bg-surface/40 px-4 py-2.5 text-sm text-mist transition hover:border-line/80 hover:text-foam"
        >
          Bỏ qua, không ghi em này
        </button>
      </div>
    </div>
  );
}
