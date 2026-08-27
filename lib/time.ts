/** Giây → "MM:SS". Dùng chung cho thẻ lỗi, thanh thời gian và bản in.
 *  Cùng định dạng Gemini trả về, nên thầy đối chiếu được không cần quy đổi. */
export const mmss = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

/** 'YYYY-MM-DD' ↔ Date, theo giờ trên máy thầy.
 *
 *  `new Date('2026-08-27')` là mốc nửa đêm UTC. Ở Việt Nam nó vẫn ra 27/08,
 *  nhưng ở múi giờ âm nó lùi thành 26/08 — và buổi học bị ghi sai một ngày.
 *  Dựng tay theo từng phần thì không bao giờ lệch. */
export function fromISO(iso: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const WEEKDAY_NAMES = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** '2026-08-27' → '27/08/2026'. Thầy đọc ngày kiểu Việt, không đọc ISO. */
export function formatDate(iso: string): string {
  const d = fromISO(iso);
  if (!d) return iso;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** Nhãn ngắn cho ô chọn ngày: "Hôm nay · 27/08".
 *
 *  Hai chữ đầu thầy liếc là biết, còn con số thì phải đọc. Năm chỉ hiện khi
 *  buổi không thuộc năm nay — bày thêm bốn chữ số cho một buổi hôm qua chỉ
 *  làm thanh này dài ra và đẩy nút "Thứ tự ưu tiên" xuống dòng. */
export function formatDateRelative(iso: string, now = new Date()): string {
  const d = fromISO(iso);
  if (!d) return iso;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  const prefix = days === 0 ? 'Hôm nay' : days === -1 ? 'Hôm qua' : days === 1 ? 'Ngày mai' : WEEKDAY_NAMES[d.getDay()];
  const dayMonth = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix} · ${dayMonth}${d.getFullYear() === now.getFullYear() ? '' : `/${d.getFullYear()}`}`;
}
