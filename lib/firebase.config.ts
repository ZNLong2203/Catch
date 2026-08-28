/** Cấu hình dự án catch-64526. Ghi cứng có chủ ý: cụm này công khai theo thiết kế
 *  của Google (firestore.rules mới là thứ chặn người lạ), mà Next nướng
 *  NEXT_PUBLIC_* vào gói JS lúc BUILD — AI Studio dựng lại từ kho mã và chỉ đặt sẵn
 *  GEMINI_API_KEY, để trống thì bản deploy mất đồng bộ trong im lặng.
 *  Nên khoá apiKey theo HTTP referrer trong Cloud Console. */
export const DEFAULTS = {
  apiKey: 'AIzaSyC6WilJSncRV1Je7Y_hULr0tjCIASYCUC4',
  authDomain: 'catch-64526.firebaseapp.com',
  projectId: 'catch-64526',
  storageBucket: 'catch-64526.firebasestorage.app',
  messagingSenderId: '676963947701',
  appId: '1:676963947701:web:9474cb2419fca83b799afc',
  measurementId: 'G-7M943PSER2',
} as const;

export type FirebaseConfig = { -readonly [K in keyof typeof DEFAULTS]: string };

/** Chuỗi rỗng KHÔNG tính là đè — biến bỏ trống phải cho ra bản chạy được. */
export function resolveConfig(env: Record<string, string | undefined>): FirebaseConfig {
  const pick = (key: string, fallback: string) => {
    const v = env[key];
    return v && v.trim() !== '' ? v.trim() : fallback;
  };
  return {
    apiKey: pick('NEXT_PUBLIC_FIREBASE_API_KEY', DEFAULTS.apiKey),
    authDomain: pick('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', DEFAULTS.authDomain),
    projectId: pick('NEXT_PUBLIC_FIREBASE_PROJECT_ID', DEFAULTS.projectId),
    storageBucket: pick('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', DEFAULTS.storageBucket),
    messagingSenderId: pick('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', DEFAULTS.messagingSenderId),
    appId: pick('NEXT_PUBLIC_FIREBASE_APP_ID', DEFAULTS.appId),
    measurementId: pick('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', DEFAULTS.measurementId),
  };
}
