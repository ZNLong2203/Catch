/** Bộ nạp cho `node --test`.
 *
 *  Mã nguồn dùng alias `@/…` và import không kèm đuôi — đó là quy ước của Next.js,
 *  còn Node thì không biết. Thay vì sửa mã nguồn cho hợp với bộ chạy test (làm thế
 *  là để đuôi test quyết định hình dạng sản phẩm), dạy bộ chạy hiểu quy ước sẵn có. */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);

export async function resolve(specifier, context, next) {
  let s = specifier;
  if (s.startsWith('@/')) s = new URL(s.slice(2), ROOT).href;

  const hasExt = /\.[cm]?[jt]sx?$/.test(s);
  if (!hasExt && (s.startsWith('.') || s.startsWith('file:'))) {
    const base = new URL(s, context.parentURL ?? ROOT);
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      const candidate = new URL(base.href + ext);
      if (existsSync(fileURLToPath(candidate))) return next(candidate.href, context);
    }
  }
  return next(s, context);
}
