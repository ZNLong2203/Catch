'use client';

import { useState } from 'react';
import { CloudIcon, CloudOffIcon, LoaderIcon } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { SyncState } from './useSession';

/** Chỗ dễ nói dối nhất sản phẩm. Tài khoản ẩn danh có dữ liệu thật trên Firestore,
 *  nhưng đường về nó nằm trong trình duyệt này — xoá dữ liệu duyệt web là mất. Gọi
 *  là "đã lưu trên đám mây" thì thầy tin và không sao lưu nữa. Nên gọi đúng tên. */
export function SyncBadge({
  state, user, onSignIn, onSignOut,
}: {
  state: SyncState;
  user: User | null;
  onSignIn: () => Promise<unknown>;
  onSignOut: () => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);

  if (state === 'off') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-dim" title="Chưa cấu hình Firebase — buổi học chỉ nằm trong trình duyệt này">
        <CloudOffIcon aria-hidden className="size-3.5" />
        <span className="hidden sm:inline">chỉ máy này</span>
      </span>
    );
  }

  if (state === 'account') {
    const who = user?.email ?? user?.displayName ?? 'đã đăng nhập';
    return (
      <span className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-calm" title={`Đang đồng bộ với ${who}`}>
          <CloudIcon aria-hidden className="size-3.5" />
          <span className="hidden max-w-[10rem] truncate sm:inline">{who}</span>
        </span>
        <button
          type="button"
          onClick={async () => { setBusy(true); try { await onSignOut(); } finally { setBusy(false); } }}
          disabled={busy}
          className="rounded-md px-1.5 py-0.5 text-xs text-dim transition-colors hover:bg-raised hover:text-mist disabled:opacity-50"
        >
          Thoát
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => { setBusy(true); try { await onSignIn(); } finally { setBusy(false); } }}
      disabled={busy}
      title="Chưa đăng nhập: buổi học đã lên Firebase nhưng gắn với trình duyệt này. Đăng nhập thì mở máy khác vẫn còn."
      className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs text-mist transition-colors hover:border-aqua/40 hover:text-foam disabled:opacity-50"
    >
      {busy
        ? <LoaderIcon aria-hidden className="size-3.5 animate-spin" />
        : <CloudOffIcon aria-hidden className="size-3.5" />}
      <span className="hidden sm:inline">{busy ? 'đang mở…' : 'chỉ máy này — đăng nhập'}</span>
    </button>
  );
}
