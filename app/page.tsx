import { Workspace } from '@/components/Workspace';
import { hasKey } from '@/lib/gemini.server';

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
      <section className="mx-auto max-w-3xl pb-12 pt-12 text-center sm:pt-20">
        <p className="mb-8 inline-block rounded-full border border-line bg-deep/60 px-3 py-1.5 text-[11px] text-mist">
          #BuildwithGoogleAI · AI Riser Vietnam 2026
        </p>
        <p className="eyebrow">Mỗi năm gần 2.000 trẻ em Việt Nam chết đuối</p>
        <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.15] tracking-tight sm:text-[2.75rem]">
          Một thầy, ba mươi em, bốn mươi lăm phút.
          <span className="block text-mist">Thầy không thiếu kiến thức — thầy thiếu số con mắt.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-mist">
          Quay mười lăm giây một em đang bơi. Catch chỉ ra lỗi kèm mốc thời gian bấm vào xem lại được,
          và xếp thứ tự theo <strong className="font-semibold text-foam">rủi ro đuối nước</strong> —
          không theo mức xấu của động tác.
        </p>
      </section>

      <main id="lam-viec" className="scroll-mt-8">
        {!hasKey() && (
          <p className="mx-auto mb-8 max-w-2xl rounded-2xl border border-warn/30 bg-warn/[0.07] px-4 py-3.5 text-sm text-warn">
            Máy chủ chưa có khoá Gemini. Đặt <code className="font-mono">GEMINI_API_KEY</code> trong <code className="font-mono">.env.local</code> rồi khởi động lại.
          </p>
        )}
        <Workspace />
      </main>

      <footer className="mx-auto mt-24 max-w-3xl border-t border-line pt-8">
        {/* Dòng này không tắt được, và không có nút nào xuất ra giấy chứng nhận.
            Biết bơi và an toàn dưới nước là hai chuyện khác nhau — xem docs/SAFETY.md. */}
        <p className="text-[13px] leading-relaxed text-mist">
          <strong className="font-semibold text-foam">Đây là nhận xét kỹ thuật cho một lần bơi trong hồ có người lớn đứng cạnh.</strong>{' '}
          Nó không phải giấy chứng nhận an toàn dưới nước, và không thay thế việc trông trẻ.
          Catch không chấm điểm học sinh và không kết luận em nào đã biết bơi.
        </p>
        <p className="mt-4 text-[13px] leading-relaxed text-dim">
          Video tải lên đi thẳng lên Gemini và bị xoá ngay sau khi chấm xong. Không lưu trữ,
          không thư viện, không ảnh trích ra. Thứ duy nhất giữ lại là nhận xét dạng chữ.
        </p>
      </footer>
    </div>
  );
}
