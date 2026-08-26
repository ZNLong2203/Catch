# Bảng lỗi — linh hồn của Catch

Tệp này là thứ quyết định Catch có giá trị hay không. Mọi thứ khác chỉ là ống dẫn.
`lib/faults.ts` sinh ra từ đây, không phải ngược lại.

## Catch chấm cho ai

**Cho giáo viên, không cho học sinh.** Đây là quyết định thiết kế quan trọng nhất của
cả dự án, và là chỗ Catch khác mọi app chấm dáng khác.

Một buổi phổ cập bơi ở trường Việt Nam có một thầy và hai ba chục em dưới nước. Thầy
không thiếu kiến thức — thầy thiếu **số con mắt**. Trong bốn mươi lăm phút, thầy không
thể nhìn kỹ động tác của từng em, nên em nào ồn ào thì được sửa, em nào im lặng bơi sai
thì cứ sai như thế cho tới hết khoá.

Catch không dạy bơi. Catch trả lời đúng một câu hỏi của thầy:

> **"Trong 30 em hôm nay, sửa cho em nào trước, và sửa cái gì?"**

## Hai thứ quan trọng nhất không phải kiểu bơi nào cả

Catch chấm sáu nội dung, chia hai nhóm. Thứ tự này là cố ý.

| Nhóm | Nội dung | Trong phổ cập |
|---|---|---|
| **Kỹ năng sinh tồn** | Đứng nước · Thả nổi ngửa | có |
| **Kiểu bơi** | Bơi ếch · Bơi trườn sấp · Bơi ngửa · Bơi bướm | ba kiểu đầu |

Một đứa trẻ **đứng nước và thả nổi được** thì sống sót khi rơi xuống ao, kể cả khi
không biết bơi kiểu nào cho ra hồn. Ngược lại thì không. Đó là lý do hai thứ này đứng
trước mọi kiểu bơi trong giao diện, và là lý do chúng nặng về nhóm đỏ hơn hẳn — có phép
kiểm khoá điều đó lại trong `test/faults.test.ts`.

Bơi bướm nằm ngoài nội dung phổ cập; có ở đây cho câu lạc bộ và đội tuyển trường, và
được đánh dấu rõ trong giao diện.

## Xếp ưu tiên theo rủi ro đuối nước, không theo mức xấu của động tác

Đây là trục chấm mà không app thể thao nào dùng, và là lý do Catch tồn tại.

Trẻ em Việt Nam chết đuối **ở ao, hồ, sông, kênh** — không phải trong hồ bơi có thành
bám và có thầy đứng cạnh. Cho nên lỗi nào khiến một đứa trẻ **không tự cầm cự được ở chỗ
không có chỗ bám** thì nguy hiểm hơn hẳn lỗi nào chỉ làm động tác xấu đi.

| Nhóm | Nghĩa | Vì sao xếp ở đây |
|---|---|---|
| 🔴 **Nguy hiểm ở chỗ sâu** | không lướt · nín thở · chìm dần · vùng vẫy · sặc nước | Em bơi được 10 m trong hồ nhưng hết hơi ở mét thứ 15 giữa ao |
| 🟡 **Mất kiểm soát** | đạp chân lệch · thân dựng đứng · hông chìm | Không giết ngay, nhưng làm em không tới được bờ mình nhắm tới |
| 🟢 **Hiệu suất** | quạt tay rộng · thân không xoay · tay vào nước sai điểm | Bơi tốn sức. Sửa lúc nào cũng được |

Hệ quả, và đây là chỗ Catch làm ngược mọi app khác: một em bơi **xấu nhưng biết lướt và
biết thở ra dưới nước** xếp **sau** một em bơi **đẹp nhưng nín thở và bơi liên tục không
nghỉ**. Không bao giờ đảo thứ tự này để chiều mắt nhìn.

## Đứng nước — 5 lỗi

Không phải kiểu bơi. Là kỹ năng giữ mạng.

| Mã | Lỗi | Nhóm | Nhìn thấy từ bờ bằng gì |
|---|---|---|---|
| `TW_FLAILING` | Vùng vẫy, đập tay lên khỏi mặt nước | 🔴 | tay đập lên TRÊN mặt nước như trèo thang; người nhấp nhô |
| `TW_SINKING` | Chìm dần, miệng lúc trên lúc dưới | 🔴 | cằm ngập rồi lại nhô; phải gắng mới hớp được hơi |
| `TW_BREATH_HELD` | Nín thở giữa các nhịp | 🔴 | má phồng giữ hơi; hơi thở dồn dập về cuối |
| `TW_NO_SCULL` | Chỉ đạp chân, tay không quạt | 🟡 | tay ép sát thân hoặc chới với vô định |
| `TW_STIFF` | Người cứng, vai gồng | 🟡 | vai nhô cao khỏi mặt nước, cổ gồng |

`TW_FLAILING` là dấu hiệu kinh điển của người sắp đuối: tay đưa lên khỏi mặt nước thì
người tụt xuống, càng hoảng càng đập, càng đập càng chìm.

## Thả nổi ngửa — 5 lỗi

Kỹ năng sinh tồn số một: nổi được thì gần như không tốn sức và cầm cự được rất lâu.

