# Cách Catch dùng Gemini

> Trạng thái: phép thử đầu tiên đã chạy **26/08/2026** trên 7 video công khai với
> `gemini-3.5-flash`. Số đo ở cuối tệp là số thật. Ô nào ghi *chưa đo* thì để
> nguyên như thế cho tới khi đo được — không điền số đoán.

## Vì sao phải là mô hình đa phương thức

Cách làm thông thường cho bài toán này là dò khớp xương (pose estimation) rồi tính
góc khớp bằng công thức. Cách đó hỏng ở dưới nước: nửa thân người chìm, mặt nước
loá và gợn, bọt khí che chân, và bộ dò khớp xương được huấn luyện trên người đứng
trên cạn.

Cái mà mô hình đa phương thức làm được còn bộ dò khớp xương thì không:

- Đọc **bọt khí quanh mặt** để biết em có thở ra dưới nước hay đang nín thở
- Nhận ra **khoảng lặng giữa hai chu kỳ tay** — tức là có pha lướt hay không
- Thấy **vệt nước hai bên chân khác nhau** khi em đạp lệch

Cả ba đều là lỗi nhóm Đỏ trong `SKILLS-AND-FAULTS.md`, tức là ba thứ quan trọng nhất,
và cả ba đều nằm ngoài tầm của cách làm hình học.

## Chọn model — đo, đừng đoán

Đo ngày 26/08 trên chính video bơi (`private/probe/bench.mjs`). Hai phép đo, và phép thứ
hai mới là phép quyết định.

**(a) Ca khó — đạp chân lệch, video 23k token**

| Model | Thời gian | Bắt được lỗi |
|---|---|---|
| `gemini-3.5-flash-lite` | 7,9 s | ✓ |
| `gemini-3.6-flash` | 39,7 s | ✓ |
| `gemini-3.1-flash-lite` | 14,9 s | ✓ |

**(b) Đối chứng âm — vô địch thế giới bơi đúng kỹ thuật, KHÔNG được báo lỗi nào**

| Model | Kết quả | Thời gian |
|---|---|---|
| `gemini-3.5-flash-lite` | **sạch 4/4 lượt** | 2,0–6,0 s |
| `gemini-3.6-flash` | sạch 3/4 — một lượt bịa `BR_KNEES_FORWARD@00:06` | 5,5–12,5 s |
| `gemini-3.1-flash-lite` | bịa `BR_KNEES_FORWARD@00:03` | 10,4 s |
| `gemini-3.5-flash` | một lượt bịa, một lượt 504, một lượt 429 | 64–89 s |
| `gemini-3.7-flash` | 504 "Deadline expired" liên tục | — |
| `gemini-2.5-flash` | 404 — Google đã gỡ khỏi tài khoản mới | — |

Chọn `gemini-3.5-flash-lite` làm chính, `gemini-3.6-flash` làm dự phòng.

Lý do không chọn model "mạnh hơn": với sản phẩm mà thầy sẽ **tin rồi đi sửa cho học
sinh**, *không bịa* quan trọng hơn *bắt được nhiều*. Cả ba model đều bắt được ca khó;
chỉ một model không lượt nào bịa trên video bơi đúng.

## Chấm hai lượt, và vì sao nó không phải trò làm màu

Phép đo trên phơi ra một điều quan trọng hơn cả bảng xếp hạng: **lỗi bịa không cố định**.
Cùng model, cùng video, cùng prompt — lượt có lượt không. `gemini-3.6-flash` bịa ở 1 trong
4 lượt; `gemini-3.5-flash` bịa ở 1 trong 3.

Một lỗi thật thì lượt nào cũng thấy. Một lỗi bịa thì hên xui. Nên:

```
lượt 1 ─┐
        ├─▶ giao nhau theo mã lỗi ─▶ chỉ giữ phần chung
lượt 2 ─┘
```

`intersectPasses()` trong `lib/normalize.ts`. Hai lượt chạy **song song** (chúng độc lập,
nối tiếp chỉ tổ bắt thầy chờ gấp đôi). Độ tin cậy lấy mức **thấp hơn** của hai lượt chứ
không lấy trung bình — hai lượt bất đồng thì phải nghiêng về phía dè dặt. Mốc thời gian
lấy theo lượt chắc hơn.

Mặc định **bật**, vì với `3.5-flash-lite` một lượt chỉ mất 2–8 giây nên hai lượt vẫn dưới
hai chục giây. Thầy vội thì tắt được.

Giao diện hiện rõ số lỗi bị loại vì chỉ một lượt thấy — bỏ trong im lặng là nói dối.

### Đo xem nó có thật sự lọc được gì không

Đây là phép đo quan trọng nhất, và kết quả **không hoàn toàn có lợi cho Catch**.

**Video dài, nhiều người, nhiều đoạn minh hoạ** (`tV_VLp3QWiY`, thả nổi ngửa, 25k token):

| Chế độ | Bốn/năm lượt đo liên tiếp trên CÙNG một video |
|---|---|
| Một lượt | 3 lỗi · 3 lỗi (khác nhau) · 1 lỗi · 0 lỗi |
| Hai lượt | 0 · 0 · 0 · 0 · 3 lỗi — mỗi lần loại 2–3 lỗi vì chỉ một lượt thấy |

