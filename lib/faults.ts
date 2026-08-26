import type { FaultCode, Severity, Skill, SkillGroup } from './types';

/** Bảng lỗi — linh hồn của Catch.
 *
 *  Sinh ra từ docs/STROKE-FAULTS.md, không phải ngược lại. Sửa ở đây thì phải
 *  sửa cả tài liệu, vì tài liệu là thứ huấn luyện viên đọc để soát lại.
 *
 *  `severity` KHÔNG phải mức xấu của động tác mà là mức rủi ro đuối nước. Trẻ em
 *  Việt Nam chết đuối ở ao, hồ, sông — nơi không có thành bám và không có ai
 *  đứng cạnh. Nên lỗi khiến một đứa trẻ không tự cầm cự được ở chỗ đó xếp trên
 *  mọi lỗi chỉ làm động tác xấu đi. */
export type FaultSpec = {
  code: FaultCode;
  skill: Skill;
  severity: Severity;
  /** Tên gọi ngắn, hiện trên thẻ lỗi */
  label: string;
  /** Nhìn thấy từ bờ bằng dấu hiệu gì — đưa thẳng vào prompt */
  visible: string;
  /** Sửa bằng cách nào ở buổi sau */
  drill: string;
};

export const FAULTS: FaultSpec[] = [
  /* ═══ ĐỨNG NƯỚC ════════════════════════════════════════════════════════
     Không phải kiểu bơi. Là kỹ năng giữ mạng: rơi xuống ao, đứng nước được
     thì cầm cự tới lúc có người tới; không thì hai phút là hết. */
  {
    code: 'TW_FLAILING', skill: 'treading', severity: 'red',
    label: 'Vùng vẫy, đập tay lên khỏi mặt nước',
    visible: 'hai tay đập lên TRÊN mặt nước như đang trèo thang, thay vì quạt ngang dưới nước; người nhấp nhô lên xuống',
    drill: 'Tay quạt NGANG dưới mặt nước như xoa mặt bàn, không bao giờ đưa lên khỏi nước — tay lên khỏi nước là người tụt xuống. Tập bám thành bể một tay, tay kia quạt ngang cho quen.',
  },
  {
    code: 'TW_SINKING', skill: 'treading', severity: 'red',
    label: 'Chìm dần, miệng lúc trên lúc dưới',
    visible: 'cằm và miệng liên tục ngập rồi lại nhô; em phải gắng sức mới ngoi lên hớp được một hơi',
    drill: 'Đạp chân ếch rộng và CHẬM, tay quạt ngang liên tục không nghỉ. Thà nổi thấp mà đều còn hơn nhô cao từng nhịp rồi tụt.',
  },
  {
    code: 'TW_BREATH_HELD', skill: 'treading', severity: 'red',
    label: 'Nín thở giữa các nhịp',
    visible: 'má phồng giữ hơi, không thấy nhịp thở ra đều; hơi thở dồn dập về cuối',
    drill: 'Vừa đứng nước vừa đếm to từ một tới hai mươi. Nói được thành tiếng nghĩa là còn thở được — đây cũng là cách thầy kiểm nhanh cả lớp.',
  },
  {
    code: 'TW_NO_SCULL', skill: 'treading', severity: 'amber',
    label: 'Chỉ đạp chân, tay không quạt',
    visible: 'hai tay ép sát thân hoặc chới với vô định, toàn bộ việc giữ nổi dồn xuống chân',
    drill: 'Dạy quạt tay ngang trước khi dạy chân. Kẹp một tấm ván giữa hai đùi rồi tập giữ nổi chỉ bằng tay — em sẽ hiểu tay làm được bao nhiêu việc.',
  },
  {
    code: 'TW_STIFF', skill: 'treading', severity: 'amber',
    label: 'Người cứng, vai gồng',
    visible: 'vai nhô cao khỏi mặt nước, cổ gồng cứng, em cố giữ mình cao hơn mức cần',
    drill: 'Thả lỏng vai, hạ người xuống, chỉ cần mũi và miệng trên mặt nước là đủ. Giữ mình cao thêm mười phân là tốn gấp đôi sức.',
  },

  /* ═══ THẢ NỔI NGỬA ═════════════════════════════════════════════════════
     Kỹ năng sinh tồn số một. Nổi được thì gần như không tốn sức, và cầm cự
     được hàng chục phút. */
  {
    code: 'FL_CHIN_TUCKED', skill: 'backfloat', severity: 'red',
    label: 'Gập cằm vào ngực',
    visible: 'cằm chạm ngực, mắt nhìn về phía chân thay vì nhìn thẳng lên trời; hông và chân tụt xuống ngay sau đó',
    drill: 'Ngửa đầu hẳn ra sau cho tai ngập nước, mắt nhìn thẳng lên trần hoặc lên trời. Đầu là bánh lái: cằm xuống thì chân xuống theo.',
  },
  {
    code: 'FL_HIPS_SINK', skill: 'backfloat', severity: 'red',
    label: 'Hông chìm, người gập chữ V',
    visible: 'bụng thấp hơn hẳn ngực và chân, thân gập ở hông; nước tràn qua mặt',
    drill: 'Đẩy bụng lên như muốn cho rốn chạm trần nhà, hít sâu giữ khí trong phổi. Người thẳng thì nổi, người gập thì chìm.',
  },
  {
    code: 'FL_BREATH_HELD', skill: 'backfloat', severity: 'red',
    label: 'Nín thở rồi thở ra hết một lúc',
    visible: 'ngực không nhô đều; cứ mỗi lần thở ra là cả người tụt xuống một nấc rồi mới nổi lại',
    drill: 'Hít vào sâu, thở ra thật CHẬM và ít một. Phổi chính là cái phao — thở ra hết là tháo phao ra.',
  },
  {
    code: 'FL_TENSE', skill: 'backfloat', severity: 'amber',
    label: 'Người cứng, tay chân co lại',
    visible: 'tay ép chặt vào thân, chân co, toàn thân căng cứng thay vì buông lỏng',
    drill: 'Thả lỏng hoàn toàn, dang tay ngang thành chữ T. Nổi là việc của nước, không phải việc của cơ bắp.',
  },
  {
    code: 'FL_ARMS_DOWN', skill: 'backfloat', severity: 'green',
    label: 'Tay ép sát thân',
    visible: 'hai tay xuôi dọc theo hông thay vì dang ngang',
    drill: 'Dang tay ngang, lòng bàn tay hướng lên trời. Người dài và rộng ra thì nổi dễ hơn.',
  },

  /* ═══ BƠI ẾCH — kiểu được dạy đầu tiên ở trường Việt Nam ═══════════════ */
  {
    code: 'BR_NO_GLIDE', skill: 'breaststroke', severity: 'red',
    label: 'Không có pha lướt',
    visible: 'nhịp tay đều tăm tắp, không có khoảng lặng giữa hai chu kỳ',
    drill: 'Đếm to "một – hai" sau mỗi lần đạp chân, giữ nguyên tư thế duỗi thẳng rồi mới quạt tay tiếp. Tập trước: đạp chân từ thành bể rồi lướt càng xa càng tốt, không quạt tay.',
  },
  {
    code: 'BR_BREATH_HELD', skill: 'breaststroke', severity: 'red',
    label: 'Nín thở, không thở ra dưới nước',
    visible: 'không thấy bọt khí quanh mặt lúc úp mặt xuống; ngoi lên là hớp vội',
    drill: 'Thổi bong bóng ở chỗ nước nông: úp mặt xuống thổi hết hơi ra thành bọt, ngoi lên chỉ hít vào. Hai mươi lần trước mỗi buổi bơi.',
  },
  {
    code: 'BR_SCISSOR_KICK', skill: 'breaststroke', severity: 'amber',
    label: 'Đạp chân lệch, không đối xứng',
    visible: 'vệt nước hai bên khác nhau; người trôi vẹo khỏi làn',
    drill: 'Nằm sấp bám thành bể, đạp chân ếch thật chậm để thầy nhìn hai gót có về cùng lúc không. Mười nhịp có kiểm soát hơn ba mươi nhịp vội.',
  },
  {
    code: 'BR_HEAD_HIGH', skill: 'breaststroke', severity: 'amber',
    label: 'Ngẩng đầu quá cao, hông chìm',
    visible: 'cằm luôn trên mặt nước; hông và chân chìm sâu, thân dựng đứng',
    drill: 'Mắt nhìn xuống đáy bể, chỉ nhấc cằm vừa đủ để miệng ra khỏi nước rồi úp lại ngay. Tập với ván: mắt nhìn đáy, tai chạm nước.',
  },
  {
    code: 'BR_KNEES_FORWARD', skill: 'breaststroke', severity: 'green',
    label: 'Co gối lên ngực thay vì kéo gót về mông',
    visible: 'đùi hầu như đứng yên, cẳng chân co lên quá nhiều; người khựng lại mỗi chu kỳ',
    drill: 'Kéo GÓT về phía mông, đừng kéo GỐI về phía ngực. Bám thành bể, thầy đặt tay ở mông để em biết gót phải chạm tới đâu.',
  },
  {
    code: 'BR_TIMING', skill: 'breaststroke', severity: 'green',
    label: 'Sai nhịp tay chân',
    visible: 'tay và chân hoạt động cùng lúc thay vì nối tiếp',
    drill: 'Đọc thành nhịp: "quạt tay – thở – đạp chân – lướt". Bơi chậm lại một nửa cho tới khi đúng thứ tự rồi mới tăng dần.',
  },
  {
    code: 'BR_WIDE_PULL', skill: 'breaststroke', severity: 'green',
    label: 'Quạt tay quá rộng, vượt đường vai',
    visible: 'bàn tay đi ra ngoài đường vai khi nhìn từ trên xuống',
    drill: 'Tay không được đi quá đường vai. Tưởng tượng vẽ một trái tim nhỏ trước ngực rồi chụm tay đẩy thẳng ra trước.',
  },

  /* ═══ BƠI TRƯỜN SẤP (tự do) ════════════════════════════════════════════ */
  {
    code: 'FR_BREATH_HELD', skill: 'freestyle', severity: 'red',
    label: 'Không thở ra dưới nước',
    visible: 'không có dòng bọt khí liên tục; nhịp thở gấp dần về cuối',
    drill: 'Thổi hết hơi ra dưới nước thành dòng bọt liên tục, ngoi lên chỉ để hít. Tập ở chỗ nông: ba nhịp thổi, một nhịp hít.',
  },
  {
    code: 'FR_HEAD_LIFT_BREATH', skill: 'freestyle', severity: 'amber',
    label: 'Ngẩng đầu ra trước để thở',
    visible: 'mặt hướng thẳng ra trước lúc hít; hông tụt xuống ngay sau đó',
    drill: 'Xoay đầu chứ đừng ngẩng — một bên kính vẫn nằm dưới nước khi hít. Tập với ván, một tay duỗi trước, xoay đầu sang bên rồi úp lại.',
  },
  {
    code: 'FR_KNEE_KICK', skill: 'freestyle', severity: 'amber',
    label: 'Đạp chân từ đầu gối',
    visible: 'gót đập nước ầm ĩ, bọt trắng nhiều mà người không tiến',
    drill: 'Đạp từ hông, chân gần như thẳng, cổ chân mềm. Tập đạp chân bám thành bể, thầy giữ nhẹ đầu gối để em cảm nhận.',
  },
  {
    code: 'FR_NO_ROTATION', skill: 'freestyle', severity: 'green',
    label: 'Thân không xoay',
    visible: 'hai vai giữ nguyên mặt phẳng suốt chu kỳ',
    drill: 'Lăn cả người theo tay, vai bên dưới phải lộ ra khỏi mặt nước. Tập bơi một tay, tay kia duỗi trước, chú ý vai lăn.',
  },
  {
    code: 'FR_OVERREACH', skill: 'freestyle', severity: 'green',
    label: 'Tay vào nước quá xa, hụt pha bám',
    visible: 'bàn tay chạm nước rồi trượt một quãng mới bắt đầu kéo',
    drill: 'Tay vào nước ở khoảng trước đỉnh đầu, không duỗi hết tầm rồi mới bám. Bám nước ngay khi bàn tay chìm.',
  },

  /* ═══ BƠI NGỬA ═════════════════════════════════════════════════════════ */
  {
    code: 'BK_WATER_OVER_FACE', skill: 'backstroke', severity: 'red',
    label: 'Nước tràn qua mặt, em bị sặc',
    visible: 'mặt bị nước phủ mỗi chu kỳ; em ho, ngoi lên hoặc dừng lại giữa chừng',
    drill: 'Nâng ngực và giữ hông sát mặt nước, tai ngập nhưng mặt luôn khô. Em sặc trong hồ là em sẽ hoảng ở chỗ sâu.',
  },
  {
    code: 'BK_CHIN_TUCKED', skill: 'backstroke', severity: 'amber',
    label: 'Gập cằm nhìn về phía chân',
    visible: 'cằm chạm ngực, mắt nhìn xuống thân mình; hông tụt xuống theo',
    drill: 'Mắt nhìn thẳng lên trần, cằm hơi ngẩng, gáy tì vào nước. Cằm xuống là chân xuống.',
  },
  {
    code: 'BK_HIPS_SINK', skill: 'backstroke', severity: 'amber',
    label: 'Người "ngồi" trong nước',
    visible: 'đầu gối trồi lên khỏi mặt nước, thân gập ở hông, em bơi như đang ngồi ghế',
    drill: 'Đẩy hông lên sát mặt nước, giữ thân thẳng như một tấm ván. Đạp chân từ hông chứ không từ gối.',
  },
  {
    code: 'BK_KNEE_KICK', skill: 'backstroke', severity: 'amber',
    label: 'Đạp chân từ đầu gối',
    visible: 'đầu gối trồi khỏi mặt nước, nước bắn tung mà người gần như không tiến',
    drill: 'Đạp từ hông, gối gần thẳng, mũi chân duỗi. Chỉ mũi chân được phá mặt nước, đầu gối thì không.',
  },
  {
    code: 'BK_NO_ROTATION', skill: 'backstroke', severity: 'green',
    label: 'Thân không lăn',
    visible: 'hai vai giữ nguyên mặt phẳng suốt chu kỳ, người bơi phẳng như tấm ván úp',
    drill: 'Lăn vai theo tay: tay nào kéo thì vai bên đó chìm xuống. Tập bơi một tay, tay kia duỗi trên đầu.',
  },
  {
    code: 'BK_BENT_RECOVERY', skill: 'backstroke', severity: 'green',
    label: 'Tay gập khi vung lên khỏi nước',
    visible: 'khuỷu tay gập lại lúc tay đi trên không, bàn tay quét ngang thay vì vẽ vòng thẳng',
    drill: 'Tay thẳng suốt lúc trên không, ngón cái ra trước, ngón út vào nước trước. Tưởng tượng tay là cây kim đồng hồ.',
  },

  /* ═══ BƠI BƯỚM ═════════════════════════════════════════════════════════
     Ngoài nội dung phổ cập bơi. Có ở đây cho câu lạc bộ và đội tuyển trường. */
  {
    code: 'BF_BREATH_HELD', skill: 'butterfly', severity: 'red',
    label: 'Nín thở, không thở ra dưới nước',
    visible: 'không có dòng bọt khí khi mặt còn dưới nước; nhịp rối loạn và ngắn dần rất nhanh',
    drill: 'Thở ra liên tục dưới nước, ngoi lên chỉ hít. Bơi bướm mà nín thở thì hai chục mét là hết sức.',
  },
  {
    code: 'BF_HEAD_HIGH', skill: 'butterfly', severity: 'amber',
    label: 'Ngẩng đầu quá cao và quá lâu khi thở',
    visible: 'cả cằm và ngực nhô hẳn lên khi hít; hông chìm sâu ngay sau đó',
    drill: 'Đẩy cằm ra trước sát mặt nước chứ đừng ngẩng lên, và úp mặt lại ngay. Đầu lên cao bao nhiêu thì hông xuống sâu bấy nhiêu.',
  },
  {
    code: 'BF_NO_UNDULATION', skill: 'butterfly', severity: 'green',
    label: 'Không có sóng thân',
    visible: 'thân giữ phẳng, chỉ có tay và chân đập; không thấy làn sóng chạy từ ngực xuống chân',
    drill: 'Tập sóng thân không dùng tay: hai tay duỗi trước, đẩy ngực xuống rồi thả cho sóng chạy xuống hông và chân.',
  },
  {
    code: 'BF_SINGLE_KICK', skill: 'butterfly', severity: 'green',
    label: 'Chỉ một nhịp đạp mỗi chu kỳ',
    visible: 'chỉ thấy một cú đạp chân cho mỗi vòng tay, thay vì hai',
    drill: 'Hai nhịp mỗi chu kỳ: một nhịp lúc tay vào nước, một nhịp lúc tay đẩy ra khỏi nước. Đếm "một – hai" theo tay.',
  },
  {
    code: 'BF_SHORT_PULL', skill: 'butterfly', severity: 'green',
    label: 'Tay ra khỏi nước sớm, chưa kéo hết',
    visible: 'bàn tay rời nước ở khoảng ngang bụng thay vì đẩy qua hông',
    drill: 'Đẩy tay hết tới hông, quệt ngón cái vào đùi rồi mới nhấc lên. Nửa cuối của cú kéo mới là phần đẩy người đi.',
  },
];

