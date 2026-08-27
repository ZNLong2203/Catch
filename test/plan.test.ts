import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextSessionPlan } from '@/lib/plan';
import type { Entry, Session } from '@/lib/session';
import type { Fault, FaultCode } from '@/lib/types';

let seq = 0;
const fault = (code: FaultCode, at = 4): Fault =>
  ({ code, at, confidence: 0.9, evidence: 'nhìn thấy được', note: 'ghi chú' });

const entry = (label: string, faults: Fault[]): Entry =>
  ({ id: `e${++seq}`, label, skill: 'breaststroke', faults, dismissed: [], createdAt: ++seq });

/* Tên các em phải hiếm và dễ nhận, để phép thử bắt được nếu chúng lọt ra */
const STUDENT_NAMES = ['Nguyễn Quốc Bảo', 'Trần Khánh Vy', 'Lê Hoàng Phúc', 'Phạm Bảo Trân'];

const makeSession = (): Session => ({
  id: 's1', className: '4A', date: '2026-08-27',
  entries: [
    entry(STUDENT_NAMES[0], [fault('BR_NO_GLIDE'), fault('BR_HEAD_HIGH')]),
    entry(STUDENT_NAMES[1], [fault('BR_NO_GLIDE')]),
    entry(STUDENT_NAMES[2], [fault('BR_HEAD_HIGH')]),
    entry(STUDENT_NAMES[3], [fault('BR_WIDE_PULL')]),
  ],
});

/* ── Luật cứng: tên em không bao giờ được vào sự kiện lịch ──────────────
   Lịch được chia sẻ trong Workspace của trường, đồng bộ xuống điện thoại,
   hiện cho người được uỷ quyền. Một lần lọt là không rút lại được. */

test('nhắc lịch KHÔNG chứa tên em nào', () => {
  const p = nextSessionPlan(makeSession(), [], 'https://catch-zkare.ai.studio');
  const text = p.title + '\n' + p.description;
  for (const name of STUDENT_NAMES) {
    assert.ok(!text.includes(name), `tên "${name}" đã lọt vào nhắc lịch:\n${text}`);
  }
});

test('nhắc lịch vẫn nói đúng con số mức lớp', () => {
  const p = nextSessionPlan(makeSession(), [], 'https://catch-zkare.ai.studio');
  assert.equal(p.title, 'Bơi — Lớp 4A');
  // BR_NO_GLIDE là lỗi đỏ, hai em mắc -> hai em thuộc nhóm nguy hiểm
  assert.match(p.description, /2 trên 4 em/);
  // BR_NO_GLIDE 2/4 = 50% >= 1/3 và >= 2 em -> phải nằm trong phần dạy chung
  assert.match(p.description, /DẠY CHUNG CẢ LỚP/);
  assert.match(p.description, /Không có pha lướt — 2\/4 em/);
});

test('có buổi cũ thì nói được tiến bộ, vẫn không có tên em', () => {
  const previous: Session = {
    id: 's0', className: '4A', date: '2026-08-20',
    entries: [
      entry('Đặng Thuỳ Linh', [fault('BR_HEAD_HIGH')]),
      entry('Vũ Minh Khôi', [fault('BR_HEAD_HIGH')]),
      entry('Bùi Gia Hân', [fault('BR_HEAD_HIGH')]),
    ],
  };
  const p = nextSessionPlan(makeSession(), [previous], 'https://catch-zkare.ai.studio');
  assert.match(p.description, /SO VỚI BUỔI 20\/08\/2026/);
  assert.match(p.description, /Ngẩng đầu quá cao, hông chìm: 3 → 2 em ↓/);
  for (const name of ['Đặng Thuỳ Linh', 'Vũ Minh Khôi', 'Bùi Gia Hân']) {
    assert.ok(!p.description.includes(name), `tên buổi cũ lọt ra: ${name}`);
  }
});

test('buổi rỗng vẫn ra nhắc dùng được, không nổ', () => {
  const p = nextSessionPlan({ id: 'x', className: '', date: '2026-08-27', entries: [] }, [], 'https://a.b/');
  assert.equal(p.title, 'Bơi — buổi sau');
  assert.match(p.description, /chưa chấm em nào/);
  assert.match(p.description, /https:\/\/a\.b\/session/);
});
