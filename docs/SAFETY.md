# Thiết kế an toàn

Catch đứng cạnh một con số: **gần 2.000 trẻ em dưới 16 tuổi ở Việt Nam chết đuối
mỗi năm**, tỷ suất cao nhất Đông Nam Á. Một công cụ chấm kỹ thuật bơi làm sai chỗ
nào cũng có thể góp phần vào con số đó. Bốn ràng buộc dưới đây không phải tính
năng, chúng là điều kiện để sản phẩm được phép tồn tại.

## 1. Catch không bao giờ nói một đứa trẻ "biết bơi" hay "an toàn"

Biết bơi và an toàn dưới nước là hai chuyện khác nhau. Trẻ chết đuối ở ao, hồ,
sông, kênh — nơi không có thành bám, nước đục, có dòng chảy, và không có ai đứng
cạnh. Một em bơi đẹp 25m trong hồ bơi vẫn có thể chết ở cái ao sau nhà.

Cho nên trong toàn bộ sản phẩm:

- Không có điểm tổng. Không có phần trăm. Không có xếp loại đạt/chưa đạt.
- Không có chữ "an toàn", "đạt chuẩn", "biết bơi" ở bất kỳ đầu ra nào.
- Mỗi báo cáo mang một dòng **không tắt được**:

> *Đây là nhận xét kỹ thuật cho một lần bơi trong hồ có người lớn đứng cạnh.
> Nó không phải giấy chứng nhận an toàn dưới nước, và không thay thế việc trông trẻ.*

Nếu có ai xin thêm cái nút "xuất giấy chứng nhận" thì câu trả lời là không.

## 2. Nhìn không rõ thì từ chối chấm

Đây là bản sao của cổng phát hành trong Verso — nơi máy chủ trả HTTP 409 khi còn
khối chưa ai xác nhận, thay vì chỉ ẩn cái nút đi.

Catch từ chối chấm khi:

- Video quay ngược sáng, mặt nước loá trắng, không thấy thân người
- Em bơi bị người khác che quá nửa thời lượng
- Quay quá xa, đầu người dưới một phần mười chiều cao khung hình
- Video ngắn hơn một chu kỳ động tác hoàn chỉnh
- Không nhìn thấy mặt nước tiếp xúc với đầu — không có cách nào xét lỗi thở

Khi từ chối, Catch nói **rõ lý do và cách quay lại**, không trả về một kết quả mờ
nhạt kèm chú thích nhỏ. Một kết quả sai mà nghe có lý nguy hiểm hơn nhiều so với
không có kết quả nào, vì thầy sẽ tin nó và sửa nhầm em.

## 3. Video không bao giờ được nghỉ lại qua đêm

Đầu vào của Catch là **video trẻ em mặc đồ bơi**. Đây là loại dữ liệu nhạy cảm
nhất mà một sản phẩm hackathon có thể chạm vào.

Quy tắc, không có ngoại lệ:

- Video đi thẳng từ trình duyệt lên Gemini Files API, **không qua Cloud Storage,
  không qua Firestore, không nằm trên đĩa của máy chủ**.
- Chấm xong, gọi xoá tệp trên Files API **ngay trong cùng một request**, kể cả khi
  việc chấm thất bại. Đặt trong `finally`, không đặt trong `try`.
- Thứ duy nhất được lưu lại là **kết quả dạng chữ**: mã lỗi, mốc thời gian, nhận
  xét. Không ảnh, không khung hình trích ra, không thumbnail.
- Không có thư viện video, không có lịch sử xem lại. Muốn xem lại thì thầy mở tệp
  gốc trên máy mình.
- `.gitignore` chặn mọi đuôi video ngay từ đầu — xem đầu tệp đó để biết vì sao.

Nếu buộc phải chọn giữa một tính năng hay và quy tắc này, bỏ tính năng.

## 3b. Buổi học cũng không rời khỏi máy giáo viên

Tên các em và kết quả chấm nằm trong **localStorage của chính trình duyệt trên máy thầy**
(`lib/session.ts`). Không tài khoản, không cơ sở dữ liệu, không đồng bộ.

Đây là một lựa chọn, không phải một chỗ chưa kịp làm. Một bảng danh sách trẻ em kèm nhận xét
về khả năng bơi của từng em là hồ sơ về trẻ vị thành niên; đưa nó lên máy chủ thì phải trả lời
ai được xem, giữ bao lâu, xoá thế nào, ai chịu trách nhiệm khi lộ. Để nguyên trên máy thầy thì
câu trả lời cho cả bốn câu hỏi đó là *không ai ngoài thầy*.

Cái giá phải trả, nói thẳng: đổi máy là mất buổi học, và hai thầy không chia sẻ được cho nhau.
Nút **In giáo án buổi sau** là đường thoát — thứ cần giữ lại thì in ra giấy.

## 4. Thầy quyết định, Catch chỉ xếp thứ tự

Catch không nói với học sinh. Catch nói với giáo viên, và giáo viên có toàn quyền
bỏ qua. Không có chế độ nào để em học sinh tự mở kết quả của mình lên xem — một
đứa trẻ đọc "em bơi sai bốn chỗ" là một đứa trẻ sợ nước hơn hôm qua, mà sợ nước
mới là thứ giết người.

## 5. Không nói với học sinh, kể cả gián tiếp

Bảng ưu tiên cả lớp (`/session`) xếp các em theo mức rủi ro. Đó là công cụ của thầy, không
phải bảng xếp hạng dán lên tường. Nên nó **không có điểm số, không có thứ hạng tổng, không
có màu đỏ cạnh tên em** ở bất cứ chỗ nào có thể chụp màn hình gửi cho phụ huynh — số thứ tự
chỉ là thứ tự công việc của thầy trong buổi sau.

Bản in cũng vậy: đó là giáo án, không phải phiếu nhận xét gửi về nhà.

## Chỗ chưa xử lý xong

- **Chưa có cơ chế xin phép phụ huynh.** Quay video trẻ em cần sự đồng ý, kể cả khi
  video bị xoá ngay. Bản dự thi nêu rõ đây là việc nhà trường làm trước khi dùng Catch;
  bản thật cần một bước ghi nhận ngay trong sản phẩm.
- **Chưa có huấn luyện viên bơi nào soát lại bảng lỗi** trong `SKILLS-AND-FAULTS.md`.
- Chưa chặn video có nhiều hơn một trẻ trong khung hình. Nghiêng về chặn — vừa vì quyền
  riêng tư của em không được quay, vừa vì model dễ chấm nhầm người.
- localStorage không có hạn xoá tự động. Kho buổi cũ giữ tối đa 20 buổi rồi rụng dần buổi
  cũ nhất, nhưng chưa có hạn theo thời gian. Nên có: buổi quá một khoá học thì tự dọn.
- **Tệp lưu ra ngoài thì Catch hết kiểm soát.** Nút *Lưu ra tệp* sinh một tệp JSON chứa tên
  các em và nhận xét của từng em. Nó vá được điểm yếu "đổi máy là mất", nhưng đổi lại là một
  tệp có thể bị gửi nhầm. Đã cân nhắc mã hoá tệp và bỏ ý định đó: một thầy quên mật khẩu thì
  mất trắng buổi học, mà xác suất đó cao hơn xác suất tệp bị gửi nhầm. Thay vào đó tên tệp
  ghi rõ lớp và ngày để thầy biết mình đang cầm cái gì.
