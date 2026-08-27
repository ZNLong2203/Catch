'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BY_CODE, SEVERITY_META, SKILL_META } from '@/lib/faults';
import { CLASS_WIDE, commonFaults, liveFaults, rankEntries, worstSeverity } from '@/lib/session';
import { classProgress, compareWithPrevious } from '@/lib/progress';
import { useSession } from '@/components/useSession';
import { mmss, formatDate } from '@/lib/time';

/** Giáo án buổi sau — bản in.
 *
 *  Cố ý là nền trắng chữ đen, không theo bảng màu tối của phần còn lại: thứ này
 *  ra giấy, cầm ra bờ hồ, và không ai in một trang nền đen. */
export default function PrintPage() {
  const { session, archive, ready } = useSession();
  const ranked = rankEntries(session.entries);
  const classWide = commonFaults(session.entries).filter((c) => c.share >= CLASS_WIDE && c.students.length >= 2);
  const progress = classProgress(session, archive).filter((c) => c.then !== c.now);

  useEffect(() => {
    if (ready && session.entries.length > 0) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [ready, session.entries.length]);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-[46rem] px-8 py-10 print:px-0 print:py-0">
        <nav className="mb-8 flex gap-4 print:hidden">
          <Link href="/session" className="text-sm text-slate-500 underline underline-offset-4">← Về bảng ưu tiên</Link>
          <button onClick={() => window.print()} className="text-sm text-slate-500 underline underline-offset-4">In lại</button>
        </nav>

        <header className="border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold">Giáo án buổi sau</h1>
          <p className="mt-1 text-sm text-slate-700">
            {session.className ? `Lớp ${session.className}` : 'Lớp ______'}{ready && ` · buổi ngày ${formatDate(session.date)}`}
            {session.entries[0] && ` · ${SKILL_META[session.entries[0].skill].label}`}
            {' · '}{session.entries.length} em
          </p>
        </header>

        {!ready ? (
          <p className="mt-8 text-sm text-slate-500">Đang mở buổi học…</p>
        ) : session.entries.length === 0 ? (
          <p className="mt-8 text-sm text-slate-500">Buổi học chưa có em nào được chấm.</p>
        ) : (
          <>
            {progress.length > 0 && (
              <section className="mt-8 break-inside-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide">So với buổi {progress[0].previousDate}</h2>
                <ul className="mt-2 space-y-1">
                  {progress.map((c) => (
                    <li key={c.code} className="text-sm">
                      {c.now < c.then ? '↓' : '↑'} {c.label}:{' '}
                      <span className="text-slate-600">{c.then} em → {c.now} em / {c.total}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {classWide.length > 0 && (
              <section className="mt-8 break-inside-avoid">
                <h2 className="text-base font-bold uppercase tracking-wide">Phần dạy chung cả lớp</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Những lỗi từ một phần ba lớp trở lên cùng mắc. Sửa một lần cho cả lớp.
                </p>
                <ol className="mt-3 space-y-3">
                  {classWide.map((c) => (
                    <li key={c.code} className="break-inside-avoid border-l-4 border-black pl-3">
                      <p className="font-semibold">
                        {c.spec.label}
                        <span className="ml-2 font-normal text-slate-600">
                          {c.students.length}/{session.entries.length} em
                        </span>
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed">{c.spec.drill}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{c.students.join(' · ')}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-base font-bold uppercase tracking-wide">Sửa riêng, theo thứ tự</h2>
              <p className="mt-1 text-sm text-slate-600">
                Xếp theo rủi ro đuối nước. {SEVERITY_META.red.why}
              </p>
              <ol className="mt-3 space-y-4">
                {ranked.map((e, i) => {
                  const faults = liveFaults(e);
                  const worst = worstSeverity(e);
                  return (
                    <li key={e.id} className="break-inside-avoid">
                      <p className="font-semibold">
                        {i + 1}. {e.label}
                        {worst && <span className="ml-2 font-normal text-slate-600">{SEVERITY_META[worst].label}</span>}
                      </p>
                      {e.refused ? (
                        <p className="mt-0.5 pl-5 text-sm text-slate-600">Không chấm được — {e.refused}</p>
                      ) : faults.length === 0 ? (
                        <p className="mt-0.5 pl-5 text-sm text-slate-600">Không thấy lỗi nào trong bảng.</p>
                      ) : (
                        <ul className="mt-1 space-y-1.5 pl-5">
                          {faults.map((f) => (
                            <li key={`${f.code}-${f.at}`} className="text-sm leading-relaxed">
                              <span className="font-medium">{BY_CODE.get(f.code)!.label}</span>
                              <span className="text-slate-500"> (mốc {mmss(f.at)})</span>
                              <br />
                              <span className="text-slate-700">{BY_CODE.get(f.code)!.drill}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {(() => {
                        const p = compareWithPrevious(e, archive);
                        if (!p || (p.fixed.length === 0 && p.appeared.length === 0)) return null;
                        return (
                          <p className="mt-1 pl-5 text-xs text-slate-600">
                            So với buổi {p.previousDate}:
                            {p.fixed.length > 0 && ` hết ${p.fixed.map((c) => BY_CODE.get(c)!.label).join(', ')}.`}
                            {p.appeared.length > 0 && ` mới ${p.appeared.map((c) => BY_CODE.get(c)!.label).join(', ')}.`}
                          </p>
                        );
                      })()}
                      <p className="mt-2 pl-5 text-xs text-slate-400">Thầy ghi thêm: ________________________________</p>
                    </li>
                  );
                })}
              </ol>
            </section>
          </>
        )}

        <footer className="mt-10 border-t border-slate-300 pt-4 text-xs leading-relaxed text-slate-600">
          <p>
            <strong>Đây là nhận xét kỹ thuật cho một lần bơi trong hồ có người lớn đứng cạnh.</strong>{' '}
            Không phải giấy chứng nhận an toàn dưới nước, và không thay thế việc trông trẻ.
          </p>
          <p className="mt-1.5">Catch · #BuildwithGoogleAI · AI Riser Vietnam 2026</p>
        </footer>
      </div>
    </div>
  );
}
