import 'server-only';
import { GoogleGenAI, Type, FileState, createPartFromUri } from '@google/genai';
import { codesFor } from './faults';
import { intersectPasses, normalizeFaults, type RawFault } from './normalize';
import { analysisPrompt } from './prompt';
import type { Analysis, Fault, Skill } from './types';

/* Đo ngày 26/08 trên chính video bơi, xem private/probe/bench.mjs.
   Hai phép đo, và phép thứ hai mới là phép quyết định:

     (a) ca khó — đạp chân lệch, video 23k token
           3.5-flash-lite   7,9s ✓      3.6-flash  39,7s ✓      3.1-flash-lite  14,9s ✓
     (b) ĐỐI CHỨNG ÂM — vô địch thế giới bơi đúng kỹ thuật, KHÔNG được báo lỗi nào
           3.5-flash-lite   sạch 4/4 lượt, 2,0–6,0s
           3.6-flash        sạch 3/4 lượt — một lượt bịa ra BR_KNEES_FORWARD@00:06
           3.1-flash-lite   bịa BR_KNEES_FORWARD@00:03
           3.5-flash        một lượt bịa, một lượt 504, một lượt 429; 64–89s
           3.7-flash        504 "Deadline expired" liên tục
           2.5-flash        404 — Google đã gỡ khỏi tài khoản mới

   Chọn 3.5-flash-lite làm chính: nhanh nhất, và là model duy nhất không lượt nào
   bịa lỗi trên video bơi đúng. Với sản phẩm mà thầy sẽ tin rồi đi sửa cho học sinh,
   "không bịa" quan trọng hơn "bắt được nhiều".

   Ghi thêm: lỗi bịa KHÔNG cố định — cùng model, cùng video, lượt có lượt không.
   Đó chính là loại lỗi mà chấm hai lượt (`intersectPasses`) lọc được. */
const MODEL_MAIN = 'gemini-3.5-flash-lite';
const MODEL_FALLBACK = 'gemini-3.6-flash';

export const hasKey = () => !!(process.env.GEMINI_API_KEY || process.env.API_KEY);

let _ai: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
    if (!apiKey) throw new Error('THIEU_KHOA_API');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

const TRANSIENT = /UNAVAILABLE|Deadline expired|INTERNAL|503|500|502|504|ECONNRESET|ETIMEDOUT|socket hang up|fetch failed/i;

/** Trần cứng cho MỘT lượt gọi model.
 *
 *  Đo được ngày 26/08: lúc `gemini-3.5-flash` quá tải, một lượt lùi về model dự
 *  phòng chạy **317 giây** rồi mới trả kết quả. Trần `deadline` cũ không chặn
 *  được chuyện đó — nó chỉ được kiểm giữa các lần thử lại, còn một lượt gọi đang
 *  treo thì chạy tới khi nào xong thì thôi.
 *
 *  Cloud Run cắt request ở 180 giây. Không có trần này thì thầy chờ ba phút để
 *  nhận về một trang lỗi trắng. Thà báo hỏng sau một phút và bảo thử lại. */
const PER_CALL_MS = 60_000;
const FATAL = /API_KEY|PERMISSION|UNAUTHENTICATED|SAFETY|PROHIBITED|INVALID_ARGUMENT/i;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Ngân sách cho lượt gọi kế tiếp: phần nhỏ hơn giữa trần một lượt và thời gian
 *  còn lại của cả yêu cầu. */
const budget = (deadline: number) => Math.max(5_000, Math.min(PER_CALL_MS, deadline - Date.now()));

async function retry<T>(job: () => Promise<T>, deadline: number, max = 2): Promise<T> {
  let last: unknown;
  for (let i = 0; i < max; i++) {
    try { return await job(); } catch (e) {
      last = e;
      const msg = String((e as Error)?.message ?? e);
      if (FATAL.test(msg) || !TRANSIENT.test(msg)) throw e;
      if (Date.now() >= deadline) throw e;
      if (i < max - 1) await sleep(800 * 2 ** i + Math.random() * 400);
    }
  }
  throw last;
}

function schemaFor(skill: Skill) {
  return {
    type: Type.OBJECT,
    properties: {
      refused: { type: Type.STRING, nullable: true },
      faults: {
        type: Type.ARRAY,
        maxItems: 3,
        items: {
          type: Type.OBJECT,
          properties: {
            // Ràng buộc theo kiểu bơi — xem chú thích codesFor() trong faults.ts
            code: { type: Type.STRING, enum: codesFor(skill) },
            at: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            evidence: { type: Type.STRING },
            note: { type: Type.STRING },
          },
          required: ['code', 'at', 'confidence', 'evidence', 'note'],
        },
      },
    },
    required: ['faults'],
  };
}

/** Chờ tệp chuyển sang ACTIVE. Files API là bất đồng bộ — tải lên xong chưa dùng
 *  được ngay. Có trần thời gian vì Cloud Run cũng có trần cho mỗi request.
 *
 *  Hỏi dày ở đầu rồi thưa dần. Một clip 10 giây thường xong trong khoảng một
 *  giây; hỏi đều 1,2 s như trước là ngồi chờ vô ích gần hết quãng đó. Đo được
 *  26/08: đường tải tệp mất 13–24 giây, phần lớn nằm ở vòng chờ này. */
const NHIP_CHO = [250, 350, 500, 700, 900];

async function waitActive(name: string, deadline: number) {
  for (let i = 0; ; i++) {
    const f = await client().files.get({ name });
    if (f.state === FileState.ACTIVE) return f;
    if (f.state === FileState.FAILED) throw new Error('FILE_XU_LY_HONG');
    if (Date.now() > deadline) throw new Error('FILE_QUA_LAU');
    await sleep(NHIP_CHO[Math.min(i, NHIP_CHO.length - 1)] + 200);
  }
}

