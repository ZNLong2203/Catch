'use client';

import { useCallback, useEffect, useState } from 'react';
import { SkillPicker } from './SkillPicker';
import { SourceInput, type PickedSource } from './SourceInput';
import { Review } from './Review';
import { SessionBar } from './SessionBar';
import { useSession } from './useSession';
import { newId } from '@/lib/session';
import type { Analysis, Skill } from '@/lib/types';

const LOI_TIENG_VIET: Record<string, string> = {
  THIEU_KHOA_API: 'Máy chủ chưa có khoá Gemini. Đặt GEMINI_API_KEY rồi chạy lại.',
  KHOA_HONG: 'Khoá Gemini không dùng được. Kiểm tra lại khoá trên Google AI Studio.',
  HET_QUOTA: 'Đã hết hạn mức Gemini cho lúc này. Chờ một lát rồi thử lại.',
  VIDEO_QUA_DAI: 'Video dài quá. Catch chỉ nhận tối đa 90 giây — mười lăm giây là đủ.',
  VIDEO_QUA_NANG: 'Tệp video nặng quá. Quay lại ở độ phân giải thấp hơn.',
  LINK_KHONG_HOP_LE: 'Đường dẫn YouTube không hợp lệ.',
  KHONG_PHAI_VIDEO: 'Tệp này không phải video.',
  XU_LY_VIDEO_HONG: 'Google không xử lý được tệp video này. Thử xuất lại sang MP4.',
  BI_CHAN_AN_TOAN: 'Yêu cầu bị bộ lọc an toàn của Gemini chặn.',
  QUA_TAI: 'Gemini đang quá tải nên chấm không kịp. Chờ một lát rồi thử lại — video của thầy vẫn còn đây.',
  THIEU_NOI_DUNG: 'Chưa chọn nội dung cần chấm.',
  LOI_CHAM: 'Chấm không xong. Thử lại sau một lát.',
};

type Phase = 'setup' | 'working' | 'done';

export function Workspace() {
  const { session, ready, update, addEntry } = useSession();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [source, setSource] = useState<PickedSource | null>(null);
  const [phase, setPhase] = useState<Phase>('setup');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* Mặc định BẬT — xem chú thích ở SourceInput. Người vội thì tắt được. */
  const [thorough, setThorough] = useState(true);

  /* Thầy chấm cả lớp cùng một kiểu bơi, nên nhớ lựa chọn của em trước —
     bắt chọn lại ba mươi lần là kiểu phiền không đáng có. */
  useEffect(() => {
    const last = session.entries.at(-1)?.skill;
    if (last && skill === null) setSkill(last);
  }, [session.entries, skill]);

  useEffect(() => () => { if (source?.kind === 'upload') URL.revokeObjectURL(source.objectUrl); }, [source]);

  const run = useCallback(async (s: Skill, src: PickedSource, deep: boolean) => {
    setPhase('working');
    setError(null);
    const body = new FormData();
    body.set('skill', s);
    if (deep) body.set('thorough', '1');
    if (src.kind === 'youtube') body.set('url', src.url);
    else { body.set('video', src.file); body.set('duration', String(Math.round(src.duration))); }

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) {
        setError(LOI_TIENG_VIET[data?.error] ?? 'Chấm không xong. Thử lại sau một lát.');
        setPhase('setup');
        return;
      }
      setAnalysis(data as Analysis);
      setPhase('done');
    } catch {
      setError('Không gọi được máy chủ. Kiểm tra kết nối rồi thử lại.');
      setPhase('setup');
    }
  }, []);

  const clearSource = useCallback(() => {
    setSource((cur) => { if (cur?.kind === 'upload') URL.revokeObjectURL(cur.objectUrl); return null; });
  }, []);

  function pick(src: PickedSource) {
    setSource(src);
    if (skill) void run(skill, src, thorough);
  }

  function next() {
    clearSource();
    setAnalysis(null);
    setError(null);
    setPhase('setup');
  }

  function save(label: string, dismissed: string[]) {
    if (!analysis) return;
    addEntry({
      id: newId(),
      label,
      skill: analysis.skill,
      faults: analysis.faults,
      dismissed,
      refused: analysis.refused,
      createdAt: Date.now(),
    });
    next();
  }

  const reviewing = phase === 'done' && analysis && source;

  return (
    // Lúc soi thì cần cả bề ngang cho khung hình và cột lỗi; lúc chuẩn bị thì
    // một cột hẹp đọc dễ hơn nhiều.
    <div className={`mx-auto transition-[max-width] duration-300 ${reviewing ? 'max-w-6xl' : 'max-w-2xl'}`}>
      <SessionBar session={session} ready={ready} onChange={(patch) => update((s) => ({ ...s, ...patch }))} />

      <div className="mt-8">
        {reviewing ? (
          <Review
            analysis={analysis}
            source={source}
            onReset={next}
            onSave={save}
            suggestedLabel={`Em ${session.entries.length + 1}`}
          />
        ) : (
          <>
            <ol className="space-y-7">
              <li>
                <div className="mb-3 flex items-baseline gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full border border-line bg-deep font-mono text-xs text-mist">1</span>
                  <h2 className="text-[15px] font-semibold tracking-tight">Nội dung trong video</h2>
                </div>
                <SkillPicker value={skill} onChange={(s) => { setSkill(s); if (source) void run(s, source, thorough); }} />
              </li>

              <li className={skill ? '' : 'pointer-events-none opacity-40'} aria-disabled={!skill}>
                <div className="mb-3 flex items-baseline gap-2.5">
                  <span className="grid size-6 place-items-center rounded-full border border-line bg-deep font-mono text-xs text-mist">2</span>
                  <h2 className="text-[15px] font-semibold tracking-tight">Video</h2>
                </div>
                <SourceInput
                  skill={skill}
                  onPick={pick}
                  disabled={!skill || phase === 'working'}
                  thorough={thorough}
                  onThorough={setThorough}
                />
              </li>
            </ol>

            {phase === 'working' && (
              <div className="mt-7 flex items-center justify-center gap-3.5 rounded-2xl border border-aqua/25 bg-aqua/[0.05] px-5 py-6">
                <span aria-hidden className="size-2.5 animate-breathe rounded-full bg-aqua" />
                <p className="text-sm text-mist" role="status">
                  Gemini đang xem video…{' '}
                  {thorough ? 'hai lượt, thường mất dưới hai mươi giây.' : 'thường mất dưới mười giây.'}
                </p>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-7 rounded-2xl border border-danger/30 bg-danger/[0.07] px-4 py-3.5 text-sm leading-relaxed text-danger">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
