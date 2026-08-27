import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAC_DINH, resolveConfig } from '@/lib/firebase.config';

/* Bản deploy do AI Studio dựng lại KHÔNG có .env.local. Nếu chỗ này lùi về một
   apiKey rỗng thì app vẫn dựng xong, vẫn chạy, chỉ là im lặng mất đồng bộ — mà
   triệu chứng lại giống hệt "thầy chưa đăng nhập". Ba phép thử này khoá lại. */

test('không có biến môi trường thì dùng cấu hình dự án thật', () => {
  const c = resolveConfig({});
  assert.equal(c.projectId, 'catch-64526');
  assert.equal(c.apiKey, MAC_DINH.apiKey);
  assert.equal(c.appId, MAC_DINH.appId);
  assert.ok(c.apiKey.length > 0, 'apiKey không bao giờ được rỗng');
});

test('biến để trống hoặc toàn khoảng trắng cũng không được đè', () => {
  const c = resolveConfig({
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: '',
    NEXT_PUBLIC_FIREBASE_API_KEY: '   ',
  });
  assert.equal(c.projectId, 'catch-64526');
  assert.equal(c.apiKey, MAC_DINH.apiKey);
});

test('biến có giá trị thì đè được — để người fork trỏ sang dự án của họ', () => {
  const c = resolveConfig({
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'du-an-khac',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'khoa-khac',
  });
  assert.equal(c.projectId, 'du-an-khac');
  assert.equal(c.apiKey, 'khoa-khac');
  assert.equal(c.authDomain, MAC_DINH.authDomain, 'biến không đặt thì vẫn lùi về mặc định');
});
