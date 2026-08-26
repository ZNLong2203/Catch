import type { Skill } from './types';

/** Video mẫu để người khác bấm thử ngay, không phải tự ra hồ bơi quay.
 *
 *  Mỗi cái đã chạy thật qua chính API ngày 26/08 với `gemini-3.5-flash-lite`, ở
 *  **chế độ mặc định (chấm hai lượt)**, và **đo ba lượt liên tiếp phải ra kết quả
 *  giống hệt nhau** mới được đưa vào đây. Một nút "Xem thử" hứa một đằng làm một
 *  nẻo còn tệ hơn là không có nút nào.
 *
 *  Video bị loại: `tV_VLp3QWiY` (thả nổi ngửa, 25k token, nhiều người, nhiều đoạn
 *  minh hoạ) — chấm một lượt bốn lần cho ra 3 · 3 · 1 · 0 lỗi. Xem docs/AI-INTEGRATION.md.
 *
 *  Bộ này cố ý gồm cả ba hành vi của sản phẩm, không chỉ mỗi cái hay nhất:
 *    · bắt được lỗi
 *    · im lặng khi người bơi làm đúng — thứ phân biệt "nhìn thấy" với "liệt kê cho đủ"
 *    · từ chối chấm khi không nhìn rõ người bơi */
export type Demo = {
  skill: Skill;
  url: string;
  title: string;
  /** Nói trước cho người bấm biết sắp thấy gì — không giấu bài. */
  expect: string;
  kind: 'faults' | 'clean' | 'refuse';
  /** Thời gian đo được, để người bấm biết chờ bao lâu là bình thường. */
  seconds: number;
};

export const DEMOS: Demo[] = [
  {
    skill: 'treading', url: 'https://www.youtube.com/shorts/4xPs563JZcU',
    title: 'Đứng nước — người tập làm đúng',
    expect: 'Catch không báo lỗi nào. Đây mới là chỗ đáng xem: nó không cố tìm lỗi cho đủ.',
    kind: 'clean', seconds: 4,
  },
  {
    skill: 'backfloat', url: 'https://www.youtube.com/shorts/jpDbg9hxsO8',
    title: 'Thả nổi ngửa — người tập làm đúng',
    expect: 'Không lỗi nào. Chưa tìm được video công khai nào cho thấy trẻ thả nổi SAI — xem ghi chú cuối docs/SKILLS-AND-FAULTS.md.',
    kind: 'clean', seconds: 3,
  },
  {
    skill: 'breaststroke', url: 'https://www.youtube.com/watch?v=3xR3Xkvm7UU',
    title: 'Bơi ếch — lỗi tư thế đầu',
    expect: 'Một lỗi: ngẩng đầu quá cao, ở giây thứ 3.',
    kind: 'faults', seconds: 2,
  },
  {
    skill: 'breaststroke', url: 'https://www.youtube.com/watch?v=NA-aRhs8ZFs',
    title: 'Bơi ếch — vô địch thế giới',
    expect: 'Không lỗi nào. Người bơi đúng kỹ thuật thì Catch im lặng.',
    kind: 'clean', seconds: 2,
  },
  {
    skill: 'freestyle', url: 'https://www.youtube.com/shorts/1MFWaiZoIEk',
    title: 'Trườn sấp — ngẩng đầu để thở',
    expect: 'Một lỗi: ngẩng đầu ra trước thay vì xoay đầu sang bên.',
    kind: 'faults', seconds: 6,
  },
  {
    skill: 'backstroke', url: 'https://www.youtube.com/watch?v=HVZ2VYaIBQM',
    title: 'Bơi ngửa — hông chìm',
    expect: 'Một lỗi: người "ngồi" trong nước, quanh phút 1:03.',
    kind: 'faults', seconds: 7,
  },
  {
    skill: 'butterfly', url: 'https://www.youtube.com/shorts/qt6GL2zO-nM',
    title: 'Bơi bướm — video giảng giải, không có người bơi',
    expect: 'Catch thường từ chối chấm và nói rõ vì sao — đo được 2 trên 3 lượt. Không nhìn rõ thì không đoán.',
    kind: 'refuse', seconds: 5,
  },
];

export const demosFor = (skill: Skill) => DEMOS.filter((d) => d.skill === skill);
