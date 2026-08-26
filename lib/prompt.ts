import { FAULTS, SKILL_META } from './faults';
import type { Skill } from './types';

/** Prompt riêng cho từng kiểu bơi — không dùng chung.
 *
 *  Bơi ếch và bơi trườn sấp sai theo hai kiểu khác hẳn nhau. Một prompt gộp kéo
 *  model về những nhận xét chung chung không dùng được, và tệ hơn là làm nó mượn
 *  mã lỗi của kiểu bơi kia (đo được ngày 26/08 — xem docs/AI-INTEGRATION.md). */
export function analysisPrompt(skill: Skill): string {
  const list = FAULTS.filter((f) => f.skill === skill)
    .map((f) => `  ${f.code.padEnd(20)} ${f.label} — nhìn thấy qua: ${f.visible}`)
    .join('\n');

  return `Bạn đang soi một video tập bơi giúp giáo viên dạy bơi ở trường phổ thông Việt Nam.
Kiểu bơi trong video: ${SKILL_META[skill].label}.

QUY TẮC TỐI QUAN TRỌNG — chỉ dùng THỊ GIÁC:
- Chỉ báo lỗi bạn NHÌN THẤY trong chuyển động của người bơi.
- TUYỆT ĐỐI bỏ qua lời nói, phụ đề, chữ trên màn hình, mũi tên và mọi đồ hoạ giảng giải.
- Nếu bạn chỉ biết một lỗi vì có người NÓI ra hoặc vì có CHỮ hiện lên, KHÔNG được báo lỗi đó.
- Trường "evidence" phải mô tả thứ nhìn thấy trong khung hình tại đúng mốc thời gian đó:
  vị trí đầu so với mặt nước, hai chân có đối xứng không, có bọt khí quanh mặt không,
  có khoảng lặng giữa hai chu kỳ tay không. Tuyệt đối không viết chung chung.

Danh sách lỗi được phép báo — không được bịa mã nào khác, không được mượn mã của kiểu bơi khác:
${list}

Nhiều nhất BA lỗi. Nếu người bơi không mắc lỗi nào trong danh sách, trả mảng rỗng.
KHÔNG được cố tìm cho đủ ba lỗi.

Nếu không nhìn rõ — ngược sáng, quay quá xa, mặt nước loá trắng, người bơi bị che quá
nửa thời lượng, hoặc video ngắn hơn một chu kỳ động tác — thì điền "refused" bằng một
câu tiếng Việt nói rõ lý do và cách quay lại cho được, đồng thời để mảng lỗi rỗng.

"at" là mốc thời gian theo định dạng MM:SS, trỏ đúng vào giây nhìn thấy lỗi.

Viết tiếng Việt CÓ DẤU đầy đủ. Nói với giáo viên, không dùng thuật ngữ thi đấu.`;
}