Chấm một lượt trên video này gần như là **nhiễu**. Cổng hai lượt lọc đúng thứ nó sinh ra
để lọc, nhưng trên video này nó lọc gần hết — nghĩa là ở đây model thật sự không nhìn ra
gì đáng tin, và Catch nói ra điều đó thay vì bịa cho có.

**Video ngắn, một người bơi rõ ràng** — đúng thứ giáo viên sẽ quay:

| Video | Nội dung | Ba lượt đo liên tiếp, chế độ mặc định |
|---|---|---|
| `3xR3Xkvm7UU` | bơi ếch | `BR_HEAD_HIGH` · `BR_HEAD_HIGH` · `BR_HEAD_HIGH` |
| `NA-aRhs8ZFs` | bơi ếch, vô địch thế giới | 0 · 0 · 0 |
| `1MFWaiZoIEk` | trườn sấp | `FR_HEAD_LIFT_BREATH` ×3 |
| `4xPs563JZcU` | đứng nước, làm đúng | 0 · 0 · 0 |
| `jpDbg9hxsO8` | thả nổi ngửa, làm đúng | 0 · 0 · 0 |
| `HVZ2VYaIBQM` | bơi ngửa | `BK_HIPS_SINK` ×3 |

**Năm trên sáu video cho kết quả giống hệt nhau ba lượt liền.** Cái không ổn định là cái
dài và nhiều người — nghĩa là giới hạn nằm ở loại video, không nằm ở sản phẩm, và loại
video ổn định lại đúng là loại giáo viên sẽ quay: mười lăm giây, một em.

Đây là lý do có trần 90 giây cho video tải lên, và là lý do bảng ưu tiên chỉ nhận
từng em một chứ không nhận một video quay lướt cả lớp.

### Cái giá của chấm hai lượt

| | Một lượt | Hai lượt |
|---|---|---|
| Thời gian | 2,5 s | **2,9 s** |
| Token vào | 2.680 | 5.360 |

Hai lượt chạy song song nên gần như không tốn thêm thời gian chờ — chỉ token là gấp đôi.
Đó là lý do bật mặc định được.

## Trần cứng cho mỗi lượt gọi

Đo ngày 26/08: lúc model chính quá tải, một lượt lùi về model dự phòng chạy **317 giây**
rồi mới trả kết quả. Trần `deadline` ban đầu **không chặn được** chuyện đó — nó chỉ được
kiểm giữa các lần thử lại, còn một lượt gọi đang treo thì chạy tới khi nào xong thì thôi.

Cloud Run cắt request ở 180 giây, nên không có trần thì thầy chờ ba phút để nhận về một
trang lỗi trắng. Giờ mỗi lượt mang theo `AbortSignal.timeout()` và `httpOptions.timeout`
với ngân sách 60 giây; hết giờ là cắt, trả `QUA_TAI` kèm câu tiếng Việt bảo thử lại.

## Prompt

Một prompt cho mỗi kiểu bơi, không dùng chung. Bơi ếch và bơi trườn sấp sai theo
hai kiểu khác hẳn nhau, và một prompt gộp sẽ kéo model về những nhận xét chung
chung không dùng được.

Mỗi prompt phải nói rõ bốn điều:

1. **Chỉ báo lỗi nhìn thấy được**, kèm mốc thời gian. Không suy diễn về thể lực,
   sức khoẻ, hay khả năng của em.
2. **Không nhìn rõ thì khai là không nhìn rõ**, không đoán. Trả `khongChamDuoc`
   kèm lý do.
3. **Nhiều nhất ba lỗi**, ưu tiên nhóm Đỏ.
4. **Nói với giáo viên**, bằng tiếng Việt thường, không thuật ngữ thi đấu.

## Schema

`responseSchema` chứ không phân tích chuỗi trả về. Điều này Verso đã trả giá để
học, không cần học lại.

```ts
{
  khongChamDuoc: { type: 'string', nullable: true },  // có giá trị = từ chối chấm
  kieuBoi: { type: 'string', enum: ['ech', 'truon_sap'] },
  loi: {
    type: 'array',
    maxItems: 3,
    items: {
      ma:      { type: 'string', enum: [...tất cả mã lỗi] },
      giay:    { type: 'number' },        // bắt buộc
      tinCay:  { type: 'number' },
      moTa:    { type: 'string' },
      baiSua:  { type: 'string' },
    },
  },
}
```

Hai cổng chặn phía máy chủ, sau khi nhận kết quả:

- `khongChamDuoc` khác rỗng → trả thẳng về giao diện, không hiển thị lỗi nào
- Lỗi nào thiếu `giay` hoặc `giay` nằm ngoài thời lượng video → **bỏ**, ghi log

## Xoá tệp

```ts
try {
  file = await upload(video)
  await choActive(file)
  ketQua = await generateContent(file, prompt, schema)
} finally {
  if (file) await xoa(file)   // ← trong finally, không phải trong try
}
```

