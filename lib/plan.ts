import { BY_CODE } from './faults';
import { classProgress } from './progress';
import { CLASS_WIDE, commonFaults, worstSeverity, type Session } from './session';
import { ngayVN } from './time';

/** Nội dung nhắc cho buổi sau, dạng chữ trơn để nhét vào một sự kiện lịch.
 *
 *  ⚠️ Luật cứng của tệp này: **không tên em, không lỗi của từng em.**
 *
 *  Không phải cẩn thận thừa. Sự kiện lịch rò rỉ dễ hơn hẳn Firestore — lịch được
 *  chia sẻ trong Workspace của trường, đồng bộ xuống điện thoại, hiện ra cho
 *  người được uỷ quyền, và lọt vào lời mời họp. Một dòng "Em Nguyễn Văn A: vùng
 *  vẫy, nguy hiểm ở chỗ sâu" nằm trong lịch là hồ sơ đánh giá một đứa trẻ đặt ở
 *  chỗ không ai kiểm soát được nữa.
 *
 *  Nên ở đây chỉ có **con số mức lớp** và **việc cần dạy chung**. Muốn biết em
 *  nào thì mở Catch — chỗ có luật bảo mật đứng gác.
 *
 *  `commonFaults()` trả về cả mảng `students` chứa tên em. Chỗ này chỉ được dùng
 *  `students.length`. Có phép thử canh đúng điều đó trong test/plan.test.ts. */
export type Plan = { title: string; description: string };

/** Bao nhiêu lỗi dạy chung đưa vào nhắc. Ba là hết chỗ đọc trên màn hình khoá
 *  điện thoại — thầy liếc lịch trước giờ dạy chứ không ngồi đọc. */
const SO_LOI_DAY_CHUNG = 3;

export function nextSessionPlan(
  session: Session,
  archive: Session[],
  linkCatch: string,
): Plan {
  const lop = session.className.trim();
  const title = lop ? `Bơi — Lớp ${lop}` : 'Bơi — buổi sau';

  const soEm = session.entries.length;
  const soEmDo = session.entries.filter((e) => worstSeverity(e) === 'red').length;

  const dayChung = commonFaults(session.entries)
    .filter((c) => c.share >= CLASS_WIDE && c.students.length >= 2)
    .slice(0, SO_LOI_DAY_CHUNG);

  const tienBo = classProgress(session, archive)
    .filter((c) => c.then !== c.now)
    .slice(0, SO_LOI_DAY_CHUNG);

  const dong: string[] = [];

  dong.push(
    soEm === 0
      ? 'Buổi trước chưa chấm em nào.'
      : soEmDo > 0
        ? `${soEmDo} trên ${soEm} em có lỗi nhóm nguy hiểm ở chỗ sâu — sửa trước tiên.`
        : `Đã chấm ${soEm} em, không em nào rơi vào nhóm nguy hiểm ở chỗ sâu.`,
  );

  if (dayChung.length > 0) {
    dong.push('', 'DẠY CHUNG CẢ LỚP');
    for (const c of dayChung) {
      // students.length — KHÔNG phải students
      dong.push(`• ${c.spec.label} — ${c.students.length}/${soEm} em`);
      dong.push(`  ${c.spec.drill}`);
    }
  }

  if (tienBo.length > 0) {
    dong.push('', `SO VỚI BUỔI ${ngayVN(tienBo[0].previousDate)}`);
    for (const c of tienBo) {
      const dau = c.now < c.then ? '↓' : '↑';
      dong.push(`• ${BY_CODE.get(c.code)!.label}: ${c.then} → ${c.now} em ${dau}`);
    }
  }

  dong.push('', `Xem từng em: ${linkCatch.replace(/\/+$/, '')}/session`);
  dong.push('', 'Nhắc này cố ý không ghi tên em nào — lịch hay được chia sẻ trong trường.');

  return { title, description: dong.join('\n') };
}
