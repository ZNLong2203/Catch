import { BY_CODE, rank } from './faults';
import type { Fault, FaultCode, Skill } from './types';

/** "01:24" → 84. Nhận cả "1:24", "01:02:03" và số giây trần.
 *  Gemini trả mốc theo MM:SS (nó lấy mẫu video 1 khung/giây và đánh mốc theo giây). */
export function toSeconds(raw: unknown): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) ? Math.max(0, raw) : null;
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) return Math.max(0, Number(s));
  if (!/^\d{1,2}(:\d{1,2}){1,2}$/.test(s)) return null;
  const parts = s.split(':').map(Number);
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  // Chặn "01:99" — model thỉnh thoảng trả giây quá 59
  if (parts.slice(1).some((n) => n > 59)) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

export type RawFault = {
  code?: unknown; at?: unknown; confidence?: unknown; evidence?: unknown; note?: unknown;
};

/** Cổng chặn phía máy chủ — hàm thuần, tách riêng để kiểm được.
 *
 *  Bỏ một lỗi khi:
 *    · không có mốc thời gian hợp lệ  → thầy không bấm vào kiểm được thì không tin được
 *    · mã lỗi không có trong bảng      → model bịa
 *    · mã thuộc kiểu bơi khác          → model mượn mã, đã gặp ngày 26/08
 *    · mốc nằm ngoài thời lượng video  → model đoán
 *
 *  Trả về cả số lượng bị bỏ để hiện ra giao diện. Bỏ trong im lặng là nói dối. */
export function normalizeFaults(
  raw: RawFault[] | undefined, skill: Skill, durationSec?: number,
): { faults: Fault[]; dropped: number } {
  let dropped = 0;
  const faults: Fault[] = [];

  for (const f of raw ?? []) {
    const spec = typeof f.code === 'string' ? BY_CODE.get(f.code as FaultCode) : undefined;
    const at = toSeconds(f.at);
    const outOfRange = durationSec != null && durationSec > 0 && at != null && at > durationSec + 1;

    if (!spec || spec.skill !== skill || at === null || outOfRange) { dropped++; continue; }

    const note = String(f.note ?? '').trim();
    const evidence = String(f.evidence ?? '').trim();
    // Không có bằng chứng thị giác thì lỗi này vô dụng với thầy — bỏ luôn.
    if (!evidence) { dropped++; continue; }

    faults.push({
      code: spec.code,
      at,
      confidence: Math.min(1, Math.max(0, Number(f.confidence) || 0)),
      evidence,
      note: note || spec.label,
    });
  }

  // Trùng mã thì giữ lần xuất hiện chắc nhất
  const best = new Map<FaultCode, Fault>();
  for (const f of faults) {
    const cur = best.get(f.code);
    if (!cur || f.confidence > cur.confidence) best.set(f.code, f);
  }
  dropped += faults.length - best.size;

  return { faults: [...best.values()].sort(rank), dropped };
}

/** Chấm hai lượt, chỉ giữ lỗi xuất hiện ở CẢ HAI.
 *
 *  Cùng một video, cùng một prompt, hai lượt gọi độc lập. Lỗi nào model thật sự
 *  nhìn thấy thì lượt nào cũng thấy; lỗi nào là suy đoán trôi nổi thì lượt sau
 *  thường không lặp lại. Đây là cách rẻ nhất để bóc bớt thứ nghe có lý mà không
 *  có thật — và trong một sản phẩm mà thầy sẽ tin rồi đi sửa cho học sinh, thứ
 *  nghe có lý mà không có thật mới là thứ nguy hiểm.
 *
 *  Độ tin cậy lấy mức THẤP hơn của hai lượt, không lấy trung bình: hai lượt bất
 *  đồng về mức chắc chắn thì phải nghiêng về phía dè dặt.
 *  Mốc thời gian lấy theo lượt chắc hơn. */
export function intersectPasses(a: Fault[], b: Fault[]): { faults: Fault[]; unconfirmed: number } {
  const second = new Map(b.map((f) => [f.code, f]));
  const kept: Fault[] = [];

  for (const f of a) {
    const other = second.get(f.code);
    if (!other) continue;
    const stronger = other.confidence > f.confidence ? other : f;
    kept.push({
      ...stronger,
      confidence: Math.min(f.confidence, other.confidence),
      confirmed: true,
    });
  }

  const union = new Set([...a.map((f) => f.code), ...b.map((f) => f.code)]);
  return { faults: kept.sort(rank), unconfirmed: union.size - kept.length };
}
