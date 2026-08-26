/** Giây → "MM:SS". Dùng chung cho thẻ lỗi, thanh thời gian và bản in.
 *  Cùng định dạng Gemini trả về, nên thầy đối chiếu được không cần quy đổi. */
export const mmss = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
