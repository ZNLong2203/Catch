'use client';

import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Session } from '@/lib/session';
import { DatePicker } from './DatePicker';
import { SyncBadge } from './SyncBadge';
import type { SyncState } from './useSession';

/** Thanh nhận diện buổi học: lớp nào, ngày nào, đã chấm mấy em.
 *
 *  Ba thứ này thầy đặt một lần đầu buổi rồi thôi, nên chúng dồn về bên trái
 *  thành một cụm và nhường hẳn bên phải cho con số em đã chấm — thứ duy nhất
 *  ở đây thay đổi trong lúc làm việc, và là thứ thầy liếc lên nhìn. */
export function SessionBar({
  session, ready, onChange, syncState, user, onSignIn, onSignOut,
}: {
  session: Session; ready: boolean; onChange: (patch: Partial<Session>) => void;
  syncState: SyncState; user: User | null;
  onSignIn: () => Promise<unknown>; onSignOut: () => Promise<unknown>;
}) {
  const n = session.entries.length;

  return (
    <div className="card flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 whitespace-nowrap">
        <label className="flex items-center gap-2">
          <span className="eyebrow shrink-0">Lớp</span>
          <input
            value={session.className}
            onChange={(e) => onChange({ className: e.target.value })}
            placeholder="4A"
            aria-label="Tên lớp"
            className="w-20 rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm transition-colors placeholder:text-dim/60 hover:border-aqua/40 focus:border-aqua/50"
          />
        </label>

        <span aria-hidden className="hidden h-6 w-px shrink-0 bg-line sm:block" />

        <div className="flex items-center gap-2">
          <span className="eyebrow shrink-0">Buổi</span>
          <DatePicker value={session.date} onChange={(date) => onChange({ date })} />
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2 whitespace-nowrap">
        {ready && <SyncBadge state={syncState} user={user} onSignIn={onSignIn} onSignOut={onSignOut} />}
        <span className="text-sm text-mist" aria-live="polite">
          {ready ? (n === 0 ? 'chưa chấm em nào' : `${n} em đã chấm`) : ' '}
        </span>
        {n > 0 && (
          <Link
            href="/session"
            className="flex items-center gap-1.5 rounded-lg border border-aqua/35 bg-aqua/[0.08] px-3 py-1.5 text-sm font-medium text-aqua transition hover:bg-aqua/[0.14]"
          >
            Thứ tự ưu tiên
            <ArrowRightIcon aria-hidden className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
