import { BY_CODE } from './faults';
import { liveFaults, type Entry, type Session } from './session';
import type { FaultCode } from './types';

/** So một em hôm nay với chính em đó ở buổi trước.
 *
 *  Đây là câu hỏi mà chấm từng buổi rời rạc không trả lời được: *việc dạy hôm
 *  trước có ăn thua gì không*. Một công cụ chỉ biết chỉ ra lỗi thì mãi mãi chỉ
 *  là cái máy soi; biết nói "lỗi này thầy sửa rồi và nó hết rồi" thì mới khép
 *  được vòng dạy học.
 *
 *  Ghép theo TÊN, vì đó là thứ duy nhất thầy nhập. Nên phải chuẩn hoá tay:
 *  "Bình", "bình ", "BÌNH" là một em. */
export const normalizeLabel = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, ' ');

export type Progress = {
  /** Buổi được đem ra so */
  previousDate: string;
  /** Lỗi buổi trước có, hôm nay hết */
  fixed: FaultCode[];
  /** Lỗi hôm nay mới xuất hiện */
  appeared: FaultCode[];
  /** Lỗi cả hai buổi đều có */
  persisting: FaultCode[];
};

/** Buổi gần nhất trước buổi hiện tại có chấm em này.
 *
 *  Chỉ so với MỘT buổi gần nhất, không so với trung bình cả khoá: thầy cần biết
 *  "so với lần trước" để quyết việc cho buổi sau, không cần một đường xu hướng. */
export function compareWithPrevious(
  entry: Entry, archive: Session[], skill = entry.skill,
): Progress | null {
  const key = normalizeLabel(entry.label);
  if (!key) return null;

  const past = [...archive]
    .sort((a, b) => a.date.localeCompare(b.date))
    .reverse()
    .map((s) => ({
      date: s.date,
      entry: s.entries.find((e) => normalizeLabel(e.label) === key && e.skill === skill),
    }))
    .find((x) => x.entry);

  if (!past?.entry) return null;

  const then = new Set(liveFaults(past.entry).map((f) => f.code));
  const now = new Set(liveFaults(entry).map((f) => f.code));

  return {
    previousDate: past.date,
    fixed: [...then].filter((c) => !now.has(c)),
    appeared: [...now].filter((c) => !then.has(c)),
    persisting: [...now].filter((c) => then.has(c)),
  };
}

export type ClassProgress = {
  code: FaultCode;
  label: string;
  then: number;
  now: number;
  total: number;
  previousDate: string;
};

/** Cả lớp có tiến bộ ở lỗi nào không.
 *
 *  "Buổi trước tám trên mười hai em ngẩng đầu quá cao, hôm nay còn ba" — đây là
 *  loại câu mà một buổi học đơn lẻ không bao giờ nói được, và là bằng chứng gần
 *  nhất với "việc dạy có tác dụng" mà Catch có thể đưa ra. */
export function classProgress(current: Session, archive: Session[]): ClassProgress[] {
  const previous = [...archive]
    .filter((s) => s.entries.length > 0 && s.date <= current.date && s.id !== current.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
  if (!previous) return [];

  const count = (s: Session) => {
    const m = new Map<FaultCode, Set<string>>();
    for (const e of s.entries) {
      for (const f of liveFaults(e)) {
        const set = m.get(f.code) ?? new Set<string>();
        set.add(normalizeLabel(e.label));
        m.set(f.code, set);
      }
    }
    return m;
  };

  const before = count(previous);
  const after = count(current);
  const codes = new Set([...before.keys(), ...after.keys()]);

  return [...codes]
    .map((code) => ({
      code,
      label: BY_CODE.get(code)!.label,
      then: before.get(code)?.size ?? 0,
      now: after.get(code)?.size ?? 0,
      total: current.entries.length,
      previousDate: previous.date,
    }))
    // Chỉ nói về lỗi buổi trước có — không có gì để so thì không có gì để nói
    .filter((c) => c.then > 0)
    .sort((a, b) => (b.then - b.now) - (a.then - a.now));
}
