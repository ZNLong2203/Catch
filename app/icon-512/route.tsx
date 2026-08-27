import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
/* KHÔNG export `contentType` ở đây. Đây là Route Handler, không phải tệp
   metadata icon — `contentType` không nằm trong danh sách export hợp lệ của
   Route Handler và làm bước kiểm kiểu của bản dựng webpack thất bại. Không cần
   nó: `ImageResponse` đã tự đặt content-type: image/png. */

/** Biểu tượng cho manifest. Sinh bằng next/og lúc build thay vì kèm sẵn tệp PNG —
 *  một nguồn hình duy nhất, sửa một chỗ là cả hai cỡ đổi theo. */
export function GET() {
  const S = 512;
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: '#04080e',
      }}>
        <svg width={S * 0.72} height={S * 0.48} viewBox="0 0 36 24" fill="none"
             stroke="#2ad4ee" strokeWidth="2.1" strokeLinecap="round">
          <path d="M2 9c3.2-4 6-4 9 0s5.8 4 9 0 6-4 9 0" opacity="0.55" />
          <path d="M2 16c3.2-4 6-4 9 0s5.8 4 9 0 6-4 9 0" opacity="0.3" />
          <circle cx="20" cy="9" r="3" fill="#2ad4ee" stroke="none" />
        </svg>
      </div>
    ),
    { width: S, height: S },
  );
}
