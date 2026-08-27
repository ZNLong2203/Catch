# Chạy và triển khai

## Chạy tại máy

```bash
npm install --ignore-scripts     # ← chú ý cờ này, xem "Hai cái bẫy" bên dưới
cp .env.local.example .env.local # rồi điền khoá Gemini
npm run dev
```

## Chạy thử bản production tại máy

```bash
npm run build && npm run postbuild
GEMINI_API_KEY=xxx node .next/standalone/server.js
```

Phải truyền khoá vào dòng lệnh — bản standalone **không đọc `.env.local`**. Xem bẫy số 2.

## Phép thử sống chết

```bash
npm run probe                        # 7 video công khai, model mặc định
npm run probe gemini-3.6-flash       # đổi model
npm run probe gemini-3.5-flash 3     # chỉ chạy video số 3
```

Script đọc khoá thẳng từ `.env.local`. Xem `private/KILL-TEST.md`.

## Hai cái bẫy đã vấp, ngày 26/08

**1. `npm install` trần làm hỏng cả cây phụ thuộc.**

`@google/genai` có script `prepare` chạy lỗi trên máy này. npm dừng giữa chừng, và
những gói xếp sau nó — `server-only`, `tailwindcss` — **không được cài**. Triệu chứng
không hề trỏ về nguyên nhân: Turbopack panic với `Failed to write app endpoint /page`,
kể cả khi trang chỉ có một dòng chữ.

Dùng `npm install --ignore-scripts`. `@google/genai` phát hành kèm `dist/` dựng sẵn nên
không cần script đó. Nếu về sau thêm gói nào thật sự cần postinstall thì chạy
`npm rebuild <gói>` riêng cho nó.

**2. Bản standalone không đọc `.env.local`.**

`next dev` và `next start` có đọc, `node .next/standalone/server.js` thì không. Trên
Cloud Run điều này không thành vấn đề vì khoá đặt ở cấu hình dịch vụ, nhưng chạy thử
production tại máy mà quên thì `/api/analyze` trả `THIEU_KHOA_API` và rất dễ đi tìm
nhầm chỗ.

## `npm run build` dựng bằng webpack, KHÔNG phải Turbopack

Đây là chỗ dễ bị ai đó "dọn dẹp" nhất, nên ghi rõ lý do.

Turbopack ở chế độ `output: 'standalone'` **cắt mã thành chunk rồi quên xuất một
mảnh ra đĩa**. Trình duyệt xin một tệp không tồn tại và ăn `ChunkLoadError` ngay
lần vẽ đầu. Lỗi này bị `catch` nuốt nên trang vẫn hiện — nó chỉ nằm trong console,
đúng chỗ ban giám khảo mở ra xem.

Tệ nhất là nó phụ thuộc vào **kích thước module**, không phải vào việc mã đúng hay
sai. Đo được ngày 28/08/2026: cùng một commit dựng sạch hai lần liên tiếp đều
không lỗi; thêm mười tám dòng chú thích vào `lib/firebase.client.ts` là hỏng ba
lần liên tiếp. Nghĩa là bất kỳ thay đổi nào sau này cũng có thể làm nó tái phát,
và `npm run build` vẫn báo thành công.

Bản dựng webpack không có lỗi đó — cùng mã nguồn, cùng phép thử, sạch. Chậm hơn
khoảng hai giây, đổi lấy một bản dựng nói thật.

`npm run build:turbo` giữ lại đường cũ để thử lại khi Next vá xong.

**Kèm theo:** webpack kiểm kiểu chặt hơn Turbopack, và nó bắt được một lỗi có sẵn
— hai tệp `app/icon-*/route.tsx` export `contentType`, thứ chỉ hợp lệ cho tệp
metadata icon chứ không phải Route Handler. Đã bỏ; `ImageResponse` tự đặt
content-type rồi.

## Triển khai

**Đọc [DEPLOY-AI-STUDIO.md](DEPLOY-AI-STUDIO.md) trước.** Tóm tắt: chỉ cần Publish trên
Google AI Studio — nó tự dựng Cloud Run, và đó chính là link Cloud Run mà thể lệ yêu cầu.
Catch chỉ cần một biến `GEMINI_API_KEY`, mà AI Studio tự đặt sẵn.

Phần dưới đây là **đường lui**, dùng khi tự chủ hoàn toàn. Đừng dùng cả hai đường lên
cùng một dịch vụ.

## `npm run build` dựng bằng webpack, KHÔNG phải Turbopack

Đây là chỗ dễ bị ai đó "dọn dẹp" nhất, nên ghi rõ lý do.

Turbopack ở chế độ `output: 'standalone'` **cắt mã thành chunk rồi quên xuất một
mảnh ra đĩa**. Trình duyệt xin một tệp không tồn tại và ăn `ChunkLoadError` ngay
lần vẽ đầu. Lỗi này bị `catch` nuốt nên trang vẫn hiện — nó chỉ nằm trong console,
đúng chỗ ban giám khảo mở ra xem.

Tệ nhất là nó phụ thuộc vào **kích thước module**, không phải vào việc mã đúng hay
sai. Đo được ngày 28/08/2026: cùng một commit dựng sạch hai lần liên tiếp đều
không lỗi; thêm mười tám dòng chú thích vào `lib/firebase.client.ts` là hỏng ba
lần liên tiếp. Nghĩa là bất kỳ thay đổi nào sau này cũng có thể làm nó tái phát,
và `npm run build` vẫn báo thành công.

Bản dựng webpack không có lỗi đó — cùng mã nguồn, cùng phép thử, sạch. Chậm hơn
khoảng hai giây, đổi lấy một bản dựng nói thật.

