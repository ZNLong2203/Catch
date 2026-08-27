'use client';

import { useState } from 'react';
import { CalendarPlusIcon, CheckIcon, ExternalLinkIcon, LoaderIcon } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { ghepMoc, PHUT_MOT_BUOI, taoNhacLich } from '@/lib/calendar';
import { nextSessionPlan } from '@/lib/plan';
import { linkGoogle, SCOPE_LICH } from '@/lib/firebase.client';
import type { Session } from '@/lib/session';
import { toISO } from '@/lib/time';

/** Đưa việc của buổi sau vào lịch của thầy.
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
  const [mo, setMo] = useState(false);
  const [ngay, setNgay] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toISO(d);
  });
  const [gio, setGio] = useState('15:00');
  const [dangChay, setDangChay] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [xong, setXong] = useState<{ link: string | null } | null>(null);

  async function tao() {
    const moc = ghepMoc(ngay, gio);
    if (!moc) { setLoi('Ngày hoặc giờ chưa hợp lệ.'); return; }

    setDangChay(true);
    setLoi(null);
    try {
      const dn = await linkGoogle([SCOPE_LICH]);
      if (!dn.ok) { if (dn.why) setLoi(dn.why); return; }
      if (!dn.token) {
        setLoi('Google không trả về quyền ghi lịch. Bấm lại và chọn Cho phép ở màn hình đồng ý.');
        return;
      }
      const plan = nextSessionPlan(session, archive, window.location.origin);
      const kq = await taoNhacLich(dn.token, plan, moc);
      if (kq.ok) { setXong({ link: kq.link }); setMo(false); }
      else setLoi(kq.why);
    } finally {
      setDangChay(false);
    }
  }

  if (xong) {
    return (
      <span className="flex items-center gap-2 rounded-xl border border-calm/35 bg-calm/[0.08] px-3.5 py-2 text-sm text-calm">
        <CheckIcon aria-hidden className="size-4 shrink-0" />
        Đã thêm vào lịch
        {xong.link && (
          <a href={xong.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">
            Mở <ExternalLinkIcon aria-hidden className="size-3.5" />
          </a>
        )}
      </span>
    );
  }

  if (!mo) {
    return (
      <button
        type="button"
        onClick={() => setMo(true)}
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
        <DatePicker value={ngay} onChange={setNgay} huong="sap-toi" />
        <input
          type="time"
          value={gio}
          onChange={(e) => setGio(e.target.value)}
          aria-label="Giờ bắt đầu"
          className="rounded-lg border border-line bg-deep px-2.5 py-1.5 text-sm [color-scheme:dark] focus:border-aqua/50"
        />
        <span className="text-xs text-dim">{PHUT_MOT_BUOI} phút · nhắc trước 30 phút</span>
      </div>

      <p className="text-[13px] leading-relaxed text-dim">
        Nhắc chỉ ghi con số mức lớp và việc cần dạy chung —{' '}
        <strong className="font-semibold text-mist">không có tên em nào</strong>. Lịch hay được
        chia sẻ trong trường, nên hồ sơ từng em ở lại trong Catch.
      </p>

      {loi && <p role="alert" className="text-[13px] leading-relaxed text-danger">{loi}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={tao}
          disabled={dangChay}
          className="flex items-center gap-2 rounded-xl bg-aqua px-3.5 py-2 text-sm font-semibold text-abyss transition hover:brightness-110 disabled:opacity-60"
        >
          {dangChay ? <LoaderIcon aria-hidden className="size-4 animate-spin" /> : <CalendarPlusIcon aria-hidden className="size-4" />}
          {dangChay ? 'Đang tạo…' : 'Tạo nhắc'}
        </button>
        <button
          type="button"
          onClick={() => { setMo(false); setLoi(null); }}
          className="rounded-xl px-3 py-2 text-sm text-dim transition-colors hover:text-mist"
        >
          Thôi
        </button>
      </div>
    </div>
  );
}
