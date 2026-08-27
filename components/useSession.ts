'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  emptySession, requestPersistentStorage, loadArchive, loadSession, saveArchive, saveSession,
  type Entry, type Session,
} from '@/lib/session';
import { firebaseReady, leaveAccount, linkGoogle, startAnalytics, watchUser } from '@/lib/firebase.client';
import { dropSession, putSession, watchSessions } from '@/lib/cloud';

const KEYS = ['catch:session:v1', 'catch:archive:v1'];

export type Backup = { version: 1; exportedAt: string; current: Session; archive: Session[] };

/** Buổi học ở đâu, và thầy đang được hứa điều gì.
 *
 *  Ba trạng thái này phải nói thật ra giao diện, vì lời hứa của mỗi cái khác hẳn nhau:
 *
 *  · `off`     — chưa cấu hình Firebase. Chỉ nằm trong trình duyệt máy này.
 *  · `device`  — đã lên Firestore, nhưng danh tính là tài khoản ẩn danh gắn với
 *                trình duyệt này. Xoá dữ liệu duyệt web là mất đường về tài khoản
 *                đó. KHÔNG được nói với thầy là "đã an toàn trên đám mây".
 *  · `account` — đã đăng nhập Google. Đây mới là lúc buổi học thật sự theo người,
 *                mở máy khác vẫn còn. */
export type SyncState = 'off' | 'device' | 'account';

/** Gộp nhiều lần gõ thành một lần ghi.
 *
 *  Thầy gõ tên lớp "4A" là ba lần đổi state. Ghi thẳng lên Firestore từng lần là
 *  ba lượt ghi tính tiền, trên đường truyền 3G ở bờ hồ. Chỉ hoãn phần siêu dữ
 *  liệu — thêm hay xoá một em là hành động dứt khoát, ghi ngay. */
const DEBOUNCE_MS = 600;

/** Số buổi cũ giữ lại — khớp với KEEP trong lib/session.ts. Đủ cho một khoá phổ
 *  cập bơi, và là hạn lưu trữ mà docs/SAFETY.md hứa với phụ huynh. */
const KEEP = 20;

