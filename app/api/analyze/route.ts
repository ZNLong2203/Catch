import { NextResponse } from 'next/server';
import { analyze, hasKey, type Source } from '@/lib/gemini.server';
import { SKILL_ORDER } from '@/lib/faults';
import type { Skill } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 180;

/** Video giáo viên quay chỉ cần 10–20 giây. Chặn dài hơn vì token vào tăng theo
 *  độ dài — đo được 102.811 token cho một video 10 phút (private/KILL-TEST.md).
 *  Một lượt gọi lỡ tay không được nuốt hết hạn mức tháng. */
const MAX_SECONDS = 90;
const MAX_BYTES = 120 * 1024 * 1024;

const YOUTUBE = /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]{6,}/i;

export async function POST(req: Request) {
  if (!hasKey()) return NextResponse.json({ error: 'THIEU_KHOA_API' }, { status: 503 });

  let form: FormData;
  try { form = await req.formData(); }
  catch { return NextResponse.json({ error: 'THAN_HONG' }, { status: 400 }); }

  const skill = String(form.get('skill') ?? '') as Skill;
  if (!SKILL_ORDER.includes(skill)) return NextResponse.json({ error: 'THIEU_NOI_DUNG' }, { status: 400 });

  const thorough = form.get('thorough') === '1';

  let src: Source;
  const url = String(form.get('url') ?? '').trim();

  if (url) {
    if (!YOUTUBE.test(url)) return NextResponse.json({ error: 'LINK_KHONG_HOP_LE' }, { status: 400 });
    src = { kind: 'youtube', url };
  } else {
    const video = form.get('video');
    if (!(video instanceof Blob) || video.size === 0)
      return NextResponse.json({ error: 'THIEU_VIDEO' }, { status: 400 });
    if (video.size > MAX_BYTES)
      return NextResponse.json({ error: 'VIDEO_QUA_NANG' }, { status: 413 });

    const durationSec = Number(form.get('duration')) || undefined;
    if (durationSec && durationSec > MAX_SECONDS)
      return NextResponse.json({ error: 'VIDEO_QUA_DAI', max: MAX_SECONDS }, { status: 413 });

    const mimeType = video.type || 'video/mp4';
    if (!/^video\//.test(mimeType))
      return NextResponse.json({ error: 'KHONG_PHAI_VIDEO' }, { status: 415 });

    src = { kind: 'upload', video, mimeType, durationSec };
  }

  try {
    return NextResponse.json(await analyze(src, skill, { thorough }));
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    console.error('[catch/analyze]', msg.slice(0, 300));
    if (/API_KEY|UNAUTHENTICATED|PERMISSION/i.test(msg))
      return NextResponse.json({ error: 'KHOA_HONG' }, { status: 503 });
    if (/RESOURCE_EXHAUSTED|quota|429/i.test(msg))
      return NextResponse.json({ error: 'HET_QUOTA' }, { status: 429 });
    if (/QUA_HAN|AbortError|The operation was aborted|TimeoutError/i.test(msg))
      return NextResponse.json({ error: 'QUA_TAI' }, { status: 504 });
    if (/FILE_QUA_LAU|FILE_XU_LY_HONG/i.test(msg))
      return NextResponse.json({ error: 'XU_LY_VIDEO_HONG' }, { status: 502 });
    if (/SAFETY|PROHIBITED/i.test(msg))
      return NextResponse.json({ error: 'BI_CHAN_AN_TOAN' }, { status: 422 });
    return NextResponse.json({ error: 'LOI_CHAM' }, { status: 502 });
  }
}
