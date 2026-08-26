import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFaults, toSeconds, type RawFault } from '@/lib/normalize';

test('toSeconds: đọc đúng định dạng MM:SS mà Gemini trả về', () => {
  assert.equal(toSeconds('01:24'), 84);
  assert.equal(toSeconds('1:24'), 84);
  assert.equal(toSeconds('00:03'), 3);
  assert.equal(toSeconds('08:48'), 528);
  assert.equal(toSeconds('01:02:03'), 3723);
  assert.equal(toSeconds('12'), 12);
  assert.equal(toSeconds(7), 7);
});

test('toSeconds: từ chối thứ không dùng được thay vì đoán bừa', () => {
  assert.equal(toSeconds('01:99'), null, 'giây quá 59 là model bịa');
  assert.equal(toSeconds('khoảng giây thứ 4'), null);
  assert.equal(toSeconds(''), null);
  assert.equal(toSeconds(undefined), null);
  assert.equal(toSeconds(null), null);
  assert.equal(toSeconds(NaN), null);
  assert.equal(toSeconds('1:2:3:4'), null);
});

const ok = (over: Partial<RawFault> = {}): RawFault => ({
  code: 'BR_HEAD_HIGH', at: '00:04', confidence: 0.9,
  evidence: 'cằm nổi cao trên mặt nước', note: 'ngẩng đầu quá cao', ...over,
});

test('cổng chặn: lỗi không có mốc thời gian thì bị bỏ, dù model chắc đến đâu', () => {
  const r = normalizeFaults([ok({ at: 'giữa video', confidence: 1 })], 'breaststroke');
  assert.equal(r.faults.length, 0);
  assert.equal(r.dropped, 1, 'phải đếm được, bỏ trong im lặng là nói dối');
});

test('cổng chặn: mã lỗi của kiểu bơi khác bị bỏ — đã gặp thật ngày 26/08', () => {
  const r = normalizeFaults([ok({ code: 'FR_KNEE_KICK' })], 'breaststroke');
  assert.equal(r.faults.length, 0);
  assert.equal(r.dropped, 1);
});

test('cổng chặn: mã model bịa ra bị bỏ', () => {
  const r = normalizeFaults([ok({ code: 'BR_KHONG_CO_THAT' })], 'breaststroke');
  assert.equal(r.faults.length, 0);
});

test('cổng chặn: mốc nằm ngoài thời lượng video bị bỏ', () => {
  const r = normalizeFaults([ok({ at: '02:00' })], 'breaststroke', 15);
  assert.equal(r.faults.length, 0);
  // Nới một giây cho sai số làm tròn của chính trình duyệt
  assert.equal(normalizeFaults([ok({ at: '00:15' })], 'breaststroke', 15).faults.length, 1);
});

test('cổng chặn: không có bằng chứng thị giác thì lỗi vô dụng với thầy', () => {
  const r = normalizeFaults([ok({ evidence: '   ' })], 'breaststroke');
  assert.equal(r.faults.length, 0);
});

test('trùng mã thì giữ lần chắc nhất, không hiện hai thẻ giống nhau', () => {
  const r = normalizeFaults([
    ok({ at: '00:04', confidence: 0.6 }),
    ok({ at: '00:09', confidence: 0.95 }),
  ], 'breaststroke');
  assert.equal(r.faults.length, 1);
  assert.equal(r.faults[0].at, 9);
  assert.equal(r.dropped, 1);
});

test('xếp nhóm đỏ lên trước, kể cả khi model tin nhóm xanh hơn', () => {
  const r = normalizeFaults([
    ok({ code: 'BR_WIDE_PULL', at: '00:02', confidence: 0.99 }),
    ok({ code: 'BR_NO_GLIDE', at: '00:06', confidence: 0.55 }),
  ], 'breaststroke');
  assert.deepEqual(r.faults.map((f) => f.code), ['BR_NO_GLIDE', 'BR_WIDE_PULL']);
});

test('độ tin cậy luôn nằm trong 0..1', () => {
  const r = normalizeFaults([ok({ confidence: 4 }), ok({ code: 'BR_NO_GLIDE', confidence: -2 })], 'breaststroke');
  assert.ok(r.faults.every((f) => f.confidence >= 0 && f.confidence <= 1));
});

test('đầu vào rỗng hoặc hỏng không làm sập máy chủ', () => {
  assert.equal(normalizeFaults(undefined, 'breaststroke').faults.length, 0);
  assert.equal(normalizeFaults([], 'freestyle').faults.length, 0);
  assert.equal(normalizeFaults([{} as RawFault], 'freestyle').dropped, 1);
});

/* ── Chấm hai lượt ─────────────────────────────────────────────────────
   Đo được ngày 26/08: lỗi bịa KHÔNG cố định. Cùng model, cùng video vô địch
   thế giới, có lượt trả 0 lỗi có lượt bịa ra BR_KNEES_FORWARD. Giao hai lượt
   là cách rẻ nhất bóc đúng loại lỗi đó. */

import { intersectPasses } from '@/lib/normalize';
import type { Fault } from '@/lib/types';

const f = (code: Fault['code'], at: number, confidence = 0.9): Fault =>
  ({ code, at, confidence, evidence: 'nhìn thấy được', note: 'ghi chú' });

test('chỉ giữ lỗi xuất hiện ở CẢ HAI lượt', () => {
  const r = intersectPasses(
    [f('BR_HEAD_HIGH', 4), f('BR_KNEES_FORWARD', 6)],
    [f('BR_HEAD_HIGH', 5)],
  );
  assert.deepEqual(r.faults.map((x) => x.code), ['BR_HEAD_HIGH']);
  assert.equal(r.unconfirmed, 1, 'BR_KNEES_FORWARD chỉ một lượt thấy nên bị loại');
  assert.equal(r.faults[0].confirmed, true);
});

test('độ tin cậy lấy mức THẤP hơn, không lấy trung bình', () => {
  const r = intersectPasses([f('BR_HEAD_HIGH', 4, 0.95)], [f('BR_HEAD_HIGH', 4, 0.55)]);
  assert.equal(r.faults[0].confidence, 0.55, 'bất đồng thì nghiêng về phía dè dặt');
});

test('mốc thời gian lấy theo lượt chắc hơn', () => {
  const r = intersectPasses([f('BR_HEAD_HIGH', 4, 0.6)], [f('BR_HEAD_HIGH', 9, 0.9)]);
  assert.equal(r.faults[0].at, 9);
});

test('hai lượt không trùng gì thì không giữ lỗi nào', () => {
  const r = intersectPasses([f('BR_HEAD_HIGH', 4)], [f('BR_NO_GLIDE', 8)]);
  assert.equal(r.faults.length, 0);
  assert.equal(r.unconfirmed, 2);
});

test('một lượt rỗng thì kết quả rỗng — đây là ý đồ, không phải lỗi', () => {
  assert.equal(intersectPasses([f('BR_HEAD_HIGH', 4)], []).faults.length, 0);
  assert.equal(intersectPasses([], [f('BR_HEAD_HIGH', 4)]).faults.length, 0);
  assert.equal(intersectPasses([], []).unconfirmed, 0);
});

test('kết quả vẫn xếp đỏ trước xanh', () => {
  const both = [f('BR_WIDE_PULL', 2, 0.99), f('BR_NO_GLIDE', 6, 0.5)];
  const r = intersectPasses(both, both);
  assert.deepEqual(r.faults.map((x) => x.code), ['BR_NO_GLIDE', 'BR_WIDE_PULL']);
});