`npm run build:turbo` giữ lại đường cũ để thử lại khi Next vá xong.

**Kèm theo:** webpack kiểm kiểu chặt hơn Turbopack, và nó bắt được một lỗi có sẵn
— hai tệp `app/icon-*/route.tsx` export `contentType`, thứ chỉ hợp lệ cho tệp
metadata icon chứ không phải Route Handler. Đã bỏ; `ImageResponse` tự đặt
content-type rồi.

## Triển khai Cloud Run bằng tay

```bash
gcloud run deploy catch \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=xxx \
  --timeout 180 \
  --memory 1Gi
```

`--timeout 180` không phải cho vui: một lượt chấm mất 5–37 giây tuỳ độ dài video, và
`lib/gemini.server.ts` tự đặt trần chịu đựng 110 giây kèm thử lại. Để timeout mặc định
60 giây thì video dài sẽ bị cắt giữa chừng.

## Google Calendar — đã dựng xong, đang TẮT

**Trạng thái hôm nay: nút không có trên giao diện.** `components/CalendarReminder.tsx`
vẫn còn nguyên và vẫn được phủ bởi bảy phép thử, nhưng không được gắn vào bảng ưu tiên.

Lý do nằm ở mục *"Google hasn't verified this app"* bên dưới: quyền lịch là quyền nhạy
cảm, chưa duyệt xét thì mọi người bấm vào đều đâm vào một màn hình cảnh báo bảo mật.
Với sản phẩm này, cái giá đó lớn hơn tiện ích.

Phần dưới đây là **việc phải làm khi bật lại** — sau khi Google duyệt xét xong.

Nút *Nhắc vào Google Calendar* gọi thẳng Calendar API bằng thẻ truy
cập lấy từ lần đăng nhập Google của thầy. Ba thứ phải bật sẵn, và cả ba đều **im
lặng cho tới lúc có người bấm nút**:

1. **Bật Google Calendar API** trong dự án `catch-64526` (số hiệu 676963947701):
   Google Cloud Console → APIs & Services → Library → *Google Calendar API* → Enable.
   Chưa bật thì Catch trả về đúng câu *"Google Calendar API chưa được bật"* — đã có
   phép thử canh câu đó, nên nếu thấy nó thì đây là chỗ cần sửa.

2. **Khai quyền trong màn hình đồng ý OAuth**: APIs & Services → OAuth consent screen
   → Data access → thêm `https://www.googleapis.com/auth/calendar.events`.

3. **Thêm người dùng thử**: cùng màn hình, mục *Audience* → Test users → thêm tài
   khoản Google sẽ dùng để demo. Ở trạng thái *Testing* chỉ những tài khoản trong
   danh sách này mới bấm qua được.

### Cảnh báo "Google hasn't verified this app" — biết trước để khỏi hoảng

`calendar.events` là **quyền nhạy cảm**. Muốn hết cảnh báo thì phải qua duyệt xét của
Google, mất vài tuần. Trong thời gian đó, người bấm nút sẽ thấy màn hình cảnh báo và
phải bấm *Advanced → Go to Catch (unsafe)*.

Đây là chuyện đã biết trước khi làm, không phải lỗi cấu hình. Nếu quay video demo có
cảnh này thì **nói thẳng ra một câu** — giấu đi rồi để giám khảo tự bắt gặp thì tệ hơn
nhiều. Đăng nhập thường và toàn bộ phần chấm KHÔNG dính cảnh báo này; chỉ riêng nút
nhắc lịch.

## Hạn mức Gemini — rủi ro thật cho ngày demo

Đo ngày 26/08: chạy bộ đối chứng bảy video ba lượt mỗi cái là **cạn hạn mức bậc miễn phí**
giữa chừng, và mọi lượt sau trả `HET_QUOTA`.

Bậc miễn phí giới hạn 8 giờ video YouTube mỗi ngày cộng với trần số yêu cầu. Một buổi
thử nghiệm dày đặc là đủ để chạm trần — nghĩa là **nếu ngày demo mà sáng hôm đó chạy thử
nhiều thì tới lúc trình bày có thể hết hạn mức.**

Ba việc phải làm trước ngày demo:

1. **Bật thanh toán cho khoá Gemini**, hoặc chuẩn bị sẵn một khoá thứ hai chưa dùng tới.
2. Đừng chạy `npm run eval` trong ngày demo. Chạy hôm trước.
3. Nhớ rằng chấm hai lượt tốn **gấp đôi** token. Nút tắt nằm ngay trong giao diện.

`npm run eval` đã tách `HET_QUOTA` ra khỏi cột "chấm sai" — hết tiền không phải hết đúng,
gộp hai thứ vào một chỗ là tự lừa mình.

## Bảng xử lý sự cố

| Triệu chứng | Nguyên nhân |
|---|---|
| `Failed to write app endpoint /page` dù trang rỗng | node_modules thiếu gói — cài lại với `--ignore-scripts` |
| `THIEU_KHOA_API` trên bản standalone | chưa truyền `GEMINI_API_KEY` vào tiến trình |
| `HET_QUOTA` | hết hạn mức Gemini — xem mục ngay trên |
| `QUA_TAI` | một lượt gọi chạm trần 60 giây và bị cắt. Model đang quá tải; thử lại |
| `XU_LY_VIDEO_HONG` | Files API không xử lý được tệp — xuất lại sang MP4 |
| Lỗi trả về nhưng không có mốc thời gian | máy chủ đã bỏ chúng đúng thiết kế; xem `meta.dropped` |
| Chấm xong mà video còn trên Files API | lệnh xoá bị đặt nhầm vào `try` thay vì `finally` |
