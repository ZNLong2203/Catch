'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[catch]', error); }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-xl font-semibold tracking-tight">Có gì đó hỏng</h1>
      <p className="mt-3 text-sm leading-relaxed text-mist">
        Buổi học của thầy vẫn còn nguyên trong máy, không mất gì. Thử lại là được.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-dim">mã lỗi {error.digest}</p>}
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="rounded-xl bg-aqua px-4 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110">
          Thử lại
        </button>
        <a href="/" className="rounded-xl border border-line bg-surface/60 px-4 py-2.5 text-sm font-medium transition hover:border-aqua/35">
          Về trang đầu
        </a>
      </div>
    </div>
  );
}
