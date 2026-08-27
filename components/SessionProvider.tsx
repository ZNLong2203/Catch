'use client';

import { createContext, useContext } from 'react';
import { useSession } from './useSession';

/** Một buổi học, một nguồn.
 *
 *  Trước đây mỗi trang tự gọi `useSession()`. Không sao khi mỗi trang một màn
 *  hình — nhưng thanh trên cùng nằm ở layout và cũng cần đúng dữ liệu ấy, mà
 *  gọi thêm một lần nữa là dựng ra một state THỨ HAI: thầy sửa tên lớp trên
 *  thanh, phần thân trang vẫn giữ tên cũ, rồi cái nào ghi sau đè cái ghi trước.
 *  Sự kiện `storage` không cứu được — nó chỉ bắn sang tab khác, không bắn trong
 *  cùng một tab.
 *
 *  Nên state nằm ở đây, đúng một lần, và cả cây dùng chung. */
type Store = ReturnType<typeof useSession>;

const Ctx = createContext<Store | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={useSession()}>{children}</Ctx.Provider>;
}

export function useSessionStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSessionStore phải nằm trong <SessionProvider>');
  return v;
}
