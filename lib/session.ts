import { BY_CODE, SEVERITY_ORDER } from './faults';
import type { Fault, FaultCode, Severity, Skill } from './types';

/** Một buổi học: giáo viên chấm lần lượt từng em, Catch gom lại thành thứ tự ưu tiên.
 *
 *  Toàn bộ buổi học nằm trong localStorage của chính máy giáo viên. Không có cơ sở
 *  dữ liệu, không có tài khoản, không có gì rời khỏi máy — kể cả tên các em.
 *  Xem docs/SAFETY.md. */
export type Entry = {
  id: string;
  label: string;
  skill: Skill;
  faults: Fault[];
  /** Lỗi thầy đã phủ quyết — giữ lại chứ không xoá, để còn lấy lại được */
  dismissed: string[];
  refused?: string;
  createdAt: number;
  /** Thầy đã sửa cho em này ở chế độ bờ hồ rồi. Chỉ là dấu tích cho thầy đỡ
   *  quên giữa ba mươi em, không phải đánh giá gì về em. */
  coached?: boolean;
};

export type Session = {
  id: string;
  className: string;
  date: string;
  entries: Entry[];
};

const KEY = 'catch:session:v1';
const ARCHIVE_KEY = 'catch:archive:v1';

/** Số buổi cũ giữ lại. Đủ cho một khoá phổ cập bơi (thường 10–15 buổi), và đủ
 *  ít để không làm phình localStorage của thầy. */
const KEEP = 20;

export const faultKey = (f: Fault) => `${f.code}-${f.at}`;

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const emptySession = (className = ''): Session =>
  ({ id: newId(), className, date: todayISO(), entries: [] });

export function loadSession(): Session {
  if (typeof window === 'undefined') return emptySession();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptySession();
    const s = JSON.parse(raw) as Session;
    if (!Array.isArray(s?.entries)) return emptySession();
    return { id: s.id ?? newId(), className: s.className ?? '', date: s.date ?? todayISO(), entries: s.entries };
  } catch {
    // Chế độ ẩn danh, hoặc trình duyệt chặn lưu trữ — vẫn dùng được, chỉ là không nhớ
    return emptySession();
  }
}

export function saveSession(s: Session) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* hết chỗ hoặc bị chặn */ }
}

/* ── Buổi cũ ─────────────────────────────────────────────────────────────
   Giữ lại để trả lời một câu hỏi mà chấm từng buổi rời rạc không trả lời được:
   *việc dạy hôm trước có ăn thua gì không*. Xem lib/progress.ts. */

export function loadArchive(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ARCHIVE_KEY);
    const a = raw ? (JSON.parse(raw) as Session[]) : [];
    return Array.isArray(a) ? a.filter((s) => Array.isArray(s?.entries)) : [];
  } catch { return []; }
}

export function saveArchive(list: Session[]) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list.slice(-KEEP))); }
  catch { /* hết chỗ — buổi cũ nhất sẽ rụng dần, chấp nhận được */ }
}

/** Lỗi còn hiệu lực của một em — đã trừ những lỗi thầy phủ quyết. */
export const liveFaults = (e: Entry) => e.faults.filter((f) => !e.dismissed.includes(faultKey(f)));

/** Mức nặng nhất của một em. `null` khi không có lỗi nào hoặc bị từ chối chấm. */
export function worstSeverity(e: Entry): Severity | null {
  let worst: Severity | null = null;
  for (const f of liveFaults(e)) {
    const sev = BY_CODE.get(f.code)!.severity;
    if (worst === null || SEVERITY_ORDER[sev] < SEVERITY_ORDER[worst]) worst = sev;
  }
  return worst;
}

const entryWeight = (e: Entry) => {
  const w = worstSeverity(e);
  if (w === null) return 9;
  return SEVERITY_ORDER[w];
};

/** Thứ tự thầy nên sửa ở buổi sau.
 *
 *  Nặng nhất trước; cùng mức thì em nào nhiều lỗi hơn xếp trước; vẫn hoà thì
 *  giữ nguyên thứ tự đã chấm để thầy dễ dò lại. */
export function rankEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    const d = entryWeight(a) - entryWeight(b);
    if (d !== 0) return d;
    const n = liveFaults(b).length - liveFaults(a).length;
    if (n !== 0) return n;
    return a.createdAt - b.createdAt;
  });
}

/** Lỗi nào cả lớp cùng mắc.
 *
 *  Đây là thứ chỉ nhìn thấy được khi có cả lớp trong tay: nếu hai phần ba số em
 *  cùng ngẩng đầu quá cao thì đó không phải lỗi của từng em, mà là chỗ thầy cần
 *  dạy lại cho cả lớp. Sửa một lần cho ba mươi em, thay vì ba mươi lần. */
export function commonFaults(entries: Entry[]) {
  const counts = new Map<FaultCode, { code: FaultCode; students: string[] }>();
  for (const e of entries) {
    for (const f of liveFaults(e)) {
      const cur = counts.get(f.code) ?? { code: f.code, students: [] };
      if (!cur.students.includes(e.label)) cur.students.push(e.label);
      counts.set(f.code, cur);
    }
  }
  return [...counts.values()]
    .map((c) => ({ ...c, spec: BY_CODE.get(c.code)!, share: entries.length ? c.students.length / entries.length : 0 }))
    .sort((a, b) =>
      b.students.length - a.students.length
      || SEVERITY_ORDER[a.spec.severity] - SEVERITY_ORDER[b.spec.severity]);
}

/** Ngưỡng gọi là "cả lớp cùng mắc". Một phần ba lớp trở lên thì dạy chung nhanh hơn. */
export const CLASS_WIDE = 1 / 3;

export const newId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `e${Date.now()}${Math.random().toString(36).slice(2, 8)}`);
