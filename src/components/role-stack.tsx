import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/components/auth';
import type { Role } from '@/db/queries';
import { stackOptions } from '@/theme';

/** Stack navigator that only renders for a logged-in user with this role. Everyone else goes to the landing page. */
export function RoleStack({ role }: { role: Role }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (!user || user.role !== role) return <Redirect href="/" />;
  return <Stack screenOptions={stackOptions} />;
}
