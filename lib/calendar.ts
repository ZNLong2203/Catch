'use client';

import type { Plan } from './plan';

const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/** Một buổi phổ cập bơi là bốn mươi lăm phút — con số nằm ngay trong câu mở đầu
 *  của cả dự án. Không bắt thầy gõ lại thứ đã biết. */
export const PHUT_MOT_BUOI = 45;

/** Nhắc trước nửa tiếng: đủ sớm để thầy còn kịp đọc trên đường ra hồ, đủ muộn
 *  để không bị lẫn vào việc buổi sáng. */
const NHAC_TRUOC_PHUT = 30;

export type KetQuaTaoLich =
  | { ok: true; link: string | null }
  | { ok: false; why: string };

/** Tạo một sự kiện trong lịch chính của thầy.
 *
 *  Thẻ truy cập lấy từ đúng lần bấm nút (xem `linkGoogle` trong firebase.client.ts)
 *  và **không được cất lại**: Firebase chỉ trả thẻ Google ở thời điểm đăng nhập,
 *  nó sống khoảng một giờ và không gia hạn được qua Firebase. Giữ một thẻ hết hạn
 *  rồi dùng lại chỉ tạo ra một lỗi 401 khó hiểu ở lần bấm sau. Mỗi lần tạo nhắc
 *  là một lần xin quyền — đắt hơn một nhịp, nhưng không bao giờ hỏng âm thầm. */
export async function taoNhacLich(
  token: string,
  plan: Plan,
  batDau: Date,
  phut = PHUT_MOT_BUOI,
): Promise<KetQuaTaoLich> {
  const ketThuc = new Date(batDau.getTime() + phut * 60_000);
  const mui = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';

  let res: Response;
  try {
    res = await fetch(API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: plan.title,
        description: plan.description,
        start: { dateTime: batDau.toISOString(), timeZone: mui },
        end: { dateTime: ketThuc.toISOString(), timeZone: mui },
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: NHAC_TRUOC_PHUT }] },
      }),
    });
  } catch {
    return { ok: false, why: 'Không gọi được Google Calendar. Kiểm tra kết nối rồi thử lại.' };
  }

  if (res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: true, link: (data as { htmlLink?: string } | null)?.htmlLink ?? null };
  }

  /* Bốn mã lỗi này có bốn cách xử hoàn toàn khác nhau. Gộp chúng vào một câu
     "tạo nhắc không xong" là bắt thầy đoán, mà ba trong bốn cái thầy tự sửa được. */
  if (res.status === 401) {
    return { ok: false, why: 'Quyền truy cập lịch đã hết hạn. Bấm lại để xin quyền mới.' };
  }
  if (res.status === 403) {
    const chiTiet = await res.text().catch(() => '');
    if (/accessNotConfigured|has not been used|is disabled/i.test(chiTiet)) {
      return { ok: false, why: 'Google Calendar API chưa được bật trong dự án Firebase. Xem docs/DEPLOYMENT.md.' };
    }
    return { ok: false, why: 'Thầy chưa cho Catch quyền ghi vào lịch. Bấm lại rồi chọn Cho phép.' };
  }
  if (res.status === 429 || res.status >= 500) {
    return { ok: false, why: 'Google Calendar đang bận. Chờ một lát rồi thử lại.' };
  }
  return { ok: false, why: `Tạo nhắc không xong (mã ${res.status}).` };
}

/** Ghép ngày (YYYY-MM-DD) với giờ (HH:MM) thành mốc theo giờ máy thầy.
 *  Dựng tay chứ không `new Date('...')` — cùng lý do với `fromISO` trong lib/time.ts. */
export function ghepMoc(ngayISO: string, gio: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ngayISO);
  const t = /^(\d{2}):(\d{2})$/.exec(gio);
  if (!d || !t) return null;
  const m = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[1]), Number(t[2]), 0, 0);
  return Number.isNaN(m.getTime()) ? null : m;
}
