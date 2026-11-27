import { router } from 'expo-router';
import { View } from 'react-native';

import { useUser } from '@/components/auth';
import { AccountBar, ClassRow, IconTile } from '@/components/classes';
import { art, PixelArt } from '@/components/pixel';
import { BrandHeader, Button, Card, Eyebrow, Hint, Pixel, Screen, T } from '@/components/ui';
import { useLiveQuery } from '@/db/live';
import { getOpenClass, quizSets, studentClasses } from '@/db/queries';
import { colors } from '@/theme';

export default function StudentClasses() {
  const user = useUser();
  const data = useLiveQuery(`student-classes:${user.id}`, async (db) => {
    const mine = await studentClasses(db, user.id);
    const open = await getOpenClass(db);
    const openSets = open ? await quizSets(db, open.id) : [];
    return { mine, open, openSets };
  });

  const mine = data?.mine ?? [];
  const open = data?.open;
  const showOpen = data !== undefined && mine.length === 0 && open;

  return (
    <Screen>
      <BrandHeader />
      <AccountBar />

      <Pixel size={14}>MY CLASSES</Pixel>

      {data === undefined ? null : mine.length === 0 ? (
        <Card style={{ gap: 6 }}>
          <T size={18} weight="bold">
            You have not joined a class yet
          </T>
          <T size={14} color={colors.soft}>
            Ask your teacher for the 6 character class code, or try the open class below.
          </T>
        </Card>
      ) : (
        mine.map((c) => (
          <ClassRow
            key={c.id}
            title={c.name}
            meta={`${c.subject} · ${c.section} · ${c.teacher_name}`}
            accent={c.is_open ? colors.green : colors.border}
            left={<IconTile icon={c.icon} />}
            label={`Open ${c.name}`}
            onPress={() => router.push({ pathname: '/student/class/[id]', params: { id: String(c.id) } })}
            footer={
              <T size={13} color={colors.muted}>
                Playing as{' '}
                <T size={13} weight="bold" color={colors.yellow}>
                  {c.nickname}
                </T>
              </T>
            }
          />
        ))
      )}

      <Button label="Join a class" onPress={() => router.push('/student/join')} />

      {showOpen && (
        <Card borderColor={colors.green} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <PixelArt rows={[...art.snake.rows]} palette={art.snake.palette} size={4} />
            <View style={{ flex: 1, gap: 2 }}>
              <Eyebrow color={colors.green}>Open class · no code needed</Eyebrow>
              <T size={18} weight="bold">
                {open.name}
              </T>
            </View>
          </View>
          <T size={14} color={colors.soft}>
            {data.openSets.length} ready-made quiz sets:{' '}
            {data.openSets.map((s) => s.title).join(', ')}. Play the quiz games any time.
          </T>
          <Button
            label="Join for fun"
            variant="outline"
            onPress={() => router.push({ pathname: '/student/join', params: { classId: String(open.id) } })}
          />
        </Card>
      )}

      <Hint>Join once per class. Every quiz and game your teacher adds to that class shows up inside it.</Hint>
    </Screen>
  );
}
