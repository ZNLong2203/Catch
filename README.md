# Catch — trợ giảng cho lớp phổ cập bơi

**Quay mười lăm giây một em đang bơi. Catch chỉ ra lỗi kèm mốc thời gian bấm vào xem lại
được, và xếp thứ tự em nào cần thầy sửa trước.**

Dự thi **AI Riser Vietnam 2026 · #BuildwithGoogleAI** — hạng mục *Văn hoá · Du lịch · Thể thao*

---

## Vấn đề

Mỗi năm, **gần 2.000 trẻ em Việt Nam dưới 16 tuổi tử vong vì đuối nước**.[^1] Tỷ suất
**cao nhất Đông Nam Á**, gấp khoảng **8 lần các nước phát triển**,[^2] và đuối nước nằm
trong **mười nguyên nhân tử vong hàng đầu** ở trẻ từ 5 đến 14 tuổi.[^1]

Nhà nước đã trả lời: Chương trình phòng chống tai nạn thương tích trẻ em **2021–2030** đặt
mục tiêu **giảm 20%** số trẻ tử vong do đuối nước, với dạy bơi và dạy kỹ năng an toàn làm
trụ cột.[^3] Các lớp phổ cập bơi đang chạy trên khắp cả nước.

**Nút thắt không nằm ở chương trình, mà nằm trong bốn mươi lăm phút của một buổi học.**

Một thầy, ba mươi em dưới nước. Thầy không thiếu kiến thức — thầy thiếu **số con mắt**.
Trong một buổi, thầy không thể nhìn kỹ động tác của từng em. Em nào ồn ào thì được sửa. Em
nào im lặng bơi sai thì cứ sai như thế cho tới hết khoá.

