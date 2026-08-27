'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { BY_CODE, SEVERITY_META } from '@/lib/faults';
import { classProgress, compareWithPrevious } from '@/lib/progress';
import { CLASS_WIDE, commonFaults, liveFaults, rankEntries, worstSeverity, type Entry, type Session } from '@/lib/session';
import type { Severity } from '@/lib/types';
import { mmss, ngayVN } from '@/lib/time';
import { CalendarReminder } from './CalendarReminder';
import type { Backup } from './useSession';

const TONE: Record<Severity, { dot: string; text: string; border: string; bg: string }> = {
  red:   { dot: 'bg-danger', text: 'text-danger', border: 'border-danger/35', bg: 'bg-danger/[0.06]' },
  amber: { dot: 'bg-warn',   text: 'text-warn',   border: 'border-warn/30',   bg: 'bg-warn/[0.06]' },
  green: { dot: 'bg-calm',   text: 'text-calm',   border: 'border-calm/25',   bg: 'bg-calm/[0.05]' },
};

function EntryRow({
  entry, order, archive, onRemove,
}: {
  entry: Entry; order: number; archive: Session[]; onRemove: () => void;
}) {
  const faults = liveFaults(entry);
  const worst = worstSeverity(entry);
  const top = faults[0];
  const tone = worst ? TONE[worst] : null;
  const progress = compareWithPrevious(entry, archive);

  return (
    <li className={`rounded-2xl border p-4 transition ${tone ? `${tone.border} ${tone.bg}` : 'border-line bg-surface/40'}`}>
      <div className="flex items-start gap-3.5">
        <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold
          ${tone ? `${tone.text} bg-white/[0.07]` : 'text-dim bg-white/[0.04]'}`}>
          {order}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-[15px] font-semibold tracking-tight">{entry.label}</h3>
            {entry.coached && <span className="text-xs text-calm">đã sửa hôm nay</span>}
            {entry.refused ? (
              <span className="text-xs text-warn">không chấm được</span>
            ) : faults.length === 0 ? (
              <span className="text-xs text-calm">không thấy lỗi nào trong bảng</span>
            ) : (
              <span className="text-xs text-dim">{faults.length} lỗi · {SEVERITY_META[worst!].label}</span>
            )}
          </div>

          {top && (
            <>
              <p className="mt-1.5 text-sm leading-relaxed text-foam/90">
                <span className={TONE[BY_CODE.get(top.code)!.severity].text}>{BY_CODE.get(top.code)!.label}</span>
                <span className="text-dim"> · mốc {mmss(top.at)}</span>
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mist">{BY_CODE.get(top.code)!.drill}</p>
            </>
          )}
          {entry.refused && <p className="mt-1.5 text-[13px] leading-relaxed text-mist">{entry.refused}</p>}

          {faults.length > 1 && (
            <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-xs text-dim">
              {faults.slice(1).map((f) => (
                <span key={`${f.code}-${f.at}`}>· {BY_CODE.get(f.code)!.label} ({mmss(f.at)})</span>
              ))}
            </p>
          )}

          {/* So với chính em này ở buổi trước */}
          {progress && (progress.fixed.length > 0 || progress.appeared.length > 0) && (
            <p className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-line/60 pt-2.5 text-xs">
              <span className="text-dim">so với buổi {ngayVN(progress.previousDate)}:</span>
              {progress.fixed.map((c) => (
                <span key={c} className="rounded-md bg-calm/10 px-1.5 py-0.5 text-calm">
                  hết · {BY_CODE.get(c)!.label}
                </span>
              ))}
              {progress.appeared.map((c) => (
                <span key={c} className="rounded-md bg-warn/10 px-1.5 py-0.5 text-warn">
                  mới · {BY_CODE.get(c)!.label}
                </span>
              ))}
            </p>
          )}
        </div>

        <button
          onClick={onRemove}
          aria-label={`Bỏ ${entry.label} khỏi buổi học`}
          className="shrink-0 rounded-lg px-2 py-1 text-xs text-dim transition hover:bg-white/[0.06] hover:text-mist"
        >
          bỏ
        </button>
      </div>
    </li>
  );
}

export function PriorityBoard({
  session, archive, onRemove, onClear, onFinish, onExport, onImport,
}: {
  session: Session;
  archive: Session[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onFinish: () => void;
  onExport: () => Backup;
  onImport: (raw: unknown) => { ok: true } | { ok: false; why: string };
}) {
  const ranked = rankEntries(session.entries);
  const common = commonFaults(session.entries);
  const classWide = common.filter((c) => c.share >= CLASS_WIDE && c.students.length >= 2);
  const reds = ranked.filter((e) => worstSeverity(e) === 'red');
  const progress = classProgress(session, archive).filter((c) => c.then !== c.now);
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);

  function download() {
    const blob = new Blob([JSON.stringify(onExport(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `catch-${session.className || 'lop'}-${session.date}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    try {
      const r = onImport(JSON.parse(await file.text()));
      setNote(r.ok ? 'Đã nạp lại buổi học từ tệp.' : r.why);
    } catch { setNote('Không đọc được tệp này.'); }
  }

  if (session.entries.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[15px] text-mist">Buổi học này chưa có em nào được chấm.</p>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-aqua px-4 py-2 text-sm font-semibold text-abyss transition hover:brightness-110">
          Chấm em đầu tiên
        </Link>
        {archive.length > 0 && (
          <p className="mt-5 text-[13px] text-dim">Đã lưu {archive.length} buổi trước đó.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Việc dạy hôm trước có ăn thua không ── */}
      {progress.length > 0 && (
        <section className="card border-calm/25 bg-calm/[0.04] p-5">
          <h2 className="text-base font-semibold tracking-tight text-calm">So với buổi {ngayVN(progress[0].previousDate)}</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
            Đây là câu mà chấm từng buổi rời rạc không nói được: thứ thầy dạy buổi trước có ăn thua gì không.
          </p>
          <ul className="mt-4 space-y-2">
            {progress.map((c) => {
              const better = c.now < c.then;
              return (
                <li key={c.code} className="flex flex-wrap items-baseline gap-x-2.5 text-sm">
                  <span className={better ? 'text-calm' : 'text-warn'}>{better ? '↓' : '↑'}</span>
                  <span className="font-medium">{c.label}</span>
                  <span className="font-mono text-xs text-dim">
                    {c.then} em → {c.now} em{c.total ? ` / ${c.total}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Chỗ chỉ nhìn thấy được khi có cả lớp trong tay ── */}
      {classWide.length > 0 && (
        <section className="card border-aqua/25 bg-aqua/[0.04] p-5">
          <h2 className="text-base font-semibold tracking-tight text-aqua">Dạy lại cho cả lớp</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
            Những lỗi này không phải của riêng em nào. Sửa một lần cho cả lớp nhanh hơn sửa từng em.
          </p>
          <ul className="mt-4 space-y-3.5">
            {classWide.map((c) => (
              <li key={c.code}>
                <div className="flex flex-wrap items-baseline gap-x-2.5">
                  <span aria-hidden className={`size-2 rounded-full ${TONE[c.spec.severity].dot}`} />
                  <h3 className="text-sm font-semibold">{c.spec.label}</h3>
                  <span className="font-mono text-xs text-dim">{c.students.length}/{session.entries.length} em</span>
                </div>
                <p className="mt-1 pl-4 text-[13px] leading-relaxed text-mist">{c.spec.drill}</p>
                <p className="mt-1 pl-4 text-xs text-dim">{c.students.join(' · ')}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Thứ tự sửa riêng ── */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-base font-semibold tracking-tight">Sửa riêng, theo thứ tự này</h2>
          {reds.length > 0 && (
            <p className="text-[13px] text-danger">{reds.length} em có lỗi nhóm nguy hiểm — ưu tiên trước</p>
          )}
        </div>
        <p className="mb-4 text-[13px] leading-relaxed text-mist">
          Xếp theo rủi ro đuối nước, không theo mức xấu của động tác. {SEVERITY_META.red.why}
        </p>
        <ol className="space-y-3">
          {ranked.map((e, i) => (
            <EntryRow key={e.id} entry={e} order={i + 1} archive={archive} onRemove={() => onRemove(e.id)} />
          ))}
        </ol>
      </section>

      <div className="space-y-3 border-t border-line pt-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/session/poolside" className="rounded-xl bg-aqua px-4 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110">
            Chế độ bờ hồ →
          </Link>
          <Link href="/" className="rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-sm font-medium transition hover:border-aqua/35 hover:bg-surface">
            Chấm em tiếp theo
          </Link>
          <Link href="/session/print" className="rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-sm font-medium transition hover:border-aqua/35 hover:bg-surface">
            In giáo án buổi sau
          </Link>
          {/* Tờ giấy in ra cầm được ra bờ hồ; cái này lo phần thầy nhớ mở nó ra
              trước buổi sau. Hai đường thoát khác nhau cho hai kiểu quên. */}
          <CalendarReminder session={session} archive={archive} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[13px]">
          <button
            onClick={() => { if (confirm(`Đóng buổi ${ngayVN(session.date)} và mở buổi mới? Buổi này được giữ lại để so tiến bộ.`)) onFinish(); }}
            className="text-aqua/90 underline decoration-dotted underline-offset-4 transition hover:text-aqua"
          >
            Kết thúc buổi học
          </button>
          <button onClick={download} className="text-mist underline decoration-dotted underline-offset-4 transition hover:text-foam">
            Lưu ra tệp
          </button>
          <button onClick={() => fileRef.current?.click()} className="text-mist underline decoration-dotted underline-offset-4 transition hover:text-foam">
            Nạp từ tệp
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="sr-only"
            onChange={(e) => void upload(e.target.files?.[0] ?? undefined)} />
          <button
            onClick={() => { if (confirm('Xoá cả buổi học này? Không lấy lại được.')) onClear(); }}
            className="ml-auto text-dim transition hover:text-mist"
          >
            Xoá buổi học
          </button>
        </div>

        {note && <p role="status" className="text-[13px] text-aqua">{note}</p>}

        <p className="pt-1 text-xs leading-relaxed text-dim">
          Đã lưu {archive.length} buổi trước. Buổi học nằm trong trình duyệt máy này và trên Firebase —
          đổi máy thì dùng <em>Lưu ra tệp</em> rồi <em>Nạp từ tệp</em>.
        </p>
      </div>
    </div>
  );
}
