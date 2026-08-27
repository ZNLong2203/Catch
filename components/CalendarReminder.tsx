'use client';

import { useState } from 'react';
import { CalendarPlusIcon, CheckIcon, ExternalLinkIcon, LoaderIcon } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { combineDateTime, SESSION_MINUTES, createReminder } from '@/lib/calendar';
import { nextSessionPlan } from '@/lib/plan';
import { linkGoogle, CALENDAR_SCOPE } from '@/lib/firebase.client';
import type { Session } from '@/lib/session';
import { toISO } from '@/lib/time';

/** Đưa việc của buổi sau vào lịch của thầy.
 *
 *  ⚠️ HIỆN KHÔNG ĐƯỢC GẮN VÀO GIAO DIỆN. Cố ý, không phải sót.
 *
 *  Quyền `calendar.events` là quyền nhạy cảm của Google. Chưa qua duyệt xét thì
 *  màn hình đồng ý hiện *"Google hasn't verified this app"* và bắt người dùng bấm
 *  *Advanced → Go to Catch (unsafe)*. Duyệt xét mất vài tuần.
 *
 *  Với một sản phẩm lấy an toàn trẻ em làm gốc, dựng một màn hình cảnh báo bảo mật
 *  chắn giữa đường đắt hơn nhiều so với tiện ích mà cái nhắc này mang lại. Nên nút
 *  được gỡ khỏi bảng ưu tiên, còn mã thì giữ nguyên — kể cả bảy phép thử trong
 *  test/calendar.test.ts.
 *
 *  Gắn lại: thêm `<CalendarReminder session={session} archive={archive} />` vào
 *  hàng nút trong PriorityBoard, sau khi Google duyệt xét xong. Ba việc phải bật
 *  trong Console nằm ở docs/DEPLOYMENT.md.
 *
 *  Nội dung do `lib/plan.ts` dựng, và tệp đó có luật cứng: không tên em, không
 *  lỗi của từng em. Xem chú thích ở đó để biết vì sao — tóm tắt: lịch rò rỉ dễ
 *  hơn hẳn cơ sở dữ liệu có luật đứng gác.
 *
 *  Mỗi lần bấm là một lần xin quyền qua cửa sổ Google. Cố ý: Firebase chỉ trả
 *  thẻ truy cập Google ở đúng thời điểm đăng nhập, thẻ sống khoảng một giờ và
 *  không gia hạn được. Cất lại để dùng sau chỉ đổi một cửa sổ bật lên lấy một
 *  lỗi 401 khó hiểu vào tuần sau. */
export function CalendarReminder({
  session, archive,
}: {
  session: Session; archive: Session[];
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toISO(d);
  });
  const [time, setTime] = useState('15:00');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ link: string | null } | null>(null);

  async function create() {
    const start = combineDateTime(date, time);
    if (!start) { setError('Ngày hoặc giờ chưa hợp lệ.'); return; }

    setBusy(true);
    setError(null);
    try {
      const auth = await linkGoogle([CALENDAR_SCOPE]);
      if (!auth.ok) { if (auth.why) setError(auth.why); return; }
      if (!auth.token) {
        setError('Google không trả về quyền ghi lịch. Bấm lại và chọn Cho phép ở màn hình đồng ý.');
        return;
      }
      const plan = nextSessionPlan(session, archive, window.location.origin);
      const result = await createReminder(auth.token, plan, start);
      if (result.ok) { setDone({ link: result.link }); setOpen(false); }
      else setError(result.why);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <span className="flex items-center gap-2 rounded-xl border border-calm/35 bg-calm/[0.08] px-3.5 py-2 text-sm text-calm">
        <CheckIcon aria-hidden className="size-4 shrink-0" />
        Đã thêm vào lịch
        {done.link && (
          <a href={done.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
            Mở <ExternalLinkIcon aria-hidden className="size-3.5" />
          </a>
        )}
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-sm text-mist transition-colors hover:border-aqua/40 hover:text-foam"
      >
        <CalendarPlusIcon aria-hidden className="size-4" />
        Nhắc vào Google Calendar
      </button>
    );
  }

  return (
    <div className="card w-full space-y-3 p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="eyebrow shrink-0">Buổi sau</span>
        <DatePicker value={date} onChange={setDate} direction="future" />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Giờ bắt đầu"
          className="rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm [color-scheme:dark] focus:border-aqua/50"
        />
        <span className="text-xs text-dim">{SESSION_MINUTES} phút · nhắc trước 30 phút</span>
      </div>

      <p className="text-[13px] leading-relaxed text-dim">
        Nhắc chỉ ghi con số mức lớp và việc cần dạy chung —{' '}
        <strong className="font-semibold text-mist">không có tên em nào</strong>. Lịch hay được
        chia sẻ trong trường, nên hồ sơ từng em ở lại trong Catch.
      </p>

      {error && <p role="alert" className="text-[13px] leading-relaxed text-danger">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={create}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-aqua px-3.5 py-2 text-sm font-semibold text-abyss transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <LoaderIcon aria-hidden className="size-4 animate-spin" /> : <CalendarPlusIcon aria-hidden className="size-4" />}
          {busy ? 'Đang tạo…' : 'Tạo nhắc'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="rounded-xl px-3 py-2 text-sm text-dim transition-colors hover:text-mist"
        >
          Thôi
        </button>
      </div>
    </div>
  );
}
