# Kiến trúc

> Trạng thái: **đã dựng và chạy được**. Phép thử sống chết đã qua ngày 26/08 —
> xem `private/KILL-TEST.md` và bảng số đo cuối `AI-INTEGRATION.md`.

## Ngăn cách client / máy chủ

Giống Verso, và vì đúng lý do đó: **khoá Gemini không bao giờ vào trình duyệt.**

- Mọi lệnh gọi Gemini đi qua route handler phía máy chủ.
- `lib/gemini.server.ts` mở đầu bằng `import 'server-only'` — nhập nhầm vào
  component client thì hỏng lúc build, không phải lúc chạy.
- Trên Cloud Run, Firestore dùng danh tính sẵn có của dịch vụ. Không có tệp khoá
  nào tồn tại trên máy chủ.

## Bốn bước

```
   Giáo viên                    Máy chủ                       Gemini
      │                            │                             │
 1 ── chọn kiểu bơi, ─────────────▶│                             │
      tải video 10-20s             │                             │
      │                            ├── upload Files API ────────▶│
      │                            │◀── chờ trạng thái ACTIVE ───┤
      │                            ├── generateContent ─────────▶│
      │                            │   + responseSchema          │
      │                            │◀── danh sách lỗi + mốc ─────┤
      │                            ├── XOÁ tệp (finally) ───────▶│
 2 ──▶│◀─ trả kết quả ─────────────┤                             │
      │                            │                             │
 3 ── xem lại từng mốc,            │                             │
      bỏ lỗi nào thấy sai          │                             │
      │                            │                             │
 4 ── xuất thứ tự ưu tiên ────────▶│── lưu KẾT QUẢ dạng chữ ──▶ Firestore
      cho buổi sau                 │   (không bao giờ lưu video)
```

Bước 3 không phải trang trí. Nó là chỗ giáo viên có quyền phủ quyết, và là lý do
sản phẩm này đáng tin — xem `SAFETY.md`.

## Đơn vị trung tâm: `Fault`

Verso xoay quanh `Khoi`. Catch xoay quanh `Fault`. Mọi thứ trong sản phẩm đều là một
danh sách `Fault` được sắp xếp lại.

```ts
type Fault = {
  ma: MaLoi              // 'BR_NO_GLIDE' | 'FR_KNEE_KICK' | ...
  nhom: 'do' | 'vang' | 'xanh'
  giay: number           // mốc trong video — BẮT BUỘC, không có thì không báo
  giayKetThuc?: number
  tinCay: number         // 0..1
  moTa: string           // câu nói cho giáo viên, tiếng Việt, không thuật ngữ
  baiSua: string         // sửa bằng cách nào ở buổi sau
}
```

`giay` là trường quan trọng nhất. Không có nó thì lỗi bị bỏ, dù model có chắc đến
đâu — vì thầy không kiểm chứng được thì không tin được.

## Cấu trúc

```
docs/                   tài liệu — đọc SKILLS-AND-FAULTS.md trước
app/
  page.tsx              xưởng làm việc của giáo viên
  session/page.tsx      thứ tự ưu tiên cả lớp cho buổi sau
  session/poolside/     chế độ bờ hồ — một em một màn hình, chữ to, bấm một ngón
  session/print/        giáo án buổi sau — nền trắng, cầm ra bờ hồ được
  api/analyze/          nhận video hoặc link, gọi Gemini, xoá tệp, trả Fault[]
  opengraph-image.tsx   ảnh hiện ra khi dán link vào Zalo, Facebook
lib/
  faults.ts             12 lỗi + phân nhóm đỏ/vàng/xanh + bài sửa  ← linh hồn
  prompt.ts             prompt riêng từng kiểu bơi, sinh từ bảng lỗi
  normalize.ts          cổng chặn phía máy chủ — hàm thuần, có kiểm
  gemini.server.ts      Files API, schema, thử lại, XOÁ trong finally
  session.ts            buổi học + kho buổi cũ trong localStorage, xếp ưu tiên
  progress.ts           so một em và cả lớp với buổi trước — hàm thuần, có kiểm
  types.ts              Fault, Analysis, Stroke, Severity
components/
  Workspace.tsx         điều phối: chọn kiểu bơi → video → soi → ghi vào buổi học
  Review.tsx            thanh thời gian có mốc bấm nhảy được  ← quyết định độ tin
  PriorityBoard.tsx     bảng ưu tiên cả lớp + phần dạy chung
  useSession.ts         đọc/ghi buổi học, đồng bộ giữa các tab
test/                   27 phép kiểm, chạy bằng `npm test`
```

## Ba màn hình cho ba khoảnh khắc khác nhau của cùng một thầy

Cùng một dữ liệu, ba cách bày, vì thầy ở ba trạng thái rất khác nhau:

| Màn hình | Thầy đang ở đâu | Bày cái gì |
|---|---|---|
| `/` | ngồi máy, vừa quay xong | khung hình + mốc thời gian + bằng chứng thị giác |
| `/session` | ngồi máy, hết buổi | cả lớp, thứ tự ưu tiên, phần dạy chung, tiến bộ |
| `/session/poolside` | **đứng cạnh hồ, tay ướt, nắng chói** | MỘT em, MỘT việc, chữ to, nút to |

Chế độ bờ hồ cố ý **bỏ gần hết**: không mốc thời gian, không độ tin cậy, không bằng chứng
thị giác, và chỉ hiện lỗi đầu tiên. Những thứ đó thuộc về lúc thầy ngồi soi lại. Đứng cạnh
hồ với ba mươi đứa trẻ đang gọi thì thêm một dòng chữ là thêm một thứ để bỏ sót.

## Vì sao buổi học nằm ở trình duyệt chứ không ở Firestore

Verso dùng Firestore vì bản đọc **phải** đến được máy học sinh — đó là mục đích của nó.
Catch thì ngược lại: không có ai ở đầu kia cần nhận gì. Thầy chấm, thầy đọc, thầy dạy.

Đưa danh sách trẻ em kèm nhận xét lên máy chủ chỉ để thêm một cái tủ hồ sơ mà không ai cần
mở. Xem `SAFETY.md` mục 3b.

## Công nghệ

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Gemini (video) · Firestore · Cloud Run

Bê nguyên nền của Verso. Bốn ngày không phải lúc học stack mới.

| Việc | Công nghệ Google |
|---|---|
| Đọc video bơi, chỉ ra lỗi kèm mốc thời gian | Gemini multimodal + Files API + `responseSchema` |
| Lưu kết quả buổi học, thứ tự ưu tiên lớp | Cloud Firestore |
| Triển khai công khai | Cloud Run (`asia-southeast1`) |

## Ba chỗ đoán trước là sẽ vấp

1. **Files API là bất đồng bộ.** Tải lên xong tệp chưa dùng được ngay, phải chờ
   trạng thái chuyển sang `ACTIVE`. Cần vòng chờ có giới hạn, và Cloud Run có
   thời gian chờ tối đa cho mỗi request — kiểm tra sớm.
2. **Video ngang dọc.** Giáo viên quay bằng điện thoại cầm dọc. Cần thử cả hai
   hướng ngay từ phép thử đầu tiên, đừng để tới lúc demo mới biết.
3. **Xoá tệp phải nằm trong `finally`.** Đặt trong `try` thì hễ Gemini lỗi là
   video trẻ em nằm lại trên máy chủ Google. Đây là lỗi dễ mắc nhất trong cả dự án.
