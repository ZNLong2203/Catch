import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classProgress, compareWithPrevious, normalizeLabel } from '@/lib/progress';
import type { Entry, Session } from '@/lib/session';
import type { Fault, FaultCode } from '@/lib/types';

let seq = 0;
const fault = (code: FaultCode, at = 4): Fault =>
  ({ code, at, confidence: 0.9, evidence: 'nhìn thấy được', note: 'ghi chú' });

const entry = (label: string, codes: FaultCode[], dismissed: string[] = []): Entry =>
  ({ id: `e${++seq}`, label, skill: 'breaststroke', faults: codes.map((c) => fault(c)),
     dismissed, createdAt: ++seq });

const session = (date: string, entries: Entry[]): Session =>
  ({ id: `s-${date}`, className: '4A', date, entries });

test('normalizeLabel: "Bình", "bình ", "BÌNH" là một em', () => {
  assert.equal(normalizeLabel('Bình'), 'bình');
  assert.equal(normalizeLabel('  bình  '), 'bình');
  assert.equal(normalizeLabel('BÌNH'), 'bình');
  assert.equal(normalizeLabel('Nguyễn  Văn   Bình'), 'nguyễn văn bình');
});

test('so với buổi trước: tách rõ lỗi đã hết, lỗi mới, lỗi còn nguyên', () => {
  const past = session('2026-08-19', [entry('Bình', ['BR_HEAD_HIGH', 'BR_NO_GLIDE'])]);
  const now = entry('Bình', ['BR_NO_GLIDE', 'BR_WIDE_PULL']);

  const p = compareWithPrevious(now, [past])!;
  assert.equal(p.previousDate, '2026-08-19');
  assert.deepEqual(p.fixed, ['BR_HEAD_HIGH']);
  assert.deepEqual(p.appeared, ['BR_WIDE_PULL']);
  assert.deepEqual(p.persisting, ['BR_NO_GLIDE']);
});

test('chỉ so với buổi GẦN NHẤT có chấm em đó, không so với buổi cũ hơn', () => {
  const cu = session('2026-08-05', [entry('Bình', ['BR_TIMING'])]);
  const gan = session('2026-08-19', [entry('Bình', ['BR_HEAD_HIGH'])]);
  const p = compareWithPrevious(entry('Bình', []), [cu, gan])!;
  assert.equal(p.previousDate, '2026-08-19');
  assert.deepEqual(p.fixed, ['BR_HEAD_HIGH'], 'BR_TIMING của buổi 05 không được lôi vào');
});

test('không có buổi nào chấm em này thì không so, không bịa ra tiến bộ', () => {
  const past = session('2026-08-19', [entry('An', ['BR_HEAD_HIGH'])]);
  assert.equal(compareWithPrevious(entry('Bình', []), [past]), null);
  assert.equal(compareWithPrevious(entry('Bình', []), []), null);
  assert.equal(compareWithPrevious(entry('   ', []), [past]), null, 'tên rỗng thì không ghép bừa');
});

test('chỉ so cùng một nội dung — bơi ếch không so với đứng nước', () => {
  const past = session('2026-08-19', [{ ...entry('Bình', ['BR_HEAD_HIGH']), skill: 'treading' }]);
  assert.equal(compareWithPrevious(entry('Bình', []), [past]), null);
});

test('lỗi thầy đã phủ quyết không được tính là tiến bộ', () => {
  const past = session('2026-08-19', [entry('Bình', ['BR_HEAD_HIGH', 'BR_NO_GLIDE'], ['BR_NO_GLIDE-4'])]);
  const p = compareWithPrevious(entry('Bình', ['BR_NO_GLIDE']), [past])!;
  assert.deepEqual(p.fixed, ['BR_HEAD_HIGH']);
  assert.deepEqual(p.appeared, ['BR_NO_GLIDE'], 'buổi trước đã bỏ lỗi này nên hôm nay là mới');
});

test('tiến bộ cả lớp: đếm số EM, và chỉ nói về lỗi buổi trước có', () => {
  const past = session('2026-08-19', [
    entry('An', ['BR_HEAD_HIGH']), entry('Bình', ['BR_HEAD_HIGH']),
    entry('Chi', ['BR_HEAD_HIGH']), entry('Dũng', ['BR_NO_GLIDE']),
  ]);
  const now = session('2026-08-26', [
    entry('An', ['BR_HEAD_HIGH']), entry('Bình', []),
    entry('Chi', []), entry('Dũng', ['BR_NO_GLIDE', 'BR_WIDE_PULL']),
  ]);

  const cp = classProgress(now, [past]);
  const head = cp.find((c) => c.code === 'BR_HEAD_HIGH')!;
  assert.equal(head.then, 3);
  assert.equal(head.now, 1);
  assert.equal(head.total, 4);
  assert.equal(cp[0].code, 'BR_HEAD_HIGH', 'lỗi tiến bộ nhiều nhất lên đầu');
  assert.equal(cp.find((c) => c.code === 'BR_WIDE_PULL'), undefined,
    'lỗi buổi trước không có thì không có gì để so');
});

test('chưa có buổi cũ thì không có tiến bộ để nói', () => {
  const now = session('2026-08-26', [entry('An', ['BR_HEAD_HIGH'])]);
  assert.deepEqual(classProgress(now, []), []);
});

test('không tự so buổi hiện tại với chính nó', () => {
  const now = session('2026-08-26', [entry('An', ['BR_HEAD_HIGH'])]);
  assert.deepEqual(classProgress(now, [now]), []);
});

test('buổi trong tương lai không được đem ra so', () => {
  const tuongLai = session('2026-09-30', [entry('An', ['BR_HEAD_HIGH'])]);
  const now = session('2026-08-26', [entry('An', [])]);
  assert.deepEqual(classProgress(now, [tuongLai]), []);
});
