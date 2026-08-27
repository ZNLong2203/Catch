import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/NavBar';
import { RegisterSW } from '@/components/RegisterSW';
import { SessionProvider } from '@/components/SessionProvider';

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

/** Địa chỉ công khai chính thức.
 *
 *  Trang chủ là trang dựng sẵn lúc build, nên địa chỉ nào có mặt lúc đó sẽ bị nướng
 *  thẳng vào thẻ og:image. Trên Cloud Run `req.url` là 0.0.0.0:8080 của chính
 *  container, dùng nó thì ảnh chia sẻ trỏ vào hư không — nên không đọc từ request.
 *
 *  Đọc từ biến môi trường LÚC BUILD, và luôn có sẵn một địa chỉ thật để lùi về.
 *  Không bao giờ để giá trị giữ chỗ ở đây: một tên miền không tồn tại thì thẻ
 *  chia sẻ lên LinkedIn hay Facebook hiện ra một ô ảnh vỡ, và đó đúng là chỗ
 *  người lạ nhìn thấy dự án lần đầu.
 *
 *  Deploy lên Cloud Run thì truyền địa chỉ .run.app vào lúc build:
 *      docker build --build-arg NEXT_PUBLIC_SITE_URL=https://... */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://catch-zkare.ai.studio';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Catch — trợ giảng cho lớp phổ cập bơi', template: '%s · Catch' },
  description:
    'Quay mười lăm giây một em đang bơi. Catch chỉ ra lỗi kỹ thuật kèm mốc thời gian '
    + 'bấm vào xem lại được, và xếp thứ tự em nào cần thầy sửa trước — theo rủi ro '
    + 'đuối nước, không theo mức xấu của động tác.',
  applicationName: 'Catch',
  appleWebApp: { capable: true, title: 'Catch', statusBarStyle: 'black-translucent' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Catch',
    title: 'Catch — trợ giảng cho lớp phổ cập bơi',
    description: 'Một thầy, ba mươi em, bốn mươi lăm phút. Thầy không thiếu kiến thức — thầy thiếu số con mắt.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#04080e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body className="font-sans antialiased">
        <a href="#lam-viec" className="link-skip">Bỏ qua, tới thẳng chỗ làm việc</a>
        <SessionProvider>
          <NavBar />
          {children}
        </SessionProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
