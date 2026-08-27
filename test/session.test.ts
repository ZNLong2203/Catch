import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLASS_WIDE, commonFaults, emptySession, liveFaults, rankEntries, saveArchive, saveSession,
  worstSeverity, type Entry,
} from '@/lib/session';
import type { Fault, FaultCode } from '@/lib/types';

let seq = 0;
const fault = (code: FaultCode, at = 4, confidence = 0.9): Fault =>
  ({ code, at, confidence, evidence: 'nhìn thấy được', note: 'ghi chú' });

const entry = (label: string, faults: Fault[], dismissed: string[] = []): Entry =>
  ({ id: `e${++seq}`, label, skill: 'breaststroke', faults, dismissed, createdAt: seq });

test('liveFaults: lỗi thầy phủ quyết không còn được tính', () => {
  const e = entry('An', [fault('BR_NO_GLIDE', 6), fault('BR_HEAD_HIGH', 9)], ['BR_NO_GLIDE-6']);
  assert.deepEqual(liveFaults(e).map((f) => f.code), ['BR_HEAD_HIGH']);
});

test('worstSeverity: lấy mức nặng nhất còn hiệu lực', () => {
  assert.equal(worstSeverity(entry('An', [fault('BR_WIDE_PULL'), fault('BR_NO_GLIDE')])), 'red');
  assert.equal(worstSeverity(entry('Bình', [fault('BR_WIDE_PULL')])), 'green');
  assert.equal(worstSeverity(entry('Chi', [])), null);
  assert.equal(
    worstSeverity(entry('Dũng', [fault('BR_NO_GLIDE', 6)], ['BR_NO_GLIDE-6'])), null,
    'phủ quyết hết thì không còn mức nào',
  );
});

test('rankEntries: em có lỗi kiệt sức xếp trước em bơi xấu hơn nhưng an toàn hơn', () => {
  const ranked = rankEntries([
    entry('Bơi xấu nhưng biết lướt', [fault('BR_WIDE_PULL'), fault('BR_SCISSOR_KICK')]),
    entry('Bơi đẹp nhưng nín thở', [fault('BR_BREATH_HELD')]),
    entry('Không lỗi', []),
  ]);
  assert.deepEqual(ranked.map((e) => e.label),
    ['Bơi đẹp nhưng nín thở', 'Bơi xấu nhưng biết lướt', 'Không lỗi']);
});

test('rankEntries: cùng mức thì em nhiều lỗi hơn xếp trước', () => {
  const ranked = rankEntries([
    entry('Một lỗi', [fault('BR_HEAD_HIGH')]),
    entry('Hai lỗi', [fault('BR_HEAD_HIGH'), fault('BR_SCISSOR_KICK', 7)]),
  ]);
  assert.equal(ranked[0].label, 'Hai lỗi');
});

test('rankEntries: không làm xáo trộn mảng gốc', () => {
  const list = [entry('A', [fault('BR_WIDE_PULL')]), entry('B', [fault('BR_NO_GLIDE')])];
  const before = list.map((e) => e.label);
  rankEntries(list);
  assert.deepEqual(list.map((e) => e.label), before);
});

test('commonFaults: đếm số EM chứ không đếm số lần lỗi xuất hiện', () => {
  const common = commonFaults([
    entry('An', [fault('BR_HEAD_HIGH', 3), fault('BR_NO_GLIDE', 8)]),
    entry('Bình', [fault('BR_HEAD_HIGH', 5)]),
    entry('Chi', [fault('BR_WIDE_PULL', 2)]),
  ]);
  const head = common.find((c) => c.code === 'BR_HEAD_HIGH')!;
  assert.equal(head.students.length, 2);
  assert.deepEqual(head.students, ['An', 'Bình']);
  assert.ok(Math.abs(head.share - 2 / 3) < 1e-9);
  assert.equal(common[0].code, 'BR_HEAD_HIGH', 'lỗi nhiều em mắc nhất phải lên đầu');
});

test('commonFaults: bỏ qua lỗi đã bị thầy phủ quyết', () => {
  const common = commonFaults([
    entry('An', [fault('BR_HEAD_HIGH', 3)], ['BR_HEAD_HIGH-3']),
    entry('Bình', [fault('BR_HEAD_HIGH', 5)]),
  ]);
  assert.equal(common.find((c) => c.code === 'BR_HEAD_HIGH')!.students.length, 1);
});

test('ngưỡng dạy chung là một phần ba lớp', () => {
  assert.ok(Math.abs(CLASS_WIDE - 1 / 3) < 1e-9);
  const twelve = Array.from({ length: 12 }, (_, i) =>
    entry(`Em ${i + 1}`, i < 4 ? [fault('BR_HEAD_HIGH', 3)] : [fault('BR_WIDE_PULL', 2)]));
  const head = commonFaults(twelve).find((c) => c.code === 'BR_HEAD_HIGH')!;
  assert.ok(head.share >= CLASS_WIDE, '4/12 phải đủ để gọi là cả lớp cùng mắc');
});

test('lớp rỗng không làm sập bảng ưu tiên', () => {
  assert.deepEqual(commonFaults([]), []);
  assert.deepEqual(rankEntries([]), []);
});

/* ── Ghi hỏng phải nói ra, không được nuốt ──────────────────────────────
   Thầy chấm ba mươi em rồi mở bảng ưu tiên thấy trống là kiểu hỏng tệ nhất
   sản phẩm này có thể mắc. Hai phép thử này khoá lại đường đó. */

const withStorage = (setItem: () => void, run: () => void) => {
  const g = globalThis as { window?: unknown };
  const truoc = g.window;
  g.window = { localStorage: { setItem, getItem: () => null } };
  try { run(); } finally { if (truoc === undefined) delete g.window; else g.window = truoc; }
};

test('saveSession: báo false khi trình duyệt chặn lưu trữ', () => {
  withStorage(() => { throw new Error('QuotaExceededError'); }, () => {
    assert.equal(saveSession(emptySession('4A')), false);
  });
});

test('saveSession: báo true khi ghi được', () => {
  withStorage(() => {}, () => {
    assert.equal(saveSession(emptySession('4A')), true);
  });
});

test('saveArchive: báo false khi trình duyệt chặn lưu trữ', () => {
  withStorage(() => { throw new Error('QuotaExceededError'); }, () => {
    assert.equal(saveArchive([emptySession('4A')]), false);
  });
});
