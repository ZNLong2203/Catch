import Link from 'next/link';

/** Dấu hiệu nhận diện, và là đường về chỗ chấm.
 *
 *  Bấm vào logo để về trang đầu là thói quen ai cũng có trên web — không có nó
 *  thì người dùng bấm vào rồi tưởng trang bị đơ. Trước đây chỗ này là một thẻ
 *  `div` trơ, nên cú bấm ấy rơi vào hư không.
 *
 *  Cố ý KHÔNG dùng ở chế độ bờ hồ: màn hình đó bỏ gần hết mọi thứ vì thầy đứng
 *  cạnh hồ, tay ướt, nắng chói — thêm một thứ bấm được là thêm một thứ bấm nhầm. */
export function Brand({ tagline = false }: { tagline?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Catch — về chỗ chấm"
      className="group flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80"
    >
      {/* Hai vệt nước và một chấm — chấm là cái Catch bắt được */}
      <svg
        viewBox="0 0 36 24" aria-hidden
        className="h-6 w-9 shrink-0 text-aqua"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      >
        <path d="M2 9c3.2-4 6-4 9 0s5.8 4 9 0 6-4 9 0" opacity=".55" />
        <path d="M2 16c3.2-4 6-4 9 0s5.8 4 9 0 6-4 9 0" opacity=".3" />
        <circle cx="20" cy="9" r="2.6" fill="currentColor" stroke="none" />
      </svg>
      <div>
        <p className="text-[17px] font-bold leading-none tracking-tight">Catch</p>
        {tagline && <p className="mt-1 text-xs text-dim">Trợ giảng cho lớp phổ cập bơi</p>}
      </div>
    </Link>
  );
}
