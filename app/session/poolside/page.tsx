'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BY_CODE, SEVERITY_META } from '@/lib/faults';
import { liveFaults, rankEntries, worstSeverity } from '@/lib/session';
import type { Severity } from '@/lib/types';
import { useSessionStore } from '@/components/SessionProvider';

/** Chế độ bờ hồ.
 *
 *  Thầy đang đứng cạnh hồ, tay ướt, nắng chói, ba mươi đứa trẻ đang gọi. Thầy
 *  không đọc bảng — thầy cần MỘT em, MỘT việc, chữ đủ to để liếc một cái là thấy,
 *  và một nút đủ lớn để bấm bằng ngón cái ướt.
 *
 *  Nên màn hình này cố ý bỏ gần hết: không mốc thời gian, không độ tin cậy,
 *  không bằng chứng thị giác. Những thứ đó thuộc về lúc thầy ngồi soi lại. */

const TONE: Record<Severity, { text: string; ring: string; glow: string }> = {
  red:   { text: 'text-danger', ring: 'ring-danger/40', glow: 'from-danger/[0.12]' },
  amber: { text: 'text-warn',   ring: 'ring-warn/35',   glow: 'from-warn/[0.10]' },
  green: { text: 'text-calm',   ring: 'ring-calm/30',   glow: 'from-calm/[0.08]' },
};

export default function PoolsidePage() {
  const { session, ready, patchEntry } = useSessionStore();
  const ranked = rankEntries(session.entries);
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);

  const total = ranked.length;
  const go = useCallback((d: number) => setI((n) => Math.min(Math.max(n + d, 0), Math.max(total - 1, 0))), [total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-dim">Đang mở buổi học…</div>;

  if (total === 0) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-lg text-mist">Buổi học chưa có em nào được chấm.</p>
          <Link href="/" className="mt-5 inline-block rounded-xl bg-aqua px-5 py-3 text-base font-semibold text-abyss">
            Về chỗ chấm
          </Link>
        </div>
      </div>
    );
  }

  const entry = ranked[Math.min(i, total - 1)];
  const faults = liveFaults(entry);
  const worst = worstSeverity(entry);
  const top = faults[0];
  const spec = top ? BY_CODE.get(top.code)! : null;
  const tone = worst ? TONE[worst] : null;

  return (
    <div
      className="relative flex min-h-screen flex-col"
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {tone && <div aria-hidden className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${tone.glow} to-transparent`} />}

      <header className="relative flex items-center justify-between px-5 pt-5 sm:px-8">
        <Link href="/session" className="text-sm text-dim transition hover:text-aqua">← Bảng ưu tiên</Link>
        <p className="font-mono text-sm tabular-nums text-mist">{i + 1} / {total}</p>
      </header>

      <main className="relative flex flex-1 flex-col justify-center px-5 py-8 sm:px-8">
        <p className="text-sm uppercase tracking-[0.16em] text-dim">
          {session.className ? `Lớp ${session.className}` : 'Buổi'} · {SEVERITY_META[worst ?? 'green'].label}
        </p>

        <h1 className="mt-2 text-[clamp(2.25rem,9vw,4.5rem)] font-bold leading-[1.05] tracking-tight">
          {entry.label}
        </h1>

        {entry.refused ? (
          <p className="mt-6 max-w-2xl text-[clamp(1.05rem,3.4vw,1.5rem)] leading-snug text-warn">
            Không chấm được video của em này.
          </p>
        ) : !spec ? (
          <p className="mt-6 max-w-2xl text-[clamp(1.05rem,3.4vw,1.5rem)] leading-snug text-calm">
            Không thấy lỗi nào trong bảng.
          </p>
        ) : (
          <>
            <p className={`mt-5 text-[clamp(1.4rem,5vw,2.5rem)] font-semibold leading-tight ${tone!.text}`}>
              {spec.label}
            </p>
            <p className="mt-5 max-w-2xl text-[clamp(1.05rem,3.4vw,1.6rem)] leading-snug text-foam/90">
              {spec.drill}
            </p>
            {faults.length > 1 && (
              <p className="mt-5 text-base text-dim">
                Còn {faults.length - 1} lỗi nữa — để buổi sau. Mỗi buổi một việc.
              </p>
            )}
          </>
        )}
      </main>

      <footer className="relative px-5 pb-8 sm:px-8">
        <div className="mb-4 flex gap-1.5" aria-hidden>
          {ranked.map((e, n) => (
            <span
              key={e.id}
              className={`h-1 flex-1 rounded-full transition-colors
                ${e.coached ? 'bg-calm/70' : n === i ? 'bg-aqua' : 'bg-line'}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => go(-1)}
            disabled={i === 0}
            aria-label="Em trước"
            className="rounded-2xl border border-line bg-surface/70 px-6 py-5 text-2xl transition active:scale-95 disabled:opacity-30"
          >
            ←
          </button>

          <button
            onClick={() => { patchEntry(entry.id, { coached: !entry.coached }); if (!entry.coached) go(1); }}
            className={`flex-1 rounded-2xl px-6 py-5 text-lg font-semibold transition active:scale-[0.98] ring-1
              ${entry.coached
                ? 'bg-calm/15 text-calm ring-calm/40'
                : `bg-aqua text-abyss ring-transparent ${tone?.ring ?? ''}`}`}
          >
            {entry.coached ? 'Đã sửa · bấm để bỏ đánh dấu' : 'Đã sửa cho em này'}
          </button>

          <button
            onClick={() => go(1)}
            disabled={i >= total - 1}
            aria-label="Em tiếp theo"
            className="rounded-2xl border border-line bg-surface/70 px-6 py-5 text-2xl transition active:scale-95 disabled:opacity-30"
          >
            →
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-dim">
          Vuốt ngang hoặc bấm mũi tên để sang em khác. Nhận xét kỹ thuật, không phải giấy chứng nhận an toàn.
        </p>
      </footer>
    </div>
  );
}