| Mã | Lỗi | Nhóm | Nhìn thấy từ bờ bằng gì |
|---|---|---|---|
| `FL_CHIN_TUCKED` | Gập cằm vào ngực | 🔴 | cằm chạm ngực, mắt nhìn về phía chân; hông tụt ngay sau đó |
| `FL_HIPS_SINK` | Hông chìm, người gập chữ V | 🔴 | bụng thấp hơn ngực và chân; nước tràn qua mặt |
| `FL_BREATH_HELD` | Nín thở rồi thở ra hết một lúc | 🔴 | mỗi lần thở ra là cả người tụt một nấc |
| `FL_TENSE` | Người cứng, tay chân co | 🟡 | tay ép chặt thân, chân co, toàn thân căng |
| `FL_ARMS_DOWN` | Tay ép sát thân | 🟢 | hai tay xuôi dọc hông thay vì dang ngang |

## Bơi ếch — 7 lỗi

Kiểu được dạy đầu tiên ở trường Việt Nam.

| Mã | Lỗi | Nhóm |
|---|---|---|
| `BR_NO_GLIDE` | Không có pha lướt | 🔴 |
| `BR_BREATH_HELD` | Nín thở, không thở ra dưới nước | 🔴 |
| `BR_SCISSOR_KICK` | Đạp chân lệch, không đối xứng | 🟡 |
| `BR_HEAD_HIGH` | Ngẩng đầu quá cao, hông chìm | 🟡 |
| `BR_KNEES_FORWARD` | Co gối lên ngực thay vì kéo gót về mông | 🟢 |
| `BR_TIMING` | Sai nhịp tay chân | 🟢 |
| `BR_WIDE_PULL` | Quạt tay quá rộng, vượt đường vai | 🟢 |

> `BR_KNEES_FORWARD` được bổ sung sau phép thử ngày 26/08. Bảng lỗi ban đầu thiếu nó, và
> model đã mượn mã `FR_KNEE_KICK` của bơi trườn sấp để mô tả đúng hiện tượng này trên một
> video bơi ếch. Bài học: **enum phải ràng buộc theo nội dung đang chấm.**

## Bơi trườn sấp — 5 lỗi

`FR_BREATH_HELD` 🔴 · `FR_HEAD_LIFT_BREATH` 🟡 · `FR_KNEE_KICK` 🟡 ·
`FR_NO_ROTATION` 🟢 · `FR_OVERREACH` 🟢

## Bơi ngửa — 6 lỗi

`BK_WATER_OVER_FACE` 🔴 · `BK_CHIN_TUCKED` 🟡 · `BK_HIPS_SINK` 🟡 ·
`BK_KNEE_KICK` 🟡 · `BK_NO_ROTATION` 🟢 · `BK_BENT_RECOVERY` 🟢

Bơi ngửa có mặt nước ở ngoài nên thở dễ, hợp với em còn sợ úp mặt. Lỗi đỏ duy nhất là
**nước tràn qua mặt** — em sặc trong hồ là em sẽ hoảng ở chỗ sâu.

## Bơi bướm — 5 lỗi

`BF_BREATH_HELD` 🔴 · `BF_HEAD_HIGH` 🟡 · `BF_NO_UNDULATION` 🟢 ·
`BF_SINGLE_KICK` 🟢 · `BF_SHORT_PULL` 🟢

Nội dung đầy đủ của cả 33 lỗi — dấu hiệu nhìn thấy và bài sửa từng lỗi — nằm trong
`lib/faults.ts`. Tệp này là bản tóm để người trong nghề soát nhanh.

## Bốn nguyên tắc bắt buộc khi chấm

**1. Mỗi lỗi phải kèm mốc thời gian trong video.** Không có mốc thì máy chủ bỏ lỗi đó,
dù model có chắc đến đâu. Thầy phải bấm vào được để tự xem lại đúng giây đó và tự phán.
Đây là thứ biến "AI bảo thế" thành "tự xem mà kiểm".

**2. Nhìn không rõ thì nói không rõ.** Quay ngược sáng, quá xa, mặt nước loá, em bị che —
Catch **từ chối chấm** và nói rõ vì sao. Xem `SAFETY.md`.

**3. Nhiều nhất ba lỗi một em, một buổi.** Liệt kê tám lỗi cho một đứa trẻ mười tuổi là
cách chắc chắn nhất để không lỗi nào được sửa.

**4. Enum ràng buộc theo nội dung.** Chấm bơi ếch thì schema chỉ chứa mã `BR_`.

## Đã đo được gì

Xem bảng số đo cuối `AI-INTEGRATION.md` và quy trình ở `private/KILL-TEST.md`.

## Chỗ tài liệu này còn thiếu

- Bảng lỗi **chưa được một huấn luyện viên bơi nào ở Việt Nam soát lại.** Trước khi nộp,
  cần ít nhất một người trong nghề đọc qua và ký tên vào README — đó là thứ ban giám khảo
  sẽ hỏi đầu tiên.
- **Nhóm sinh tồn chưa có video nào cho thấy người tập làm SAI.** Đã thử bảy video công
  khai về đứng nước và thả nổi ngửa; tất cả đều là người hướng dẫn làm đúng. Nghĩa là với
  hai kỹ năng quan trọng nhất, Catch mới chứng minh được nó **không bịa**, chưa chứng minh
  được nó **bắt đúng lỗi**. Chỉ quay thật ở hồ bơi trường mới lấp được chỗ này, và đó là
  việc kế tiếp quan trọng nhất của cả dự án.
- Chưa có bài sửa nào được kiểm chứng ngoài thực địa.
