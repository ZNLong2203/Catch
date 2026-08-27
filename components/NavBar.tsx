'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRightIcon } from 'lucide-react';
import { Brand } from './Brand';
import { DatePicker } from './DatePicker';
import { SyncBadge } from './SyncBadge';
import { useSessionStore } from './SessionProvider';

/** Thanh trên cùng: đang là ai, đang chấm lớp nào buổi nào, đã chấm mấy em.
 *
 *  Ba thứ này trước đây nằm rải: nhận diện ở đầu trang, lớp và buổi ở giữa thân
 *  trang chấm, còn bảng ưu tiên thì phải cuộn xuống mới thấy đường sang. Gom lại
 *  một chỗ và ghim trên đỉnh — vì chúng là thứ thầy liếc chứ không phải thứ thầy
 *  thao tác: đặt tên lớp một lần đầu buổi, rồi cả buổi chỉ nhìn con số em đã chấm.
 *
 *  KHÔNG hiện ở chế độ bờ hồ và trang in. Bờ hồ cố ý bỏ gần hết mọi thứ — thầy
 *  đứng cạnh hồ, tay ướt, nắng chói. Trang in thì ra giấy, một thanh điều hướng
 *  in ra là một thanh vô nghĩa. */
const KHONG_HIEN = ['/session/poolside', '/session/print'];

export function NavBar() {
  const path = usePathname();
  const {
    session, ready, update, syncState, user, signIn, signOutTeacher,
  } = useSessionStore();

  if (KHONG_HIEN.includes(path)) return null;

  const n = session.entries.length;
  const onBoard = path === '/session';

  return (
    /* Chỉ ghim từ màn hình vừa trở lên. Trên điện thoại thanh này xuống bốn dòng
       và chiếm một phần tư chiều cao — ghim cố định ở đó là lấy mất chỗ của thứ
       thầy đang thực sự đọc. Để nó cuộn đi như phần đầu trang bình thường. */
    <header className="z-40 border-b border-line/70 bg-abyss/80 backdrop-blur-md sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 sm:px-8">
        <Brand />

        <span aria-hidden className="hidden h-6 w-px shrink-0 bg-line sm:block" />

        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 whitespace-nowrap">
          <label className="flex items-center gap-2">
            <span className="eyebrow hidden shrink-0 sm:inline">Lớp</span>
            <input
              value={session.className}
              onChange={(e) => update((s) => ({ ...s, className: e.target.value }))}
              placeholder="4A"
              aria-label="Tên lớp"
              className="w-20 rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm transition-colors placeholder:text-dim/60 hover:border-aqua/40 focus:border-aqua/50"
            />
          </label>

          <div className="flex items-center gap-2">
            <span className="eyebrow hidden shrink-0 sm:inline">Buổi</span>
            <DatePicker
              value={session.date}
              onChange={(date) => update((s) => ({ ...s, date }))}
              ready={ready}
            />
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2 whitespace-nowrap">
          {ready && (
            <SyncBadge state={syncState} user={user} onSignIn={signIn} onSignOut={signOutTeacher} />
          )}
          <span className="text-sm text-mist" aria-live="polite">
            {ready ? (n === 0 ? 'chưa chấm em nào' : `${n} em đã chấm`) : ' '}
          </span>

          {/* Đang đứng ở bảng ưu tiên rồi thì đường ra là quay về chỗ chấm,
              không phải một cái link trỏ vào chính trang đang mở. */}
          {onBoard ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-mist transition hover:border-aqua/40 hover:text-foam"
            >
              ← Về chỗ chấm
            </Link>
          ) : n > 0 && (
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
    </header>
  );
}