export function useSession() {
  const [session, setSession] = useState<Session>(() => emptySession());
  const [archive, setArchive] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);
  /** Máy có thật sự lưu được không. Chỉ chuyển sang false khi một lần ghi hỏng
   *  thật — đoán trước bằng cách ghi thử rồi cảnh báo là dựng chuyện doạ thầy. */
  const [storageOk, setStorageOk] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const uidRef = useRef<string | null>(null);
  const hydrated = useRef(false);
  const lastLocalWrite = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<Session | null>(null);

  const syncState: SyncState =
    !firebaseReady ? 'off' : user && !user.isAnonymous ? 'account' : 'device';

  /* ── Máy này ────────────────────────────────────────────────────────────
     localStorage vẫn được ghi kể cả khi đã có Firestore. Không phải để dự
     phòng cho vui: đây là thứ duy nhất còn đọc được khi thầy mở Catch lần đầu
     trong ngày ở chỗ không có sóng, trước khi Firestore kịp mở bộ đệm. */
  useEffect(() => {
    setSession(loadSession());
    setArchive(loadArchive());
    setReady(true);
    void requestPersistentStorage();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || !KEYS.includes(e.key)) return;
      setSession(loadSession());
      setArchive(loadArchive());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /* ── Danh tính ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!firebaseReady) return;
    void startAnalytics();
    return watchUser((u) => {
      uidRef.current = u?.uid ?? null;
      hydrated.current = false;
      setUser(u);
    });
  }, []);

  const pushCloud = useCallback((s: Session, now = false) => {
    const uid = uidRef.current;
    if (!uid) return;
    lastLocalWrite.current = Date.now();
    pending.current = s;
    const flush = () => {
      const p = pending.current;
      pending.current = null;
      if (!p) return;
      /* `.catch()` là chưa đủ. setDoc() KIỂM DỮ LIỆU NGAY và ném lỗi đồng bộ khi
         gặp giá trị lạ — lỗi đó bay thẳng ra ngoài hàm cập nhật state của React
         và làm sập màn hình, kéo theo mất luôn em vừa chấm. Đã đo: một trường
         `undefined` sót lại làm "0 em đã chấm" và không quay về được. Một lần
         ghi hỏng lên đám mây không bao giờ được phép làm mất việc của thầy. */
      try {
        putSession(uid, p, null).catch(() => setCloudError('Chưa đồng bộ được lên Firebase.'));
      } catch {
        setCloudError('Chưa đồng bộ được lên Firebase.');
      }
    };
    if (timer.current) clearTimeout(timer.current);
    if (now) flush();
    else timer.current = setTimeout(flush, DEBOUNCE_MS);
  }, []);

  /* ── Firestore ──────────────────────────────────────────────────────────
     Bản trên máy chủ chỉ được đè lên màn hình khi nó thật sự tới từ máy chủ và
     thầy không vừa sửa gì. Đè bừa là chữ đang gõ dở nhảy mất. */
  useEffect(() => {
    const uid = user?.uid;
    if (!firebaseReady || !uid) return;
    return watchSessions(uid, (state, fromCache) => {
      setCloudError(null);

      /* Dọn buổi để ngỏ mồ côi. Có em trong đó thì ĐÓNG cho vào kho chứ không
         xoá — thầy chấm dở trên máy kia rồi tắt máy, các em đó vẫn phải còn. */
      state.strayOpen.forEach((s) => {
        if (s.entries.length === 0) void dropSession(uid, s.id).catch(() => {});
        else void putSession(uid, s, Date.now()).catch(() => {});
      });

      if (!hydrated.current) {
        hydrated.current = true;
        if (state.current) {
          setSession(state.current);
          saveSession(state.current);
        } else {
          /* Tài khoản chưa có gì trên Firestore. Buổi đang dở trong máy này thì
             đẩy lên — thầy vừa đăng nhập giữa buổi không được mất ba mươi em. */
          const local = loadSession();
          if (local.entries.length > 0 || local.className) {
            void putSession(uid, local, null).catch(() => {});
          }
        }
        if (state.archive.length > 0) {
          setArchive(state.archive);
          saveArchive(state.archive);
        }
        return;
      }

      if (fromCache) return;
      if (Date.now() - lastLocalWrite.current < 2000) return;
      if (state.current) { setSession(state.current); saveSession(state.current); }
      setArchive(state.archive);
      saveArchive(state.archive);
    });
  }, [user?.uid]);

  const update = useCallback((next: Session | ((s: Session) => Session), now = false) => {
    setSession((cur) => {
      const value = typeof next === 'function' ? next(cur) : next;
      if (!saveSession(value)) setStorageOk(false);
      pushCloud(value, now);
      return value;
    });
  }, [pushCloud]);

  const addEntry = useCallback((entry: Entry) => {
    update((s) => ({ ...s, entries: [...s.entries, entry] }), true);
  }, [update]);

  const patchEntry = useCallback((id: string, patch: Partial<Entry>) => {
    update((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }), true);
  }, [update]);

  const removeEntry = useCallback((id: string) => {
    update((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }), true);
  }, [update]);

  const clearEntries = useCallback(() => {
    update((s) => ({ ...s, entries: [] }), true);
  }, [update]);

  /** Đóng buổi hôm nay, mở buổi mới cho cùng lớp.
   *
   *  Đây là chỗ duy nhất buổi cũ được cất đi. Không tự động đóng theo ngày:
   *  thầy có thể chấm rải rác qua hai hôm, và máy không nên tự quyết thay. */
  const finishSession = useCallback(() => {
    setSession((cur) => {
      if (cur.entries.length === 0) return cur;
      const uid = uidRef.current;
      setArchive((old) => {
        const all = [...old.filter((s) => s.id !== cur.id), cur];
        const next = all.slice(-KEEP);
        if (!saveArchive(next)) setStorageOk(false);
        /* Firestore không tự rụng buổi cũ như localStorage. Không dọn thì hồ sơ
           trẻ em nằm đó vĩnh viễn, mà docs/SAFETY.md hứa giữ tối đa một khoá học.
           Lời hứa về thời hạn lưu trữ phải do code giữ, không phải do tài liệu. */
        if (uid) all.slice(0, Math.max(0, all.length - KEEP))
          .forEach((s) => void dropSession(uid, s.id).catch(() => {}));
        return next;
      });
      if (uid) {
        void putSession(uid, cur, Date.now()).catch(() => setCloudError('Chưa đồng bộ được lên Firebase.'));
      }
      const fresh = emptySession(cur.className);
      if (!saveSession(fresh)) setStorageOk(false);
      if (uid) void putSession(uid, fresh, null).catch(() => {});
      return fresh;
    });
  }, []);

  /** Mang buổi học sang máy khác, hoặc giữ lại phòng khi mất máy.
   *  Vẫn giữ kể cả khi đã có Firebase: một tệp cầm tay là thứ không phụ thuộc
   *  vào tài khoản nào còn sống hay dự án nào còn hạn mức. */
  const exportBackup = useCallback((): Backup => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    current: session,
    archive,
  }), [session, archive]);

  const importBackup = useCallback((raw: unknown): { ok: true } | { ok: false; why: string } => {
    const b = raw as Partial<Backup>;
    if (!b || b.version !== 1) return { ok: false, why: 'Tệp này không phải bản lưu của Catch.' };
    if (!b.current || !Array.isArray(b.current.entries)) return { ok: false, why: 'Tệp lưu hỏng — thiếu buổi hiện tại.' };
    const nextArchive = Array.isArray(b.archive) ? b.archive.filter((s) => Array.isArray(s?.entries)) : [];
    if (!saveSession(b.current) || !saveArchive(nextArchive)) setStorageOk(false);
    setSession(b.current);
    setArchive(nextArchive);
    const uid = uidRef.current;
    if (uid) {
      void putSession(uid, b.current, null).catch(() => {});
      nextArchive.forEach((s) => void putSession(uid, s, Date.now()).catch(() => {}));
    }
    return { ok: true };
  }, []);

  const signIn = useCallback(async () => {
    const r = await linkGoogle();
    if (!r.ok && r.why) setCloudError(r.why);
    if (r.ok) { hydrated.current = false; setCloudError(null); }
    return r;
  }, []);

  const signOutTeacher = useCallback(async () => {
    await leaveAccount();
    hydrated.current = false;
  }, []);

  return {
    session, archive, ready, storageOk, update,
    addEntry, patchEntry, removeEntry, clearEntries,
    finishSession, exportBackup, importBackup,
    syncState, user, cloudError, signIn, signOutTeacher,
  };
}
