import { BY_CODE } from './faults';
import { classProgress } from './progress';
import { CLASS_WIDE, commonFaults, worstSeverity, type Session } from './session';
import { formatDate } from './time';

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
const MAX_CLASS_WIDE_FAULTS = 3;

export function nextSessionPlan(
  session: Session,
  archive: Session[],
  appUrl: string,
): Plan {
  const className = session.className.trim();
  const title = className ? `Bơi — Lớp ${className}` : 'Bơi — buổi sau';

  const total = session.entries.length;
  const atRisk = session.entries.filter((e) => worstSeverity(e) === 'red').length;

  const classWide = commonFaults(session.entries)
    .filter((c) => c.share >= CLASS_WIDE && c.students.length >= 2)
    .slice(0, MAX_CLASS_WIDE_FAULTS);

  const progress = classProgress(session, archive)
    .filter((c) => c.then !== c.now)
    .slice(0, MAX_CLASS_WIDE_FAULTS);

  const lines: string[] = [];

  lines.push(
    total === 0
      ? 'Buổi trước chưa chấm em nào.'
      : atRisk > 0
        ? `${atRisk} trên ${total} em có lỗi nhóm nguy hiểm ở chỗ sâu — sửa trước tiên.`
        : `Đã chấm ${total} em, không em nào rơi vào nhóm nguy hiểm ở chỗ sâu.`,
  );

  if (classWide.length > 0) {
    lines.push('', 'DẠY CHUNG CẢ LỚP');
    for (const c of classWide) {
      // students.length — KHÔNG phải students
      lines.push(`• ${c.spec.label} — ${c.students.length}/${total} em`);
      lines.push(`  ${c.spec.drill}`);
    }
  }

  if (progress.length > 0) {
    lines.push('', `SO VỚI BUỔI ${formatDate(progress[0].previousDate)}`);
    for (const c of progress) {
      const arrow = c.now < c.then ? '↓' : '↑';
      lines.push(`• ${BY_CODE.get(c.code)!.label}: ${c.then} → ${c.now} em ${arrow}`);
    }
  }

  lines.push('', `Xem từng em: ${appUrl.replace(/\/+$/, '')}/session`);
  lines.push('', 'Nhắc này cố ý không ghi tên em nào — lịch hay được chia sẻ trong trường.');

  return { title, description: lines.join('\n') };
}
