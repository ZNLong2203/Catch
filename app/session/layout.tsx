import type { Metadata } from 'next';

/** Chỉ để đặt tiêu đề tab. Không vẽ thêm gì — chế độ bờ hồ là màn hình tràn
 *  viền, thêm một lớp bọc có kiểu dáng là phá nó.
 *
 *  Trước đây cả năm trang dùng chung một tiêu đề, mà thầy được khuyến khích mở
 *  bảng ưu tiên ở tab khác (xem useSession) và lối tắt của app cũng mở thẳng
 *  vào đây — ba tab giống hệt nhau thì không tab nào nhận ra được. */
/* Đặt cả `template` chứ không chỉ chuỗi trơn: hai trang con nằm dưới layout này
   phải được nối hậu tố "· Catch" giống mọi trang khác. Để chuỗi trơn thì tab của
   chúng chỉ còn "Chế độ bờ hồ", mất hẳn tên sản phẩm. */
export const metadata: Metadata = {
  title: { default: 'Thứ tự ưu tiên', template: '%s · Catch' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
