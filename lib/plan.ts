import { BY_CODE } from './faults';
import { classProgress } from './progress';
import { CLASS_WIDE, commonFaults, worstSeverity, type Session } from './session';
import { formatDate } from './time';

/** Nội dung nhắc buổi sau, dạng chữ trơn cho một sự kiện lịch.
 *
 *  ⚠️ Luật cứng: KHÔNG tên em, KHÔNG lỗi của từng em. Lịch rò rỉ dễ hơn hẳn
 *  Firestore — chia sẻ trong Workspace trường, đồng bộ xuống điện thoại, lọt vào
 *  lời mời họp. `commonFaults()` có trả về mảng tên em; chỗ này chỉ được dùng
 *  `students.length`, có phép thử canh trong test/plan.test.ts. */
export type Plan = { title: string; description: string };

/** Ba là hết chỗ đọc trên màn hình khoá điện thoại. */
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
