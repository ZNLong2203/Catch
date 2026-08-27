/** Cấu hình Firebase của dự án `catch-64526`.
 *
 *  Ghi thẳng vào mã nguồn, có chủ ý. Ba lý do, theo thứ tự quan trọng:
 *
 *  1. **Đây không phải bí mật.** Google thiết kế cụm này để lộ ra trình duyệt —
 *     nó chỉ định danh dự án. Thứ chặn người lạ là `firestore.rules`, đã thử
 *     trên emulator: hai thầy khác nhau đọc hay ghi vào dữ liệu của nhau đều
 *     `permission-denied`. Giấu mấy dòng này đi không thêm lớp an toàn nào, vì
 *     bất kỳ ai mở DevTools cũng đọc được chúng trong gói JavaScript.
 *  2. **Next nướng `NEXT_PUBLIC_*` vào gói JavaScript LÚC BUILD.** AI Studio tự
 *     dựng lại app từ kho mã và chỉ đặt sẵn `GEMINI_API_KEY` — không có chỗ nào
 *     truyền sáu biến này vào lúc đó. Để trống thì bản deploy mất đồng bộ trong
 *     im lặng, mà triệu chứng lại giống hệt "chưa đăng nhập". Kiểu hỏng khó tìm nhất.
 *  3. Biến môi trường vẫn đè lên được, để ai fork về trỏ sang dự án của họ.
 *
 *  Bí mật THẬT của Catch vẫn là `GEMINI_API_KEY`, và nó ở máy chủ, không bao giờ
 *  đi xuống trình duyệt.
 *
 *  Việc nên làm trong Google Cloud Console: khoá `apiKey` này theo HTTP referrer,
 *  chỉ cho tên miền của Catch. Không phải để giữ bí mật — mà để người khác không
 *  mượn hạn mức Firebase của dự án này. */
export const MAC_DINH = {
  apiKey: 'AIzaSyC6WilJSncRV1Je7Y_hULr0tjCIASYCUC4',
  authDomain: 'catch-64526.firebaseapp.com',
  projectId: 'catch-64526',
  storageBucket: 'catch-64526.firebasestorage.app',
  messagingSenderId: '676963947701',
  appId: '1:676963947701:web:9474cb2419fca83b799afc',
  measurementId: 'G-7M943PSER2',
} as const;

export type FirebaseConfig = { -readonly [K in keyof typeof MAC_DINH]: string };

/** Biến môi trường đè lên cấu hình mặc định — nhưng chuỗi rỗng thì không tính là
 *  đè. Một biến khai báo mà bỏ trống trong lần deploy vội là chuyện thường, và
 *  nó phải cho ra bản chạy được chứ không phải một `apiKey` rỗng. */
export function resolveConfig(env: Record<string, string | undefined>): FirebaseConfig {
  const lay = (ten: string, macDinh: string) => {
    const v = env[ten];
    return v && v.trim() !== '' ? v.trim() : macDinh;
  };
  return {
    apiKey: lay('NEXT_PUBLIC_FIREBASE_API_KEY', MAC_DINH.apiKey),
    authDomain: lay('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', MAC_DINH.authDomain),
    projectId: lay('NEXT_PUBLIC_FIREBASE_PROJECT_ID', MAC_DINH.projectId),
    storageBucket: lay('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', MAC_DINH.storageBucket),
    messagingSenderId: lay('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', MAC_DINH.messagingSenderId),
    appId: lay('NEXT_PUBLIC_FIREBASE_APP_ID', MAC_DINH.appId),
    measurementId: lay('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID', MAC_DINH.measurementId),
  };
}
