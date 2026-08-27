'use client';

import Link from 'next/link';
import { Brand } from '@/components/Brand';
import { PriorityBoard } from '@/components/PriorityBoard';
import { useSession } from '@/components/useSession';
import { formatDate } from '@/lib/time';

export default function SessionPage() {
  const { session, archive, ready, removeEntry, clearEntries, finishSession, exportBackup, importBackup } = useSession();

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-8 sm:px-8">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Brand />
          <Link href="/" className="text-sm text-dim transition hover:text-aqua">← Về chỗ chấm</Link>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Thứ tự ưu tiên cho buổi sau</h1>
        <p className="mt-1.5 text-sm text-mist">
          {session.className ? `Lớp ${session.className}` : 'Chưa đặt tên lớp'}{ready && ` · ${formatDate(session.date)}`}
        </p>
      </header>

      {ready ? (
        <PriorityBoard
          session={session}
          archive={archive}
          onRemove={removeEntry}
          onClear={clearEntries}
          onFinish={finishSession}
          onExport={exportBackup}
          onImport={importBackup}
        />
      ) : (
        <div className="card p-8 text-center text-sm text-dim">Đang mở buổi học…</div>
      )}

      <footer className="mt-16 border-t border-line pt-6">
        <p className="text-[13px] leading-relaxed text-mist">
          Buổi học được lưu trong trình duyệt máy này và đồng bộ lên Firebase của dự án.
          Chưa đăng nhập thì dữ liệu gắn với trình duyệt này; đăng nhập Google thì buổi học
          theo tài khoản, mở máy khác vẫn còn. <strong className="font-semibold text-foam">Video
          thì không bao giờ được lưu</strong> — nó đi thẳng lên Gemini và bị xoá ngay sau khi chấm.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-dim">
          Đây là nhận xét kỹ thuật cho những lần bơi trong hồ có người lớn đứng cạnh.
          Không phải giấy chứng nhận an toàn dưới nước.
        </p>
      </footer>
    </div>
  );
}
