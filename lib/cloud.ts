'use client';

import {
  collection, deleteDoc, doc, onSnapshot, setDoc, type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from './firebase.client';
import type { Session } from './session';

/** Buổi học trên Firestore.
 *
 *      users/{uid}/sessions/{sessionId}
 *
 *  Mỗi buổi một tài liệu, không nhét cả kho vào một chỗ: buổi đang chấm bị ghi
 *  lại liên tục, còn buổi cũ thì gần như không đụng tới. Tách ra thì một lần
 *  thêm em không kéo theo hai mươi buổi cũ đi qua đường truyền của thầy.
 *
 *  `closedAt` phân biệt buổi đang chấm với buổi đã đóng — đúng một buổi được
 *  phép để trống trường này. Không dùng cờ `isCurrent` vì hai máy cùng bật cờ
 *  là hỏng, còn mốc thời gian thì so được. */
export type CloudSession = Session & { closedAt: number | null; updatedAt: number };

const KEEP = 20;

const sessionsRef = (uid: string) => {
  const db = getDb();
  return db ? collection(db, 'users', uid, 'sessions') : null;
};

export function putSession(uid: string, s: Session, closedAt: number | null): Promise<void> {
  const col = sessionsRef(uid);
  if (!col) return Promise.resolve();
  const payload: CloudSession = {
    id: s.id,
    className: s.className,
    date: s.date,
    entries: s.entries,
    closedAt,
    updatedAt: Date.now(),
  };
  /* merge:false — buổi học là một khối, ghi đè cả cục. Ghi kiểu vá từng trường
     thì một em bị xoá ở máy này vẫn sống lại từ máy kia. */
  return setDoc(doc(col, s.id), payload);
}

export function dropSession(uid: string, id: string): Promise<void> {
  const col = sessionsRef(uid);
  return col ? deleteDoc(doc(col, id)) : Promise.resolve();
}

/** `strayOpen` — những buổi còn để ngỏ ngoài buổi đang dùng.
 *
 *  Sinh ra khi thầy mở Catch trên hai máy cùng lúc: mỗi máy tự dựng một buổi mới
 *  và cùng ghi lên với `closedAt = null`. Không dọn thì chúng nằm lại mãi, không
 *  máy nào hiện ra — mà một trong số đó có thể đang chứa các em thầy vừa chấm.
 *  Chỗ gọi phải quyết: buổi rỗng thì xoá, buổi có em thì đóng lại cho vào kho.
 *  Vứt im lặng một buổi có tên trẻ trong đó là chuyện không được phép. */
export type CloudState = { current: Session | null; archive: Session[]; strayOpen: Session[] };

/** Nghe mọi thay đổi, kể cả từ máy khác của cùng thầy.
 *
 *  Firestore trả về từ bộ đệm trước rồi mới tới bản trên máy chủ, nên màn hình
 *  không đợi mạng. `fromCache` để chỗ gọi biết dữ liệu đang là bản chờ đồng bộ
 *  hay đã lên tới nơi. */
export function watchSessions(
  uid: string,
  cb: (state: CloudState, fromCache: boolean) => void,
): Unsubscribe {
  const col = sessionsRef(uid);
  if (!col) return () => {};
  return onSnapshot(col, (snap) => {
    const all = snap.docs.map((d) => d.data() as CloudSession).filter((s) => Array.isArray(s?.entries));
    const open = all.filter((s) => s.closedAt == null).sort((a, b) => b.updatedAt - a.updatedAt);
    const closed = all.filter((s) => s.closedAt != null).sort((a, b) => a.date.localeCompare(b.date));
    const strip = (s: CloudSession): Session =>
      ({ id: s.id, className: s.className, date: s.date, entries: s.entries });
    cb(
      {
        current: open[0] ? strip(open[0]) : null,
        archive: closed.slice(-KEEP).map(strip),
        strayOpen: open.slice(1).map(strip),
      },
      snap.metadata.fromCache,
    );
  }, () => cb({ current: null, archive: [], strayOpen: [] }, true));
}
