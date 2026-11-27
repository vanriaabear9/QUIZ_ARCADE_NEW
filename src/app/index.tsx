import { Redirect, router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useAuth } from '@/components/auth';
import { art, PixelArt, PlayerIcon } from '@/components/pixel';
import { Pixel, Screen, T } from '@/components/ui';
import { playerIcons } from '@/data/mock';
import type { Role } from '@/db/queries';
import { colors, radius } from '@/theme';

const choices: { role: Role; title: string; blurb: string; accent: string; icon: string }[] = [
  { role: 'student', title: "I'M A STUDENT", blurb: 'Join your class and play quiz games.', accent: colors.cyan, icon: 'Alien' },
  { role: 'teacher', title: "I'M A TEACHER", blurb: 'Create classes, add quiz sets and host games.', accent: colors.purple, icon: 'Robot' },
];

export default function Landing() {
  const { user } = useAuth();
  if (user === undefined) return null;
  if (user) return <Redirect href={user.role === 'teacher' ? '/teacher' : '/student'} />;

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 14, paddingTop: 40, paddingBottom: 12 }}>
        <PixelArt rows={[...art.logo.rows]} palette={art.logo.palette} size={9} />
        <Pixel size={24} style={{ textAlign: 'center' }}>
          QUIZ ARCADE
        </Pixel>
        <T color={colors.soft} style={{ textAlign: 'center' }}>
          Answer your class quiz inside retro mini games.
        </T>
      </View>

      {choices.map((c) => {
        const ic = playerIcons.find((i) => i.name === c.icon)!;
        return (
          <Pressable
            key={c.role}
            accessibilityRole="button"
            accessibilityLabel={c.title}
            onPress={() => router.push({ pathname: '/login', params: { role: c.role } })}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 18,
              borderRadius: radius.xl,
              borderWidth: 2,
              borderColor: c.accent,
              backgroundColor: colors.card,
              opacity: pressed ? 0.85 : 1,
            })}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: radius.md,
                backgroundColor: colors.deep,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <PlayerIcon pat={ic.pat} color={c.accent} size={8} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Pixel size={12} color={c.accent}>
                {c.title}
              </Pixel>
              <T size={14} color={colors.soft}>
                {c.blurb}
              </T>
            </View>
            <T size={24} color={c.accent}>
              ›
            </T>
          </Pressable>
        );
      })}
    </Screen>
  );
}