export const BY_CODE = new Map(FAULTS.map((f) => [f.code, f]));

/** Enum gửi cho Gemini phải RÀNG BUỘC THEO NỘI DUNG ĐANG CHẤM.
 *
 *  Phép thử 26/08 phơi ra chuyện này: đưa cả bảng vào schema thì model mượn mã
 *  của kiểu bơi khác để mô tả một hiện tượng đúng — trả FR_KNEE_KICK cho một
 *  video bơi ếch. Lọc theo nội dung là xong, và tiện thể chặn luôn ca thầy chọn
 *  nhầm kiểu bơi: không có mã hợp lệ nào thì model khai thẳng là video không khớp. */
export const codesFor = (skill: Skill) =>
  FAULTS.filter((f) => f.skill === skill).map((f) => f.code);

export const SEVERITY_ORDER: Record<Severity, number> = { red: 0, amber: 1, green: 2 };

export const SEVERITY_META: Record<Severity, { label: string; why: string }> = {
  red: {
    label: 'Nguy hiểm ở chỗ sâu',
    why: 'Lỗi khiến em không tự cầm cự được ở chỗ không có chỗ bám — hết hơi, chìm dần, hoặc sặc rồi hoảng. Sửa trước tiên.',
  },
  amber: {
    label: 'Mất kiểm soát',
    why: 'Không nguy hiểm ngay, nhưng làm em không tới được bờ mình nhắm tới, hoặc mau hết sức.',
  },
  green: {
    label: 'Hiệu suất',
    why: 'Bơi tốn sức hơn cần thiết. Sửa lúc nào cũng được.',
  },
};

