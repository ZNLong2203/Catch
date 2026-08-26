/** Nội dung Catch chấm được.
 *
 *  Cố ý gọi là `Skill` chứ không phải `Stroke`: hai thứ quan trọng nhất đối với
 *  phòng chống đuối nước — đứng nước và thả nổi ngửa — không phải kiểu bơi nào cả.
 *  Chúng là kỹ năng giữ mạng, và là thứ quyết định một đứa trẻ rơi xuống ao có
 *  cầm cự được tới lúc có người tới hay không. */
export type Skill =
  | 'treading'      // đứng nước
  | 'backfloat'     // thả nổi ngửa
  | 'breaststroke'  // bơi ếch
  | 'freestyle'     // bơi trườn sấp
  | 'backstroke'    // bơi ngửa
  | 'butterfly';    // bơi bướm

export type SkillGroup = 'survival' | 'stroke';

/** Ba nhóm ưu tiên, xếp theo RỦI RO ĐUỐI NƯỚC chứ không theo mức xấu của động tác.
 *  Lý do đầy đủ nằm ở docs/STROKE-FAULTS.md — đây là trục chấm làm nên Catch. */
export type Severity = 'red' | 'amber' | 'green';

export type FaultCode =
  // Đứng nước
  | 'TW_SINKING' | 'TW_FLAILING' | 'TW_BREATH_HELD' | 'TW_NO_SCULL' | 'TW_STIFF'
  // Thả nổi ngửa
  | 'FL_HIPS_SINK' | 'FL_CHIN_TUCKED' | 'FL_BREATH_HELD' | 'FL_TENSE' | 'FL_ARMS_DOWN'
  // Bơi ếch
  | 'BR_NO_GLIDE' | 'BR_BREATH_HELD' | 'BR_SCISSOR_KICK' | 'BR_HEAD_HIGH'
  | 'BR_KNEES_FORWARD' | 'BR_TIMING' | 'BR_WIDE_PULL'
  // Bơi trườn sấp
  | 'FR_BREATH_HELD' | 'FR_HEAD_LIFT_BREATH' | 'FR_KNEE_KICK' | 'FR_NO_ROTATION' | 'FR_OVERREACH'
  // Bơi ngửa
  | 'BK_WATER_OVER_FACE' | 'BK_CHIN_TUCKED' | 'BK_HIPS_SINK' | 'BK_KNEE_KICK'
  | 'BK_NO_ROTATION' | 'BK_BENT_RECOVERY'
  // Bơi bướm
  | 'BF_BREATH_HELD' | 'BF_HEAD_HIGH' | 'BF_NO_UNDULATION' | 'BF_SINGLE_KICK' | 'BF_SHORT_PULL';

/** Đơn vị trung tâm của cả sản phẩm. Mọi màn hình đều là một danh sách Fault
 *  được sắp xếp lại. */
export type Fault = {
  code: FaultCode;
  /** Mốc trong video, tính bằng giây. BẮT BUỘC — không có thì lỗi bị bỏ ở máy chủ,
   *  dù model có chắc đến đâu. Thầy không kiểm chứng được thì không tin được. */
  at: number;
  confidence: number;
  /** Thứ NHÌN THẤY trong khung hình tại mốc đó. Không được viết chung chung. */
  evidence: string;
  /** Câu nói với giáo viên, tiếng Việt thường, không thuật ngữ thi đấu. */
  note: string;
  /** Có mặt khi thầy bật chấm hai lượt: lỗi này xuất hiện ở cả hai lượt độc lập. */
  confirmed?: boolean;
};

export type Analysis = {
  skill: Skill;
  faults: Fault[];
  /** Có giá trị = Catch từ chối chấm. Xem docs/SAFETY.md mục 2. */
  refused?: string;
  meta: {
    model: string;
    ms: number;
    tokensIn?: number;
    tokensOut?: number;
    /** Số lỗi bị cổng chặn loại ra. Bỏ trong im lặng là nói dối. */
    dropped: number;
    /** Số lượt gọi model — 1 hoặc 2 (chấm kỹ). */
    passes: number;
    /** Khi chấm hai lượt: số lỗi chỉ xuất hiện ở một lượt nên bị loại. */
    unconfirmed?: number;
  };
};
