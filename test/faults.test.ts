import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BY_CODE, FAULTS, SEVERITY_META, SKILL_META, SKILL_ORDER, codesFor, rank } from '@/lib/faults';
import type { Skill } from '@/lib/types';

test('enum gửi cho Gemini chỉ chứa mã của đúng nội dung đang chấm', () => {
  for (const skill of SKILL_ORDER) {
    const codes = codesFor(skill);
    assert.ok(codes.length >= 5, `${skill} có quá ít lỗi`);
    for (const c of codes) assert.equal(BY_CODE.get(c)!.skill, skill);
  }
  // Không mã nào lọt sang nội dung khác — đây là chỗ đã hỏng thật ngày 26/08
  const all = SKILL_ORDER.flatMap(codesFor);
  assert.equal(new Set(all).size, all.length);
  assert.equal(all.length, FAULTS.length);
});

test('mọi lỗi đều có dấu hiệu nhìn thấy từ bờ và bài sửa cụ thể', () => {
  for (const f of FAULTS) {
    assert.ok(f.label.trim().length > 3, `${f.code} thiếu tên`);
    assert.ok(f.visible.trim().length > 10, `${f.code} thiếu dấu hiệu nhìn thấy`);
    assert.ok(f.drill.trim().length > 20, `${f.code} thiếu bài sửa — thầy sẽ không biết làm gì`);
  }
});

test('mã lỗi không trùng nhau', () => {
  assert.equal(BY_CODE.size, FAULTS.length);
});

test('mỗi nội dung phải có ít nhất một lỗi nhóm đỏ', () => {
  for (const skill of SKILL_ORDER) {
    assert.ok(FAULTS.some((f) => f.skill === skill && f.severity === 'red'), skill);
  }
});

test('hai kỹ năng sinh tồn nặng về nhóm đỏ hơn các kiểu bơi', () => {
  const share = (skill: Skill) => {
    const list = FAULTS.filter((f) => f.skill === skill);
    return list.filter((f) => f.severity === 'red').length / list.length;
  };
  // Đứng nước và thả nổi ngửa là kỹ năng giữ mạng: hỏng ở đó là hỏng thẳng vào
  // chỗ nguy hiểm, không phải hỏng ở hiệu suất.
  assert.ok(share('treading') >= 0.5, 'đứng nước');
  assert.ok(share('backfloat') >= 0.5, 'thả nổi ngửa');
  assert.ok(share('treading') > share('breaststroke'));
  assert.ok(share('backfloat') > share('freestyle'));
});

test('mọi mã lỗi đều mang tiền tố đúng của nội dung nó thuộc về', () => {
  const prefix: Record<Skill, string> = {
    treading: 'TW_', backfloat: 'FL_', breaststroke: 'BR_',
    freestyle: 'FR_', backstroke: 'BK_', butterfly: 'BF_',
  };
  for (const f of FAULTS) {
    assert.ok(f.code.startsWith(prefix[f.skill]), `${f.code} không khớp ${f.skill}`);
  }
});

test('hai kỹ năng sinh tồn đứng trước mọi kiểu bơi trong thứ tự hiển thị', () => {
  const groups = SKILL_ORDER.map((s) => SKILL_META[s].group);
  assert.equal(groups.indexOf('survival'), 0);
  assert.ok(groups.lastIndexOf('survival') < groups.indexOf('stroke'));
});

test('mọi nội dung đều có mô tả và cờ phổ cập', () => {
  for (const s of SKILL_ORDER) {
    assert.ok(SKILL_META[s].label.length > 3, s);
    assert.ok(SKILL_META[s].hint.length > 15, s);
    assert.equal(typeof SKILL_META[s].curriculum, 'boolean', s);
  }
  assert.equal(SKILL_META.butterfly.curriculum, false, 'bơi bướm không nằm trong phổ cập');
});

test('rank: đỏ trước vàng trước xanh, cùng nhóm thì chắc hơn xếp trước', () => {
  const list = [
    { code: 'BR_WIDE_PULL' as const, confidence: 0.9 },
    { code: 'BR_HEAD_HIGH' as const, confidence: 0.5 },
    { code: 'BR_NO_GLIDE' as const, confidence: 0.4 },
    { code: 'BR_SCISSOR_KICK' as const, confidence: 0.8 },
  ].sort(rank);
  assert.deepEqual(list.map((f) => f.code),
    ['BR_NO_GLIDE', 'BR_SCISSOR_KICK', 'BR_HEAD_HIGH', 'BR_WIDE_PULL']);
});

test('ba nhóm đều có lời giải thích vì sao xếp ở đó', () => {
  for (const sev of ['red', 'amber', 'green'] as const) {
    assert.ok(SEVERITY_META[sev].why.length > 20);
  }
});
