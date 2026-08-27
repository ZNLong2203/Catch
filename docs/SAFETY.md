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

## 3b. Buổi học nằm trên Firestore — và đây là những gì kèm theo

Tên các em và kết quả chấm nằm ở **hai chỗ**: localStorage của trình duyệt máy thầy, và
**Firestore** (`lib/cloud.ts`). localStorage là bản đọc được khi mất sóng ở bờ hồ; Firestore
là bản theo tài khoản, mở máy khác vẫn còn.

Bản trước của tài liệu này lập luận ngược lại — rằng không có cơ sở dữ liệu thì không phải
trả lời *ai được xem, giữ bao lâu, xoá thế nào, ai chịu trách nhiệm khi lộ*. Quyết định đã
đổi, nên bốn câu đó bây giờ **phải có câu trả lời thật**, và đây là chúng:

**Ai được xem.** Chỉ chủ tài khoản. `firestore.rules` chặn theo `request.auth.uid`, mọi
đường khác đóng cứng. Đã thử trên emulator: thầy B đọc dữ liệu thầy A → `permission-denied`;
ghi vào → `permission-denied`. Không deploy luật này thì mọi thứ ở trên vô nghĩa:
`firebase deploy --only firestore:rules`.

**Giữ bao lâu.** Tối đa 20 buổi, đủ một khoá phổ cập bơi. Buổi thứ 21 đẩy buổi cũ nhất
ra và **xoá thật khỏi Firestore**, không chỉ ẩn khỏi màn hình. Firestore không tự rụng như
localStorage, nên hạn lưu trữ phải do code giữ — `finishSession` trong `components/useSession.ts`.

**Xoá thế nào.** *Xoá hết* trong bảng ưu tiên xoá luôn trên Firestore. Buổi để ngỏ mồ côi
— sinh ra khi thầy mở Catch trên hai máy cùng lúc — được dọn tự động: rỗng thì xoá, **có em
trong đó thì đóng lại cho vào kho chứ không vứt**.

**Ai chịu trách nhiệm khi lộ.** Chủ dự án Firebase. Đây là câu chưa có lời đáp thể chế, và
nó nằm trong mục *chưa xử lý xong* bên dưới — không phải chỗ để lờ đi.

Hai thứ **không** đổi:

- **Video không bao giờ được lưu ở đâu cả.** Không lên Firestore, không lên Storage, không
  thumbnail. Nó đi thẳng lên Gemini và bị xoá trong `finally`. Ranh giới này không thương lượng.
- **Chưa đăng nhập thì không được nói là đã an toàn.** Tài khoản ẩn danh có dữ liệu thật
  trên Firestore, nhưng đường về nó nằm trong trình duyệt này — xoá dữ liệu duyệt web là mất.
  Giao diện gọi trạng thái đó là *"chỉ máy này"*, cố ý không dùng chữ "đám mây".

Nút *Lưu ra tệp* vẫn giữ: một tệp cầm tay không phụ thuộc vào tài khoản nào còn sống hay
dự án Firebase nào còn hạn mức.

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

- **Chưa có cơ chế xin phép phụ huynh — và việc chuyển sang Firestore làm chỗ này gấp hơn
  hẳn.** Khi hồ sơ chỉ nằm trong máy thầy, thiếu bước đồng ý là thiếu sót. Khi nó nằm trên
  máy chủ của một dự án Firebase có chủ sở hữu, thiếu bước đồng ý là một khoản nợ pháp lý.
  Đây là việc số một trước khi có người dùng thật.
- **Chưa có chính sách riêng tư công bố và chưa nêu ai là bên chịu trách nhiệm dữ liệu.**
  Có cơ sở dữ liệu thì hai thứ này là bắt buộc, không phải tuỳ chọn.
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
