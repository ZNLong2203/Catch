import { test } from 'node:test';
import assert from 'node:assert/strict';
import { combineDateTime, createReminder } from '@/lib/calendar';

const plan = { title: 'Bơi — Lớp 4A', description: 'nội dung' };
const start = new Date(2026, 8, 4, 15, 0, 0);

/** Thay `fetch` bằng một câu trả lời dựng sẵn, để thử phần Catch tự viết mà
 *  không gọi thật lên Google. */
function withFetch(respond: () => Promise<Response> | Response, run: () => Promise<void>) {
  const prev = globalThis.fetch;
  globalThis.fetch = (async () => respond()) as typeof fetch;
  return run().finally(() => { globalThis.fetch = prev; });
}
const reply = (status: number, body = '') =>
  new Response(body, { status, headers: { 'content-type': 'application/json' } });

test('combineDateTime: dựng mốc theo giờ máy, không lệch múi giờ', () => {
  const d = combineDateTime('2026-09-04', '15:00')!;
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 8);
  assert.equal(d.getDate(), 4);
  assert.equal(d.getHours(), 15);
});

test('combineDateTime: dữ liệu hỏng thì trả null chứ không đoán', () => {
  assert.equal(combineDateTime('04/09/2026', '15:00'), null);
  assert.equal(combineDateTime('2026-09-04', '3 giờ chiều'), null);
});

test('tạo được thì trả link mở sự kiện', async () => {
  await withFetch(() => reply(200, JSON.stringify({ htmlLink: 'https://calendar.google.com/x' })), async () => {
    const r = await createReminder('the-gia', plan, start);
    assert.deepEqual(r, { ok: true, link: 'https://calendar.google.com/x' });
  });
});

/* Bốn mã lỗi, bốn cách xử khác nhau. Gộp thành một câu là bắt thầy đoán. */
test('401: nói là hết hạn quyền, không nói chung chung', async () => {
  await withFetch(() => reply(401), async () => {
    const r = await createReminder('the-het-han', plan, start);
    assert.equal(r.ok, false);
    assert.match((r as { why: string }).why, /hết hạn/);
  });
});

test('403 do chưa bật API: chỉ đúng chỗ cần sửa', async () => {
  const body = JSON.stringify({ error: { message: 'Google Calendar API has not been used in project 676963947701' } });
  await withFetch(() => reply(403, body), async () => {
    const r = await createReminder('the', plan, start);
    assert.match((r as { why: string }).why, /chưa được bật/);
  });
});

test('403 do thầy không cho quyền: nói khác hẳn 403 ở trên', async () => {
  await withFetch(() => reply(403, JSON.stringify({ error: { message: 'insufficientPermissions' } })), async () => {
    const r = await createReminder('the', plan, start);
    assert.match((r as { why: string }).why, /chưa cho Catch quyền/);
  });
});

test('mất mạng thì không nổ, trả câu đọc được', async () => {
  await withFetch(() => { throw new Error('network'); }, async () => {
    const r = await createReminder('the', plan, start);
    assert.equal(r.ok, false);
    assert.match((r as { why: string }).why, /Kiểm tra kết nối/);
  });
});
