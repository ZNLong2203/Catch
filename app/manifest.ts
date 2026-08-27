import type { MetadataRoute } from 'next';

/** Cài lên màn hình chính, và chạy được khi không có mạng.
 *
 *  Không phải để có thêm một cái nhãn "PWA". Chế độ bờ hồ vốn **không cần mạng**:
 *  buổi học nằm hết trong localStorage của máy, không có lệnh gọi máy chủ nào.
 *  Thầy đứng cạnh hồ ở trường huyện, sóng chập chờn, vẫn mở được thứ tự ưu tiên
 *  và đánh dấu đã sửa cho từng em. Chỉ khâu CHẤM mới cần mạng. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Catch — trợ giảng cho lớp phổ cập bơi',
    short_name: 'Catch',
    description:
      'Quay mười lăm giây một em đang bơi. Catch chỉ ra lỗi kèm mốc thời gian và xếp thứ tự '
      + 'em nào cần thầy sửa trước — theo rủi ro đuối nước.',
    lang: 'vi',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#04080e',
    theme_color: '#04080e',
    categories: ['education', 'sports', 'health'],
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Chế độ bờ hồ', short_name: 'Bờ hồ', url: '/session/poolside' },
      { name: 'Thứ tự ưu tiên', short_name: 'Ưu tiên', url: '/session' },
    ],
  };
}
