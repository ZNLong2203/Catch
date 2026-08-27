/* Service worker cho Catch.
 *
 *  Mục tiêu hẹp và cố ý hẹp: để CHẾ ĐỘ BỜ HỒ chạy được khi không có mạng.
 *  Buổi học nằm hết trong localStorage, nên một khi vỏ ứng dụng đã nằm trong
 *  bộ nhớ đệm thì thầy vẫn mở được thứ tự ưu tiên và đánh dấu đã sửa dù sóng
 *  chập chờn. Chỉ khâu CHẤM mới cần mạng — và khâu đó thì phải nói thẳng là
 *  không chấm được, chứ không giả vờ.
 *
 *  Nguyên tắc: KHÔNG bao giờ đệm phản hồi của /api/analyze. Một kết quả chấm cũ
 *  hiện ra cho một em khác là đúng loại sai lầm nguy hiểm nhất của sản phẩm này. */

const VERSION = 'catch-v1';
const SHELL = ['/', '/session', '/session/poolside', '/session/print', '/manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      // Thiếu một trang thì đừng để hỏng cả lượt cài — đệm được cái nào hay cái đó
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;   // ← không đệm kết quả chấm

  // Tài nguyên tĩnh có mã băm trong tên: có trong đệm thì dùng luôn, khỏi hỏi mạng
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then((hit) => hit ?? fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(request, copy));
        return res;
      })),
    );
    return;
  }

  // Trang: ưu tiên mạng để luôn mới, mất mạng thì lấy bản đã đệm
  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit ?? caches.match('/session/poolside'))),
  );
});
