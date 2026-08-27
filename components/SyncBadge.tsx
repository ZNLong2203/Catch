'use client';

import { useState } from 'react';
import { CloudIcon, CloudOffIcon, LoaderIcon } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { SyncState } from './useSession';

/** Buổi học đang nằm ở đâu — nói đúng, đừng nói cho êm tai.
 *
 *  Chỗ dễ nói dối nhất trong cả sản phẩm là ở đây. Khi mới chỉ có tài khoản ẩn
 *  danh thì dữ liệu ĐÃ nằm trên Firestore thật, nhưng đường về nó là một danh
 *  tính lưu trong trình duyệt này — xoá dữ liệu duyệt web là mất. Gọi trạng thái
 *  đó là "đã lưu trên đám mây" thì thầy sẽ tin và không sao lưu gì nữa, rồi mất
 *  cả khoá học. Nên nó được gọi đúng tên: "chỉ máy này". */
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
        chỉ máy này
      </span>
    );
  }

  if (state === 'account') {
    const who = user?.email ?? user?.displayName ?? 'đã đăng nhập';
    return (
      <span className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-calm" title={`Đang đồng bộ với ${who}`}>
          <CloudIcon aria-hidden className="size-3.5" />
          <span className="max-w-[10rem] truncate">{who}</span>
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
      {busy ? 'đang mở…' : 'chỉ máy này — đăng nhập'}
    </button>
  );
}
