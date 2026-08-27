'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator, getAuth, onAuthStateChanged, signInAnonymously, signOut,
  GoogleAuthProvider, signInWithPopup, linkWithPopup,
  type Auth, type User,
} from 'firebase/auth';
import {
  connectFirestoreEmulator, initializeFirestore, persistentLocalCache,
  persistentMultipleTabManager, type Firestore,
} from 'firebase/firestore';

/** Cấu hình đọc lúc build. Khoá `apiKey` của Firebase không phải bí mật — nó chỉ
 *  định danh dự án, còn ai đọc được cái gì do `firestore.rules` quyết. Bí mật
 *  thật của Catch vẫn là `GEMINI_API_KEY`, và cái đó nằm ở máy chủ. */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Chưa cấu hình Firebase thì Catch vẫn phải chạy.
 *
 *  Không phải để né việc: bản dựng nào thiếu biến môi trường — ai đó clone về
 *  chạy thử, hoặc một lần deploy quên truyền biến — mà nổ trắng màn hình thì
 *  hỏng nặng hơn là thiếu đồng bộ. Thiếu cấu hình thì lùi về localStorage và
 *  giao diện nói thẳng là chưa đồng bộ. */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function ensure() {
  if (!firebaseReady) return null;
  if (!app) {
    app = getApps()[0] ?? initializeApp(config as Required<typeof config>);
    authInstance = getAuth(app);
    /* Bộ đệm ngoại tuyến KHÔNG phải tuỳ chọn cho Catch. Chế độ bờ hồ phải mở
       được khi thầy đứng ở hồ trường huyện sóng chập chờn, và Firestore đọc
       thẳng từ IndexedDB rồi tự đẩy lên khi có mạng lại. `persistentMultipleTabManager`
       để thầy mở bảng ưu tiên ở tab khác mà hai tab không giẫm chân nhau. */
    dbInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    /* Chạy thử với emulator: `npm run emu` rồi đặt NEXT_PUBLIC_FIREBASE_EMULATOR=1.
       Thử luật và đường đồng bộ trên dữ liệu thật của thầy là cách hỏng dữ liệu thật. */
    if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === '1') {
      connectAuthEmulator(authInstance, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(dbInstance, '127.0.0.1', 8080);
    }
  }
  return { auth: authInstance!, db: dbInstance! };
}

export const getDb = () => ensure()?.db ?? null;
export const getAuthClient = () => ensure()?.auth ?? null;

/** Ai cũng có một danh tính ngay từ giây đầu, không cần đăng nhập.
 *
 *  Đăng nhập ẩn danh để dữ liệu có chỗ đứng trong Firestore mà không dựng một
 *  bức tường trước mặt người mở thử — ban giám khảo bấm vào là dùng được ngay.
 *  Thầy nào cần buổi học theo mình sang máy khác thì bấm "Đăng nhập Google", và
 *  tài khoản ẩn danh được NỐI vào tài khoản đó chứ không bị vứt đi. */
export function watchUser(cb: (u: User | null) => void): () => void {
  const a = getAuthClient();
  if (!a) { cb(null); return () => {}; }
  return onAuthStateChanged(a, (u) => {
    if (!u) { void signInAnonymously(a).catch(() => cb(null)); return; }
    cb(u);
  });
}

export type LinkResult = { ok: true; switched: boolean } | { ok: false; why: string };

/** Nâng tài khoản ẩn danh lên tài khoản Google.
 *
 *  `switched: true` nghĩa là tài khoản Google đó đã có dữ liệu từ trước, nên
 *  không nối được và Catch đăng nhập thẳng vào nó. Buổi đang chấm dở trên máy
 *  này sẽ nhường chỗ cho dữ liệu cũ — giao diện phải nói trước, không được để
 *  thầy mất buổi mà không biết vì sao. */
export async function linkGoogle(): Promise<LinkResult> {
  const a = getAuthClient();
  if (!a) return { ok: false, why: 'Chưa cấu hình Firebase.' };
  const provider = new GoogleAuthProvider();
  const u = a.currentUser;
  try {
    if (u?.isAnonymous) {
      await linkWithPopup(u, provider);
      return { ok: true, switched: false };
    }
    await signInWithPopup(a, provider);
    return { ok: true, switched: false };
  } catch (e) {
    const code = (e as { code?: string })?.code ?? '';
    if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
      try {
        await signInWithPopup(a, provider);
        return { ok: true, switched: true };
      } catch { return { ok: false, why: 'Đăng nhập không xong. Thử lại.' }; }
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { ok: false, why: '' };
    }
    return { ok: false, why: 'Đăng nhập không xong. Kiểm tra kết nối rồi thử lại.' };
  }
}

export async function leaveAccount(): Promise<void> {
  const a = getAuthClient();
  if (a) await signOut(a);
}