Xem `SAFETY.md` mục 3 để biết vì sao dòng này quan trọng hơn phần còn lại của tệp.

## Chỗ còn trống — điền sau phép thử

| Câu hỏi | Trả lời |
|---|---|
| Gemini có gọi đúng tên lỗi nhìn thấy bằng mắt không? | **Có — 5/6 video** có lỗi được gọi đúng mã. Video thứ 6 đúng hiện tượng, sai mã (thiếu `BR_KNEES_FORWARD`). |
| Có bịa lỗi không có trong video không? | **Không.** Video vô địch thế giới bơi đúng kỹ thuật → trả mảng rỗng, 12 token đầu ra. |
| Bằng chứng thị giác có cụ thể không? | **Có.** Mô tả được vị trí từng chân, đầu so với mặt nước, khoảng lặng giữa hai chu kỳ tay. |
| Một lần chấm mất bao lâu? | 5,2s (video ~30 giây) → 37,1s (video 10 phút). |
| Tốn bao nhiêu token? | 2.520 (video ngắn) → 102.811 (video 10 phút). Tăng theo độ dài ⇒ **phải chặn độ dài tải lên**. |
| Mốc thời gian lệch bao nhiêu giây? | *chưa đo* — cần người xem lại video và đối chiếu. Đây là ô quan trọng nhất còn trống. |
| Nhánh từ chối chấm có chạy không? | **Có.** Cố tình khai sai kiểu bơi — đưa video bơi ếch nhưng đánh dấu là bơi trườn sấp — model trả `refused` kèm lý do đúng và hướng dẫn quay lại, không cố chấm bừa. Vẫn *chưa thử* video ngược sáng và quay quá xa. |
| Model có bị ảnh hưởng bởi lời thoại và chữ trên màn hình không? | *chưa loại trừ.* Video dạy học đều có narration. Dấu hiệu tốt: video đối chứng cũng có bình luận kỹ thuật mà model vẫn không báo lỗi. Cần một video không lời để kết luận. |
| Đường TẢI TỆP LÊN có chạy không? | **Có.** Đo 26/08 — lần đầu chạy thật: Files API tải lên, chờ `ACTIVE`, chấm, xoá. Mất ~10 giây, chậm hơn đường YouTube (2–3 giây) vì phải chờ Google xử lý tệp. |
| Video có thật sự bị xoá sau khi chấm không? | **Có, đã kiểm.** Sau ba lượt tải lên, gọi `files.list()` trả về **rỗng** — không tệp nào nằm lại. Lệnh xoá trong `finally` chạy đúng. |
| Video dọc và video ngang có khác kết quả không? | **Không.** Thử 720×1280 và 1280×720: cả hai đều được xử lý bình thường và cùng rơi vào nhánh từ chối đúng như mong đợi. |
| Nhánh từ chối có bắt được video không có người bơi không? | **Có.** Ba clip dựng bằng ffmpeg (thanh màu, đồ hoạ trừu tượng, loá trắng) đều bị từ chối kèm lý do đúng: *"chỉ hiển thị thanh màu kiểm tra kỹ thuật, hoàn toàn không có người bơi"*. |
| Sáu nội dung có chạy được hết không? | **Có.** Đo qua chính API ngày 26/08: đứng nước 4 s · thả nổi 7 s · bơi ếch 2 s · trườn sấp 6 s · bơi ngửa 7 s · bơi bướm 5 s. Danh sách video ở `lib/demos.ts`. |
| Nhóm sinh tồn có video người làm SAI để thử không? | **Chưa.** Ba video đứng nước đã thử đều là người làm đúng, nên chỉ chứng minh được Catch không bịa, chưa chứng minh được nó bắt đúng lỗi. Cần quay thật. |

## Một tình huống không nghĩ ra để thử, nhưng model xử đúng

Nhánh từ chối chấm được viết cho video **nhìn không rõ**. Hoá ra nó bắt luôn một ca khác:
**thầy chọn nhầm kiểu bơi**. Đưa video bơi ếch mà đánh dấu là bơi trườn sấp thì model không
có mã lỗi nào hợp lệ để dùng — vì enum đã bị ràng buộc theo kiểu bơi — nên nó khai thẳng là
video không khớp, thay vì nhồi bừa một mã cho có.

Ràng buộc enum theo kiểu bơi sinh ra để chặn chuyện mượn mã. Nó tiện thể chặn luôn chuyện
chọn nhầm. Ghi lại ở đây vì đây là loại kết quả dễ tưởng là may mắn, trong khi thật ra nó là
hệ quả trực tiếp của việc thu hẹp không gian trả lời.

## Hai lỗi phải sửa trong prompt, phát hiện từ phép thử

1. **Ràng buộc enum theo kiểu bơi.** Gửi video bơi ếch thì schema chỉ chứa mã `EC_`.
   Đưa cả mười một mã vào thì model mượn mã của kiểu bơi khác.
2. **Ép tiếng Việt có dấu.** Một trong bảy lượt trả về tiếng Việt không dấu
   (*"Chan phai be co chan huong ra ngoai"*). Nêu rõ trong prompt.