[^1]: [Bộ Y tế — Đuối nước khiến gần 2.000 trẻ em Việt Nam dưới 16 tuổi tử vong mỗi năm](https://moh.gov.vn/en/web/phong-chong-tai-nan-thuong-tich/tin-noi-bat/-/asset_publisher/iinMRn208ZoI/content/-uoi-nuoc-khien-gan-2-000-tre-em-viet-nam-duoi-16-tuoi-tu-vong-moi-nam) · [Sức khoẻ & Đời sống, 17/12/2025](https://suckhoedoisong.vn/moi-nam-gan-2000-tre-em-viet-nam-tu-vong-vi-duoi-nuoc-cao-hon-nhieu-lan-mot-so-quoc-gia-169251217144101782.htm)
[^2]: [VietNamNet — Trẻ em, học sinh đuối nước ở Việt Nam cao nhất Đông Nam Á](https://vietnamnet.vn/tre-em-hoc-sinh-duoi-nuoc-o-viet-nam-cao-nhat-dong-nam-a-2028725.html) · [VOV](https://vov.vn/xa-hoi/tu-vong-do-duoi-nuoc-o-viet-nam-cao-gap-10-lan-cac-nuoc-phat-trien-824212.vov)
[^3]: Chương trình phòng, chống tai nạn, thương tích trẻ em giai đoạn 2021–2030 do Thủ tướng Chính phủ phê duyệt.

## Chỗ các công cụ chấm dáng hiện có bỏ trống

Đã có nhiều ứng dụng chấm kỹ thuật thể thao qua video. Nhưng tất cả đều nói với **người
tập**, và chấm theo **mức xấu của động tác**. Sách giáo khoa bơi thi đấu không phải là thứ
lớp phổ cập bơi cần.

| | App chấm dáng thông thường | Catch |
|---|---|---|
| Nói với ai | vận động viên tự tập | **giáo viên đang đứng trước ba mươi em** |
| Trả lời câu gì | "động tác của tôi sai chỗ nào" | **"sửa cho em nào trước, sửa cái gì"** |
| Xếp ưu tiên theo | mức xấu của động tác | **rủi ro đuối nước** |
| Khi nhìn không rõ | vẫn chấm, kèm chú thích nhỏ | **từ chối chấm, nói rõ lý do** |
| Nhìn cả lớp | không có khái niệm lớp | **lỗi nào cả lớp cùng mắc thì dạy chung** |
| Video sau khi chấm | lưu vào thư viện | **xoá ngay, không lưu bất cứ đâu** |

### Hai thứ quan trọng nhất lại không phải kiểu bơi nào cả

Catch chấm **sáu nội dung**, và thứ tự này là cố ý:

| Nhóm | Nội dung |
|---|---|
| **Kỹ năng sinh tồn** | Đứng nước · Thả nổi ngửa |
| **Kiểu bơi** | Bơi ếch · Bơi trườn sấp · Bơi ngửa · Bơi bướm |

Một đứa trẻ **đứng nước và thả nổi được** thì sống sót khi rơi xuống ao, kể cả khi không
biết bơi kiểu nào cho ra hồn. Ngược lại thì không. Đó là lý do hai thứ này đứng trước mọi
kiểu bơi trong giao diện, và là lý do chúng nặng về nhóm đỏ hơn hẳn — có phép kiểm khoá
điều đó lại. Tổng cộng **33 lỗi**, mỗi lỗi kèm dấu hiệu nhìn thấy từ bờ và một bài sửa
cụ thể cho buổi sau.

### Trục chấm là chỗ Catch khác hẳn

Trẻ em Việt Nam chết đuối **ở ao, hồ, sông, kênh** — nơi không có thành bám, không có ai
đứng cạnh. Nên Catch xếp ưu tiên theo thứ khiến một đứa trẻ **kiệt sức và hoảng loạn giữa
chỗ không có chỗ bám**, chứ không theo thứ khiến động tác xấu đi:

| Nhóm | Lỗi | Vì sao xếp ở đây |
|---|---|---|
| 🔴 **Nguy hiểm ở chỗ sâu** | vùng vẫy đập tay lên mặt nước · chìm dần · nín thở · không có pha lướt · sặc nước | Em bơi được 10 m trong hồ nhưng hết hơi ở mét thứ 15 giữa ao |
| 🟡 **Mất kiểm soát** | đạp chân lệch · thân dựng đứng, hông chìm | Không giết ngay, nhưng làm em không tới được bờ mình nhắm tới |
| 🟢 **Hiệu suất** | quạt tay quá rộng · thân không xoay | Bơi tốn sức. Sửa lúc nào cũng được |

Hệ quả: một em bơi **xấu nhưng biết lướt và biết thở ra dưới nước** xếp **sau** một em bơi
**đẹp nhưng nín thở và không nghỉ**. Không app thể thao nào chấm theo trục này, vì không app
nào sinh ra từ một con số tử vong.

## Cách dùng

**Giáo viên** (máy tính hoặc điện thoại): đặt tên lớp → chọn kiểu bơi → tải video 15 giây
lên, hoặc dán link YouTube → Catch chấm → **bấm vào mốc thời gian để tự xem lại đúng giây
đó** → bỏ lỗi nào thấy không đúng → ghi em này vào buổi học → chấm em tiếp theo.

Hết buổi, mở **Thứ tự ưu tiên**: cả lớp được xếp theo mức rủi ro, kèm phần **dạy chung cho
cả lớp** với những lỗi mà từ một phần ba lớp trở lên cùng mắc — sửa một lần cho ba mươi em
thay vì ba mươi lần.

Buổi sau, thầy bấm **Kết thúc buổi học** rồi chấm lại. Từ đó trở đi Catch trả lời thêm một
câu mà chấm từng buổi rời rạc không nói được:

> *"Buổi trước tám trên mười hai em ngẩng đầu quá cao. Hôm nay còn ba."*

Và ba màn hình cho ba khoảnh khắc rất khác nhau của cùng một thầy:

| Màn hình | Thầy đang ở đâu | Bày cái gì |
|---|---|---|
| **Chỗ chấm** | ngồi máy, vừa quay xong | khung hình + mốc thời gian + bằng chứng thị giác |
| **Thứ tự ưu tiên** | ngồi máy, hết buổi | cả lớp, phần dạy chung, tiến bộ so buổi trước |
| **Chế độ bờ hồ** | **đứng cạnh hồ, tay ướt, nắng chói** | MỘT em, MỘT việc, chữ to, nút to, vuốt để sang em khác |

Chế độ bờ hồ cố ý **bỏ gần hết** — không mốc thời gian, không độ tin cậy, không bằng chứng
thị giác, chỉ một lỗi. Đứng cạnh hồ với ba mươi đứa trẻ đang gọi thì thêm một dòng chữ là
thêm một thứ để bỏ sót.

**In giáo án buổi sau** ra một tờ giấy cầm được ra bờ hồ, có cả phần tiến bộ và chỗ trống
để thầy ghi tay. **Lưu ra tệp / Nạp từ tệp** để mang buổi học sang máy khác.

Cài được lên màn hình chính, và **chạy được khi không có mạng** — trừ đúng khâu chấm.
Không phải để có thêm một cái nhãn: chế độ bờ hồ vốn không gọi máy chủ lần nào, nên thầy
đứng cạnh hồ trường huyện sóng chập chờn vẫn xem được thứ tự ưu tiên và đánh dấu đã sửa.
Service worker có một luật cứng: **không bao giờ đệm phản hồi chấm** — một kết quả cũ hiện
ra cho một em khác là đúng loại sai lầm nguy hiểm nhất của sản phẩm này.

## Thiết kế an toàn

Một công cụ đứng cạnh con số 2.000 trẻ em thì làm sai chỗ nào cũng có thể góp vào con số đó.
Bốn ràng buộc dưới đây không phải tính năng, chúng là điều kiện để sản phẩm được phép tồn tại.

**1. Catch không bao giờ nói một đứa trẻ "biết bơi" hay "an toàn".** Không có điểm tổng,
không có phần trăm, không có xếp loại đạt/chưa đạt, và không có nút xuất giấy chứng nhận.
Mỗi báo cáo mang một dòng không tắt được: *"Đây là nhận xét kỹ thuật cho một lần bơi trong hồ
có người lớn đứng cạnh. Nó không phải giấy chứng nhận an toàn dưới nước."*

**2. Nhìn không rõ thì từ chối chấm.** Ngược sáng, quay quá xa, mặt nước loá, em bị che quá
nửa thời lượng — Catch nói thẳng là không chấm được và chỉ cách quay lại. Một kết quả sai mà
nghe có lý còn nguy hiểm hơn không có kết quả nào, vì thầy sẽ tin nó và **sửa nhầm em**.

**2b. Hỏi model hai lượt, chỉ giữ lỗi xuất hiện ở cả hai.** Đo được: lỗi bịa **không cố
định** — cùng model, cùng video, lượt có lượt không. Một lỗi thật thì lượt nào cũng thấy.
Hai lượt chạy song song nên gần như không tốn thêm thời gian chờ (2,9 s so với 2,5 s),
chỉ token là gấp đôi. Bật mặc định. Số lỗi bị loại vì chỉ một lượt thấy được **hiện ra
cho thầy xem**.

**3. Mỗi lỗi bắt buộc có mốc thời gian, không có thì bị bỏ.** Máy chủ loại thẳng mọi lỗi
thiếu mốc, sai mã, hoặc mốc nằm ngoài thời lượng video — và **đếm số bị loại ra cho thầy
thấy**, vì bỏ trong im lặng là nói dối. Thầy bấm vào mốc, tự xem, tự phán, bỏ được lỗi nào
thấy sai. Catch xếp thứ tự, thầy quyết định.

**4. Video trẻ em không nghỉ lại qua đêm.** Đầu vào là video trẻ em mặc đồ bơi — loại dữ
liệu nhạy cảm nhất một sản phẩm hackathon có thể chạm vào. Video đi thẳng từ trình duyệt lên
Gemini Files API, **không qua Cloud Storage, không qua cơ sở dữ liệu, không nằm trên đĩa máy
chủ**, và bị xoá ngay trong cùng một request — lệnh xoá đặt trong `finally` chứ không phải
trong `try`, để hễ Gemini lỗi thì video vẫn được dọn.

Buổi học của thầy — tên các em, kết quả chấm, cả kho buổi cũ để so tiến bộ — nằm trong
**localStorage của chính trình duyệt trên máy thầy**. Không tài khoản, không cơ sở dữ liệu,
không có gì rời khỏi máy. Cái giá là đổi máy thì mất; đường thoát là nút *Lưu ra tệp*.

## Đã đo được gì

Đo ngày **26/08/2026**. Quy trình ở `private/KILL-TEST.md`, bảng đầy đủ ở
[docs/AI-INTEGRATION.md](docs/AI-INTEGRATION.md), chạy lại bằng `npm run probe`.

**Chọn model bằng đối chứng âm, không bằng bảng xếp hạng.** Cho cả sáu model xem video
một nhà vô địch thế giới bơi đúng kỹ thuật, và xem model nào chịu im lặng:

| Model | Đối chứng âm | Ca khó |
|---|---|---|
| `gemini-3.5-flash-lite` | **sạch 4/4 lượt**, 2–6 s | ✓ 7,9 s |
| `gemini-3.6-flash` | sạch 3/4 — một lượt bịa ra một lỗi | ✓ 39,7 s |
| `gemini-3.1-flash-lite` | bịa một lỗi | ✓ 14,9 s |
| `gemini-3.5-flash` | một lượt bịa, một lượt 504, một lượt 429 | 64–89 s |
| `gemini-3.7-flash` | 504 liên tục | — |

Với sản phẩm mà thầy sẽ **tin rồi đi sửa cho học sinh**, *không bịa* quan trọng hơn *bắt
được nhiều*. Cả ba model nhanh đều bắt được ca khó; chỉ một model không lượt nào bịa.

**Hai đường nạp, một phán quyết.** Cùng tám nội dung, nạp một lần bằng URL YouTube và một
lần bằng tệp tải lên: **8/8 cho đúng cùng kết quả**. Và với hai clip được cắt ra từ giữa
video gốc, **mốc thời gian dịch đúng theo độ lệch chỗ cắt** — 0:05 và 1:00. Model đang thật
sự định vị sự việc trong thời gian, không phát ra một con số cố định.

**Video bị xoá — đo được, không phải tự nhận.** Sau tám lượt tải lên, gọi `files.list()`
trả về rỗng: không tệp nào nằm lại trên máy chủ Google.

**Chấm hai lượt lọc được gì.** Trên một video dài nhiều người, chấm một lượt bốn lần liên
tiếp cho ra **3 · 3 · 1 · 0 lỗi** — gần như nhiễu. Hai lượt thì ổn định, và loại 2–3 lỗi
mỗi lần vì chỉ một lượt thấy. Trên video ngắn một người bơi — đúng thứ giáo viên sẽ quay —
**năm trên sáu video cho kết quả giống hệt nhau ba lượt liền.**

Giới hạn nằm ở loại video, không nằm ở sản phẩm; và loại video ổn định lại đúng là loại
giáo viên sẽ quay: mười lăm giây, một em.

**Hai cái bẫy đã vấp và đã vá.** Một lượt gọi model từng chạy **317 giây** trong khi trần
`deadline` cũ không chặn được — nó chỉ kiểm giữa các lần thử lại. Giờ mỗi lượt mang
`AbortSignal.timeout()` riêng. Và `npm install` trần làm hỏng cả cây phụ thuộc vì script
`prepare` của `@google/genai` — xem [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Bốn ô vẫn để trống có chủ ý: độ lệch mốc thời gian, ảnh hưởng của lời thoại trong video dạy
học, video dọc so với ngang, và **lỗi thật của nhóm sinh tồn** — bảy video công khai đã thử
đều là người làm đúng, nên với hai kỹ năng quan trọng nhất, Catch mới chứng minh được nó
không bịa, chưa chứng minh được nó bắt đúng lỗi.

## Công nghệ

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Gemini · Cloud Run

| Việc | Công nghệ Google |
|---|---|
| Đọc video bơi, chỉ lỗi kèm mốc thời gian | Gemini multimodal + Files API + `responseSchema` |
| Nhận thẳng link YouTube, không cần tải về | Gemini `fileData.fileUri` |
| Ảnh chia sẻ khi dán link vào Zalo, Facebook | `next/og` |
| Triển khai công khai | Cloud Run (`asia-southeast1`) |

**Khoá API không bao giờ vào trình duyệt.** Mọi lệnh gọi Gemini đi qua route handler phía
máy chủ; `lib/gemini.server.ts` mở đầu bằng `import 'server-only'`.

**Prompt và schema ràng buộc theo kiểu bơi.** Gửi video bơi ếch thì enum chỉ chứa mã `BR_`.
Không làm thế thì model mượn mã của kiểu bơi khác để mô tả một hiện tượng đúng — chuyện này
đã xảy ra thật trong phép thử ngày 26/08.

## Triển khai

**Chỉ cần Publish trên Google AI Studio.** Nó tự dựng một dịch vụ Cloud Run và đặt tên miền
`.ai.studio` làm cửa trước — hai đường dẫn là **cùng một máy chủ**, đã kiểm bằng cách băm
nội dung cả hai. Một lần Publish thoả cả yêu cầu "dựng bằng AI Studio" lẫn "triển khai lên
Cloud Run" của thể lệ.

Catch đọc đúng **một** biến môi trường — `GEMINI_API_KEY` — mà AI Studio tự đặt sẵn. Không
Secrets, không service account, không quyền IAM. Đó là hệ quả trực tiếp của việc không dùng
cơ sở dữ liệu: không có cơ sở dữ liệu thì không có gì để cấu hình sai.

Chi tiết và ba cái bẫy ở [docs/DEPLOY-AI-STUDIO.md](docs/DEPLOY-AI-STUDIO.md).

## Chạy tại máy

```bash
npm install --ignore-scripts     # ← cờ này bắt buộc, xem docs/DEPLOYMENT.md
cp .env.local.example .env.local # rồi điền khoá Gemini
npm run dev
```

```bash
npm test          # 46 phép kiểm: cổng chặn, giao hai lượt, bảng lỗi, ưu tiên, tiến bộ
npm run probe     # chạy lại phép thử sống chết trên 7 video công khai
npm run eval      # bộ đối chứng: 7 ca qua YouTube + 10 ca qua tệp, so với kết quả đã đo
node private/probe/bench.mjs   # so model trên chính video bơi
```

`npm test` kiểm được logic thuần; chỉ `npm run eval` kiểm được thứ quan trọng nhất — sau
khi sửa prompt hay đổi model, Gemini có còn nhìn ra đúng lỗi trên đúng video hay không.

Không cần tự quay video để thử: mở app, chọn nội dung, bấm tab **Xem thử ngay**. Bảy video
mẫu đều chấm thật, và mỗi cái đã được đo ba lượt liên tiếp phải ra kết quả giống hệt nhau
mới được đưa vào — xem `lib/demos.ts`.

## Tài liệu

| | |
|---|---|
| [SKILLS-AND-FAULTS.md](docs/SKILLS-AND-FAULTS.md) | Sáu nội dung, 33 lỗi, trục xếp ưu tiên theo rủi ro đuối nước — **linh hồn sản phẩm** |
| [SAFETY.md](docs/SAFETY.md) | Bốn ràng buộc không được phá, và chỗ chưa xử lý xong |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Ranh giới client/máy chủ, mô hình `Fault`, ba cái bẫy đã vấp |
| [AI-INTEGRATION.md](docs/AI-INTEGRATION.md) | Prompt, schema, bảng số đo thật |
| [DEPLOY-AI-STUDIO.md](docs/DEPLOY-AI-STUDIO.md) | Vì sao chỉ cần Publish trên AI Studio là đủ |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Chạy tại máy, hạn mức Gemini, bảng xử lý sự cố |

## Cấu trúc

```
docs/                   tài liệu — đọc SKILLS-AND-FAULTS.md trước
app/
  page.tsx              xưởng làm việc của giáo viên
  session/page.tsx      thứ tự ưu tiên của cả lớp + tiến bộ so buổi trước
  session/poolside/     chế độ bờ hồ — một em một màn hình
  session/print/        giáo án buổi sau, bản in nền trắng
  api/analyze/          nhận video, gọi Gemini, xoá tệp, trả Fault[]
lib/
  faults.ts             33 lỗi × 6 nội dung + nhóm đỏ/vàng/xanh + bài sửa  ← linh hồn
  prompt.ts             prompt riêng từng nội dung, sinh từ bảng lỗi
  normalize.ts          cổng chặn + giao hai lượt — hàm thuần, có kiểm
  gemini.server.ts      Files API, schema, trần cứng mỗi lượt, XOÁ trong finally
  session.ts            buổi học + kho buổi cũ trong localStorage, xếp ưu tiên
  progress.ts           so một em và cả lớp với buổi trước — hàm thuần, có kiểm
  demos.ts              bảy video mẫu, mỗi cái đã đo ba lượt phải giống nhau
components/
  Review.tsx            thanh thời gian có mốc bấm nhảy được  ← quyết định độ tin
  PriorityBoard.tsx     bảng ưu tiên cả lớp + phần dạy chung
test/                   46 phép kiểm
```

## Điều Catch chưa làm được

- Bảng lỗi **chưa có huấn luyện viên bơi nào soát lại**. Đây là việc kế tiếp, và là câu hỏi
  đầu tiên bất kỳ ai trong nghề cũng sẽ đặt ra.
- Chưa chạy thật ở hồ bơi trường học nào. Chưa có người dùng thật.
- Chưa có cơ chế xin phép phụ huynh ngay trong sản phẩm — hiện coi đây là việc nhà trường
  làm trước khi dùng Catch.
- **Chưa chứng minh được Catch bắt đúng lỗi của hai kỹ năng sinh tồn** — bảy video công khai
  đã thử đều là người làm đúng. Cần quay thật ở hồ bơi trường.
- Video dài, nhiều người trong khung hình thì kết quả không đáng tin; Catch chặn ở 90 giây
  nhưng chưa chặn được chuyện nhiều người.

## Miễn trừ

Catch là công cụ hỗ trợ giáo viên quan sát, **không phải công cụ đánh giá năng lực bơi của
học sinh và không phải căn cứ để kết luận một đứa trẻ an toàn dưới nước**. Biết bơi và an
toàn dưới nước là hai chuyện khác nhau. Mọi nhận xét cần giáo viên xem lại trước khi dùng.
