import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import * as q from '@/db/queries';
import type { Role, User } from '@/db/queries';

type Auth = {
  /** undefined while the saved session loads, null when logged out. */
  user: User | null | undefined;
  logIn: (f: { role: Role; username: string; password: string }) => ReturnType<typeof q.logIn>;
  signUp: (f: Parameters<typeof q.signUp>[1]) => ReturnType<typeof q.signUp>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    q.getSessionUser(db).then(setUser, () => setUser(null));
  }, [db]);

  const value: Auth = {
    user,
    async logIn(f) {
      const r = await q.logIn(db, f);
      if (r.ok) setUser(r.user);
      return r;
    },
    async signUp(f) {
      const r = await q.signUp(db, f);
      if (r.ok) setUser(r.user);
      return r;
    },
    async logOut() {
      await q.logOut(db);
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const a = useContext(AuthContext);
  if (!a) throw new Error('useAuth must be used inside <AuthProvider>');
  return a;
}

/** The logged-in user, for screens behind a role guard (the guard guarantees it is set). */
export function useUser() {
  const { user } = useAuth();
  if (!user) throw new Error('useUser needs a logged-in user');
  return user;
}
