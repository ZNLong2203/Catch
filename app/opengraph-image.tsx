import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Catch — trợ giảng cho lớp phổ cập bơi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Ảnh hiện ra khi dán link Catch vào Zalo, Facebook, nhóm giáo viên.
 *  Không có nó thì link hiện trống trơn — mà link này sẽ được dán đi dán lại. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '72px 80px',
          background: 'linear-gradient(135deg, #04080e 0%, #0a1620 55%, #06222b 100%)',
          color: '#e8f2f9', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="72" height="48" viewBox="0 0 36 24" fill="none" stroke="#2ad4ee" strokeWidth="1.8" strokeLinecap="round">
            <path d="M2 9c3.2-4 6-4 9 0s5.8 4 9 0 6-4 9 0" opacity="0.55" />
            <path d="M2 16c3.2-4 6-4 9 0s5.8 4 9 0 6-4 9 0" opacity="0.3" />
            <circle cx="20" cy="9" r="2.6" fill="#2ad4ee" stroke="none" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Catch</div>
            <div style={{ fontSize: 20, color: '#94aabd' }}>Trợ giảng cho lớp phổ cập bơi</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 26, color: '#2ad4ee' }}>
            Mỗi năm gần 2.000 trẻ em Việt Nam chết đuối
          </div>
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1.5, maxWidth: 960 }}>
            Một thầy, ba mươi em, bốn mươi lăm phút.
          </div>
          <div style={{ fontSize: 34, color: '#94aabd', maxWidth: 960 }}>
            Thầy không thiếu kiến thức — thầy thiếu số con mắt.
          </div>
        </div>

        <div style={{ fontSize: 20, color: '#5f7689' }}>
          #BuildwithGoogleAI · AI Riser Vietnam 2026
        </div>
      </div>
    ),
    size,
  );
}
