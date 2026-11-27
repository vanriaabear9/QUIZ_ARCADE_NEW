import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useAuth } from '@/components/auth';
import { PlayerIcon } from '@/components/pixel';
import { Button, Row, T } from '@/components/ui';
import { playerIcons } from '@/data/mock';
import { colors, radius } from '@/theme';

export function iconByName(name: string | null | undefined) {
  return playerIcons.find((i) => i.name === name) ?? playerIcons[0];
}

/** Signed-in name plus a Log out button, for the top of each role's home screen. */
export function AccountBar() {
  const { user, logOut } = useAuth();
  if (!user) return null;
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <T size={13} color={colors.muted}>
          {user.role === 'teacher' ? 'Teacher' : 'Student'} · @{user.username}
        </T>
        <T weight="bold" numberOfLines={1}>
          {user.full_name}
        </T>
      </View>
      <Button
        label="Log out"
        variant="secondary"
        style={{ minHeight: 40 }}
        onPress={async () => {
          await logOut();
          router.replace('/');
        }}
      />
    </Row>
  );
}

/** A tappable class row: title, meta line and whatever goes on the right. */
export function ClassRow({
  title,
  meta,
  accent = colors.border,
  left,
  right,
  footer,
  onPress,
  label,
}: {
  title: string;
  meta: string;
  accent?: string;
  left?: ReactNode;
  right?: ReactNode;
  footer?: ReactNode;
  onPress?: () => void;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: accent,
        borderRadius: radius.xl,
        padding: 16,
        gap: 12,
        opacity: pressed ? 0.85 : 1,
      })}>
      <Row>
        {left}
        <View style={{ flex: 1, gap: 2 }}>
          <T size={17} weight="bold" numberOfLines={1}>
            {title}
          </T>
          <T size={13} color={colors.soft}>
            {meta}
          </T>
        </View>
        {right ?? (
          <T size={22} color={colors.muted}>
            ›
          </T>
        )}
      </Row>
      {footer}
    </Pressable>
  );
}

export function IconTile({ icon, size = 5 }: { icon: string; size?: number }) {
  const ic = iconByName(icon);
  return (
    <View
      style={{
        width: size * 9,
        height: size * 9,
        borderRadius: radius.md,
        backgroundColor: colors.deep,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <PlayerIcon pat={ic.pat} color={ic.color} size={size} />
    </View>
  );
}
