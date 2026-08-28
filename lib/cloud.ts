'use client';

import {
  collection, deleteDoc, doc, onSnapshot, setDoc, type Unsubscribe,
} from 'firebase/firestore';
import { getDb } from './firebase.client';
import type { Session } from './session';

/** users/{uid}/sessions/{sessionId} — mỗi buổi một tài liệu.
 *  `closedAt` phân biệt buổi đang chấm với buổi đã đóng; không dùng cờ isCurrent
 *  vì hai máy cùng bật cờ là hỏng, còn mốc thời gian thì so được. */
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

/** `strayOpen`: buổi để ngỏ mồ côi, sinh ra khi thầy mở Catch trên hai máy.
 *  Chỗ gọi phải dọn — rỗng thì xoá, có em thì đóng lại cho vào kho. */
export type CloudState = { current: Session | null; archive: Session[]; strayOpen: Session[] };

/** Nghe thay đổi, kể cả từ máy khác. `fromCache` cho biết đã lên tới máy chủ chưa. */
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