/** Hai đường vào.
 *
 *  `upload` là đường thật của giáo viên: video quay ở hồ bơi, tải lên, chấm xong
 *  XOÁ ngay. `youtube` là đường để người khác thử ngay mà không phải tự quay, và
 *  là đường dùng khi quay video demo — không phải đưa video trẻ em lên máy chủ
 *  chỉ để cho người ta xem sản phẩm chạy. */
export type Source =
  | { kind: 'upload'; video: Blob; mimeType: string; durationSec?: number }
  | { kind: 'youtube'; url: string };

/** Chấm kỹ: gọi model hai lượt độc lập, chỉ giữ lỗi xuất hiện ở cả hai.
 *  Xem `intersectPasses` trong normalize.ts. Tốn gấp đôi token và gấp đôi thời
 *  gian chờ, nên để thầy tự bật — mặc định tắt. */
export type Options = { thorough?: boolean };

export async function analyze(src: Source, skill: Skill, opts: Options = {}): Promise<Analysis> {
  const t0 = Date.now();
  const deadline = t0 + (opts.thorough ? 170_000 : 110_000);
  const durationSec = src.kind === 'upload' ? src.durationSec : undefined;
  let uploadedName: string | undefined;
  let model = MODEL_MAIN;

  try {
    let videoPart;
    if (src.kind === 'youtube') {
      videoPart = { fileData: { fileUri: src.url } };
    } else {
      const up = await client().files.upload({
        file: src.video,
        config: { mimeType: src.mimeType, abortSignal: AbortSignal.timeout(budget(deadline)) },
      });
      uploadedName = up.name;
      if (!uploadedName) throw new Error('FILE_KHONG_CO_TEN');
      const ready = await waitActive(uploadedName, deadline);
      videoPart = createPartFromUri(ready.uri!, ready.mimeType!);
    }

    const contents = [{ role: 'user', parts: [videoPart, { text: analysisPrompt(skill) }] }];
    const config = { responseMimeType: 'application/json', responseSchema: schemaFor(skill) as never };

    /* Mỗi lượt gọi mang theo tín hiệu huỷ riêng. Hết giờ là cắt, không chờ tiếp. */
    const call = (m: string) => {
      const ms = budget(deadline);
      return client().models.generateContent({
        model: m, contents,
        config: { ...config, abortSignal: AbortSignal.timeout(ms), httpOptions: { timeout: ms } },
      });
    };

    async function once() {
      try {
        return await retry(() => call(MODEL_MAIN), deadline, 2);
      } catch (e) {
        const msg = String((e as Error)?.message ?? e);
        if (FATAL.test(msg)) throw e;
        if (Date.now() >= deadline) throw new Error('QUA_HAN');
        model = MODEL_FALLBACK;
        return retry(() => call(MODEL_FALLBACK), deadline, 1);
      }
    }

    const read = (res: Awaited<ReturnType<typeof once>>) => {
      const raw = JSON.parse(res.text ?? '{}') as { refused?: string | null; faults?: RawFault[] };
      return {
        refused: raw.refused?.trim() || undefined,
        usage: res.usageMetadata,
        ...normalizeFaults(raw.faults, skill, durationSec),
      };
    };

    /* Hai lượt chạy song song: chúng độc lập với nhau, nối tiếp chỉ tổ bắt thầy
       chờ gấp đôi mà không được gì thêm. */
    const results = opts.thorough
      ? (await Promise.all([once(), once()])).map(read)
      : [read(await once())];
    const [first, second] = results;

    let faults: Fault[];
    let unconfirmed: number | undefined;
    // Một lượt từ chối là từ chối. Hai lượt bất đồng về việc có nhìn rõ hay
    // không thì nghiêng về phía không chấm.
    const refused = first.refused ?? second?.refused;

    if (second) {
      const merged = intersectPasses(first.faults, second.faults);
      faults = merged.faults;
      unconfirmed = merged.unconfirmed;
    } else {
      faults = first.faults;
    }

    const dropped = results.reduce((n, r) => n + r.dropped, 0);
    // Cộng cả hai lượt: câu "một lần chấm tốn bao nhiêu" phải trả lời đúng thứ
    // thầy thật sự trả, không phải một nửa của nó.
    const tokensIn = results.reduce((n, r) => n + (r.usage?.promptTokenCount ?? 0), 0);
    const tokensOut = results.reduce((n, r) => n + (r.usage?.candidatesTokenCount ?? 0), 0);
    console.log(`[catch] nguon=${src.kind} skill=${skill} model=${model} luot=${results.length} `
      + `loi=${faults.length} bo=${dropped} chuaXacNhan=${unconfirmed ?? '-'} `
      + `ms=${Date.now() - t0} vao=${tokensIn} ra=${tokensOut}`);

    return {
      skill,
      faults: refused ? [] : faults,
      refused,
      meta: { model, ms: Date.now() - t0, dropped, passes: results.length, unconfirmed, tokensIn, tokensOut },
    };
  } finally {
    /* Trong `finally`, KHÔNG phải trong `try`.
       Đặt nhầm chỗ thì hễ Gemini lỗi là video trẻ em nằm lại trên máy chủ Google.
       Đây là lỗi dễ mắc nhất trong cả dự án — xem docs/SAFETY.md mục 3. */
    if (uploadedName) {
      try { await client().files.delete({ name: uploadedName }); }
      catch (e) { console.error('[catch] KHONG XOA DUOC FILE', uploadedName, String((e as Error)?.message ?? e).slice(0, 200)); }
    }
  }
}
