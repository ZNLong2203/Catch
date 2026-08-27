import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ghepMoc, taoNhacLich } from '@/lib/calendar';

const plan = { title: 'Bơi — Lớp 4A', description: 'nội dung' };
const moc = new Date(2026, 8, 4, 15, 0, 0);

/** Thay `fetch` bằng một câu trả lời dựng sẵn, để thử phần Catch tự viết mà
 *  không gọi thật lên Google. */
function voiFetch(tra: () => Promise<Response> | Response, chay: () => Promise<void>) {
  const cu = globalThis.fetch;
  globalThis.fetch = (async () => tra()) as typeof fetch;
  return chay().finally(() => { globalThis.fetch = cu; });
}
const traLoi = (status: number, body = '') =>
  new Response(body, { status, headers: { 'content-type': 'application/json' } });

test('ghepMoc: dựng mốc theo giờ máy, không lệch múi giờ', () => {
  const d = ghepMoc('2026-09-04', '15:00')!;
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 8);
  assert.equal(d.getDate(), 4);
  assert.equal(d.getHours(), 15);
});

test('ghepMoc: dữ liệu hỏng thì trả null chứ không đoán', () => {
  assert.equal(ghepMoc('04/09/2026', '15:00'), null);
  assert.equal(ghepMoc('2026-09-04', '3 giờ chiều'), null);
});

test('tạo được thì trả link mở sự kiện', async () => {
  await voiFetch(() => traLoi(200, JSON.stringify({ htmlLink: 'https://calendar.google.com/x' })), async () => {
    const r = await taoNhacLich('the-gia', plan, moc);
    assert.deepEqual(r, { ok: true, link: 'https://calendar.google.com/x' });
  });
});

/* Bốn mã lỗi, bốn cách xử khác nhau. Gộp thành một câu là bắt thầy đoán. */
test('401: nói là hết hạn quyền, không nói chung chung', async () => {
  await voiFetch(() => traLoi(401), async () => {
    const r = await taoNhacLich('the-het-han', plan, moc);
    assert.equal(r.ok, false);
    assert.match((r as { why: string }).why, /hết hạn/);
  });
});

test('403 do chưa bật API: chỉ đúng chỗ cần sửa', async () => {
  const body = JSON.stringify({ error: { message: 'Google Calendar API has not been used in project 676963947701' } });
  await voiFetch(() => traLoi(403, body), async () => {
    const r = await taoNhacLich('the', plan, moc);
    assert.match((r as { why: string }).why, /chưa được bật/);
  });
});

test('403 do thầy không cho quyền: nói khác hẳn 403 ở trên', async () => {
  await voiFetch(() => traLoi(403, JSON.stringify({ error: { message: 'insufficientPermissions' } })), async () => {
    const r = await taoNhacLich('the', plan, moc);
    assert.match((r as { why: string }).why, /chưa cho Catch quyền/);
  });
});

test('mất mạng thì không nổ, trả câu đọc được', async () => {
  await voiFetch(() => { throw new Error('network'); }, async () => {
    const r = await taoNhacLich('the', plan, moc);
    assert.equal(r.ok, false);
    assert.match((r as { why: string }).why, /Kiểm tra kết nối/);
  });
});