export type SkillSpec = {
  group: SkillGroup;
  label: string;
  hint: string;
  /** Có nằm trong nội dung phổ cập bơi ở trường không */
  curriculum: boolean;
};

/** Thứ tự cố ý: hai kỹ năng sinh tồn đứng trước mọi kiểu bơi.
 *
 *  Không phải để cho đẹp. Một đứa trẻ đứng nước và thả nổi được thì sống sót
 *  khi rơi xuống ao, kể cả khi không biết bơi kiểu nào. Ngược lại thì không. */
export const SKILL_META: Record<Skill, SkillSpec> = {
  treading:     { group: 'survival', label: 'Đứng nước',      hint: 'Giữ mình nổi tại chỗ — thứ quyết định em cầm cự được bao lâu khi rơi xuống ao', curriculum: true },
  backfloat:    { group: 'survival', label: 'Thả nổi ngửa',   hint: 'Nổi ngửa không tốn sức — kỹ năng sinh tồn số một', curriculum: true },
  breaststroke: { group: 'stroke',   label: 'Bơi ếch',        hint: 'Kiểu được dạy đầu tiên trong chương trình phổ cập bơi', curriculum: true },
  freestyle:    { group: 'stroke',   label: 'Bơi trườn sấp',  hint: 'Còn gọi là bơi tự do, bơi sải', curriculum: true },
  backstroke:   { group: 'stroke',   label: 'Bơi ngửa',       hint: 'Mặt luôn trên mặt nước nên thở dễ, hợp với em còn sợ úp mặt', curriculum: true },
  butterfly:    { group: 'stroke',   label: 'Bơi bướm',       hint: 'Ngoài nội dung phổ cập — dành cho câu lạc bộ và đội tuyển trường', curriculum: false },
};

export const SKILL_ORDER: Skill[] =
  ['treading', 'backfloat', 'breaststroke', 'freestyle', 'backstroke', 'butterfly'];

export const GROUP_META: Record<SkillGroup, { label: string; hint: string }> = {
  survival: { label: 'Kỹ năng sinh tồn', hint: 'Không phải kiểu bơi. Là thứ giữ mạng khi em rơi xuống chỗ không có chỗ bám.' },
  stroke:   { label: 'Kiểu bơi',          hint: 'Bốn kiểu bơi, ba kiểu đầu nằm trong nội dung phổ cập ở trường.' },
};

/** Sắp xếp đúng thứ tự Catch phải báo: đỏ trước, rồi tới mức tin cậy. */
export const rank = (a: { code: FaultCode; confidence: number }, b: { code: FaultCode; confidence: number }) => {
  const sa = SEVERITY_ORDER[BY_CODE.get(a.code)!.severity];
  const sb = SEVERITY_ORDER[BY_CODE.get(b.code)!.severity];
  return sa !== sb ? sa - sb : b.confidence - a.confidence;
};
