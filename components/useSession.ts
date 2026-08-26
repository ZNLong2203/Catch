'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  emptySession, loadArchive, loadSession, saveArchive, saveSession,
  type Entry, type Session,
} from '@/lib/session';

const KEYS = ['catch:session:v1', 'catch:archive:v1'];

export type Backup = { version: 1; exportedAt: string; current: Session; archive: Session[] };

/** Buổi học nằm trong localStorage của chính máy giáo viên.
 *
 *  Đọc ở lần vẽ đầu tiên sau khi gắn vào DOM chứ không phải lúc khởi tạo state —
 *  máy chủ và trình duyệt phải vẽ ra cùng một thứ ở lượt đầu, không thì React
 *  báo lệch. `ready` để giao diện biết lúc nào số liệu là thật. */
export function useSession() {
  const [session, setSession] = useState<Session>(() => emptySession());
  const [archive, setArchive] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setArchive(loadArchive());
    setReady(true);

    // Thầy mở bảng ưu tiên ở tab khác thì hai tab phải khớp nhau
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !KEYS.includes(e.key)) return;
      setSession(loadSession());
      setArchive(loadArchive());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((next: Session | ((s: Session) => Session)) => {
    setSession((cur) => {
      const value = typeof next === 'function' ? next(cur) : next;
      saveSession(value);
      return value;
    });
  }, []);

  const addEntry = useCallback((entry: Entry) => {
    update((s) => ({ ...s, entries: [...s.entries, entry] }));
  }, [update]);

  const patchEntry = useCallback((id: string, patch: Partial<Entry>) => {
    update((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  }, [update]);

  const removeEntry = useCallback((id: string) => {
    update((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
  }, [update]);

  const clearEntries = useCallback(() => {
    update((s) => ({ ...s, entries: [] }));
  }, [update]);

  /** Đóng buổi hôm nay, mở buổi mới cho cùng lớp.
   *
   *  Đây là chỗ duy nhất buổi cũ được cất đi. Không tự động đóng theo ngày:
   *  thầy có thể chấm rải rác qua hai hôm, và máy không nên tự quyết thay. */
  const finishSession = useCallback(() => {
    setSession((cur) => {
      if (cur.entries.length === 0) return cur;
      setArchive((old) => {
        const next = [...old.filter((s) => s.id !== cur.id), cur];
        saveArchive(next);
        return next;
      });
      const fresh = emptySession(cur.className);
      saveSession(fresh);
      return fresh;
    });
  }, []);

  /** Mang buổi học sang máy khác, hoặc giữ lại phòng khi mất máy.
   *  Đây là đường thoát cho cái giá của việc không dùng cơ sở dữ liệu. */
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
    saveSession(b.current);
    saveArchive(nextArchive);
    setSession(b.current);
    setArchive(nextArchive);
    return { ok: true };
  }, []);

  return {
    session, archive, ready, update,
    addEntry, patchEntry, removeEntry, clearEntries,
    finishSession, exportBackup, importBackup,
  };
}
