'use client';

import { useEffect } from 'react';

/** Đăng ký service worker.
 *
 *  Chạy sau khi trang tải xong để không tranh băng thông với chính nội dung đang
 *  hiện ra. Hỏng thì im lặng: không có bộ nhớ đệm thì ứng dụng vẫn chạy bình
 *  thường khi có mạng, chỉ mất phần offline. */
export function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const id = setTimeout(() => {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* đành chịu, không sao */ });
    }, 1200);
    return () => clearTimeout(id);
  }, []);
  return null;
}
