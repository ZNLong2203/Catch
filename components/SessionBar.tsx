'use client';

import Link from 'next/link';
import type { Session } from '@/lib/session';

export function SessionBar({
  session, ready, onChange,
}: {
  session: Session; ready: boolean; onChange: (patch: Partial<Session>) => void;
}) {
  const n = session.entries.length;

  return (
    <div className="card flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2">
          <span className="eyebrow shrink-0">Lớp</span>
          <input
            value={session.className}
            onChange={(e) => onChange({ className: e.target.value })}
            placeholder="4A"
            aria-label="Tên lớp"
            className="w-24 rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm placeholder:text-dim/60 focus:border-aqua/50"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="eyebrow shrink-0">Buổi</span>
          <input
            type="date"
            value={session.date}
            onChange={(e) => onChange({ date: e.target.value })}
            aria-label="Ngày học"
            className="rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm [color-scheme:dark] focus:border-aqua/50"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-mist" aria-live="polite">
          {ready ? (n === 0 ? 'chưa chấm em nào' : `${n} em đã chấm`) : ' '}
        </span>
        {n > 0 && (
          <Link
            href="/session"
            className="rounded-lg border border-aqua/35 bg-aqua/[0.08] px-3 py-1.5 text-sm font-medium text-aqua transition hover:bg-aqua/[0.14]"
          >
            Thứ tự ưu tiên →
          </Link>
        )}
      </div>
    </div>
  );
}
