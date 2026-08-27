# Deploy — AI Studio là đủ, không cần dựng Cloud Run riêng

**Câu trả lời ngắn: chỉ cần Publish trên Google AI Studio. Nó tự dựng Cloud Run cho bạn,
và đó chính là link Cloud Run mà thể lệ cuộc thi yêu cầu.**

Đừng chạy thêm `gcloud run deploy`. Làm thế không thừa mà là **có hại** — xem cuối tệp.

## Vì sao chắc chắn như vậy

Không phải suy đoán từ tài liệu. Verso — dự án trước, cùng tài khoản này — đã đo:

```bash
for u in https://verso-zkare.ai.studio \
         https://verso-262579043496.asia-southeast1.run.app; do
  curl -sL "$u" | md5
done
```

Hai đường dẫn băm ra **giống hệt nhau**. Chúng là **một máy chủ**. AI Studio dựng ra (hoặc
tiếp quản) một dịch vụ Cloud Run trong project của bạn, gắn dấu quản lý của nó
(`generativelanguage.googleapis.com/nonce`), rồi đặt tên miền `.ai.studio` làm cửa trước.

Thể lệ AI Riser 2026 yêu cầu *"dùng Google AI Studio để dựng và triển khai lên Cloud Run
hoặc Google Play Store"*. Một lần Publish là đủ cả hai vế.

## Catch dễ deploy hơn Verso rất nhiều

Verso đọc chín biến môi trường và cần quyền Firestore, Cloud Storage, Cloud TTS. Thiếu một
cái là hỏng một mảng, và có cái hỏng trong im lặng mà vẫn đốt tiền.

**Catch đọc đúng một biến: `GEMINI_API_KEY`** (chấp nhận cả tên `API_KEY`).

Và AI Studio **tự đặt sẵn biến đó**. Nghĩa là Catch deploy được mà không cần cấu hình gì
thêm — không Secrets, không service account, không cấp quyền IAM.

Phần Firebase thì phải làm tay, và AI Studio không làm hộ được:

1. Tạo dự án Firebase, bật **Authentication** (Anonymous + Google) và **Firestore**.
2. Chép sáu biến `NEXT_PUBLIC_FIREBASE_*` vào build — xem `.env.local.example`.
3. `firebase deploy --only firestore:rules`. **Không làm bước này là dữ liệu chạy dưới luật
   mặc định của Firebase**, hoặc khoá sạch hoặc mở toang tuỳ lúc tạo dự án. Cả hai đều sai.
4. Thêm tên miền đang chạy vào *Authentication → Settings → Authorized domains*, nếu không
   thì nút đăng nhập Google mở ra rồi báo `auth/unauthorized-domain`.

Bỏ trống cụm biến Firebase thì Catch vẫn dựng và chạy được, chỉ là không đồng bộ.

## Ba bước

Cần đăng nhập tài khoản Google của bạn rồi cấp quyền GitHub, **không ai làm hộ được**.

1. Đẩy mã lên GitHub trước — hiện dự án **chưa có kho git nào**:
   ```bash
   git init && git add -A && git commit -m "Catch"
   git remote add origin git@github.com:<tài-khoản>/catch.git
   git push -u origin main
   ```
   Kiểm trước khi đẩy: `.env.local`, `private/`, `tu-lieu/` đều đã nằm trong `.gitignore`.

2. [aistudio.google.com](https://aistudio.google.com) → **Build** → dấu **+** →
   **Import from GitHub** → cấp quyền → chọn kho vừa đẩy.

3. **Publish** → điền **Custom URL** → **Publish App**.

Tên miền phụ **duy nhất toàn cầu, ai đăng ký trước được trước**. `catch` là từ phổ thông,
nhiều khả năng đã có người lấy — chuẩn bị sẵn phương án: `catch-boi`, `catchswim`,
`catch-vn`, `bat-loi-boi`.

## Ngay sau lần Publish đầu tiên

Sửa hằng `SITE` trong [`app/layout.tsx`](../app/layout.tsx) thành địa chỉ vừa nhận, rồi
đẩy lại. Trang chủ dựng sẵn lúc build nên địa chỉ nào có mặt lúc đó bị nướng thẳng vào thẻ
`og:image`; để nguyên giá trị mẫu thì link dán vào Zalo sẽ hiện ảnh trỏ vào hư không.

## Ba điều phải nhớ

**Đừng chạy `gcloud run deploy --source` lên dịch vụ đó.** Nó đá nhau với đường build của
AI Studio. Verso đã dính, lệnh báo *"Source annotation has sources that are not referenced
by a container"*.

**Xoá dịch vụ Cloud Run là xoá luôn link AI Studio.** Không có bản nào "thừa" để dọn.

**Đường đưa thay đổi lên từ nay:** sửa mã → đẩy GitHub → AI Studio kéo về → Publish.

## Còn `Dockerfile` trong kho để làm gì

Làm đường lui. Nếu AI Studio hỏng, hoặc muốn tự chủ hoàn toàn, vẫn deploy tay được:

```bash
gcloud run deploy catch --source . --region asia-southeast1 \
  --allow-unauthenticated --set-env-vars GEMINI_API_KEY=xxx \
  --timeout 180 --memory 1Gi
```

`--timeout 180` không phải cho vui: đường tải tệp lên mất khoảng 10 giây, nhưng lúc model
quá tải thì một lượt có thể chạm trần 60 giây của chính Catch, và chấm hai lượt thì phải
cộng thêm. Để mặc định 60 giây là bị cắt giữa chừng.

**Nhưng chỉ chọn MỘT trong hai đường.** Đừng deploy tay lên chính dịch vụ mà AI Studio
đang quản.

## Trước ngày demo

Xem mục *Hạn mức Gemini* trong [DEPLOYMENT.md](DEPLOYMENT.md). Ngày 26/08 đã cạn hạn mức
bậc miễn phí một lần chỉ vì chạy thử nhiều.
