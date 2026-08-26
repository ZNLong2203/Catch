import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-xl font-semibold tracking-tight">Không có trang này</h1>
      <p className="mt-3 text-sm leading-relaxed text-mist">Có lẽ đường dẫn bị gõ nhầm.</p>
      <Link href="/" className="mt-6 self-start rounded-xl bg-aqua px-4 py-2.5 text-sm font-semibold text-abyss transition hover:brightness-110">
        Về chỗ chấm
      </Link>
    </div>
  );
}
