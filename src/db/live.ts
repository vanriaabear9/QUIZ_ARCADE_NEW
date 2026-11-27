import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useState, useSyncExternalStore } from 'react';

// Every write in queries.ts calls notifyChange(), and every screen that reads with useLiveQuery
// re-runs its query. That keeps lists (like students joining a class) up to date on this device.
let version = 0;
const listeners = new Set<() => void>();

export function notifyChange() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const getVersion = () => version;

/** Runs `query` now and again after any database write. `key` must change when the query's inputs change. */
export function useLiveQuery<T>(key: string, query: (db: SQLiteDatabase) => Promise<T>): T | undefined {
  const db = useSQLiteContext();
  const v = useSyncExternalStore(subscribe, getVersion);
  const [result, setResult] = useState<{ key: string; data: T }>();

  useEffect(() => {
    let alive = true;
    query(db).then((data) => {
      if (alive) setResult({ key, data });
    });
    return () => {
      alive = false;
    };
    // `query` is recreated each render; `key` stands in for its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, key, v]);

  // Don't show the previous class's data while the next one loads.
  return result?.key === key ? result.data : undefined;
}
