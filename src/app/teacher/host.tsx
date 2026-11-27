import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useUser } from '@/components/auth';
import { iconByName } from '@/components/classes';
import { PlayerIcon } from '@/components/pixel';
import { Button, Card, Chip, CodeTiles, Eyebrow, Pixel, Row, Screen, T, Toggle, TopBar } from '@/components/ui';
import { hostGames } from '@/data/mock';
import { useLiveQuery } from '@/db/live';
import { classMembers, endLiveGame, getLiveGame, quizSets, startLiveGame, teacherClasses } from '@/db/queries';
import { colors, radius } from '@/theme';

const gameIds: Record<string, string> = {
  Snake: 'snake',
  Invaders: 'invaders',
  'Whack a Mole': 'mole',
  Flappy: 'flappy',
  Tetris: 'tetris',
  'Student choice': 'choice',
};
const gameLabel = (id: string) => Object.keys(gameIds).find((k) => gameIds[k] === id) ?? id;

export default function HostGame() {
  const db = useSQLiteContext();
  const user = useUser();
  const params = useLocalSearchParams<{ classId?: string }>();
  const [picked, setPicked] = useState<number | null>(params.classId ? Number(params.classId) : null);
  const [setId, setSetId] = useState<number | null>(null);
  const [game, setGame] = useState('Snake');
  const [unique, setUnique] = useState(true);
  const [filter, setFilter] = useState(true);

  const classes = useLiveQuery(`teacher-classes:${user.id}`, (d) => teacherClasses(d, user.id));
  const cls = classes?.find((c) => c.id === picked) ?? classes?.[0];

  const detail = useLiveQuery(`host:${cls?.id ?? 0}`, async (d) => {
    if (!cls) return { sets: [], members: [], live: null };
    const [sets, members, live] = await Promise.all([quizSets(d, cls.id), classMembers(d, cls.id), getLiveGame(d, cls.id)]);
    return { sets, members, live };
  });

  const sets = detail?.sets ?? [];
  const members = detail?.members ?? [];
  const live = detail?.live ?? null;
  const set = sets.find((s) => s.id === setId) ?? sets[0];

  return (
    <Screen>
      <TopBar
        title="HOST A GAME"
        color={colors.yellow}
        backLabel="Back"
        right={
          <T size={13} color={colors.muted}>
            {user.full_name}
          </T>
        }
      />

      {classes?.length === 0 && (
        <Card>
          <T color={colors.soft}>Create a class first. Then you can start games for everyone in it.</T>
        </Card>
      )}

      {cls && (
        <>
          {/* Class pick */}
          <Card style={{ gap: 12 }}>
            <T size={20} weight="bold">
              Pick a class
            </T>
            <View style={{ gap: 8 }}>
              {classes!.map((c) => {
                const on = c.id === cls.id;
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => {
                      setPicked(c.id);
                      setSetId(null);
                    }}
                    style={{
                      padding: 14,
                      borderRadius: radius.md,
                      borderWidth: 2,
                      borderColor: on ? colors.yellow : colors.border,
                      backgroundColor: colors.bg,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    <View style={{ flex: 1 }}>
                      <T weight={on ? 'bold' : 'regular'}>{c.name}</T>
                      <T size={13} color={colors.soft}>
                        {c.section} · {c.student_count} students
                      </T>
                    </View>
                    <CodeTiles code={c.code} size="sm" />
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Setup */}
          <Card style={{ gap: 12 }}>
            <T size={20} weight="bold">
              Game setup
            </T>
            <Label>Quiz set</Label>
            {sets.length === 0 ? (
              <T size={14} color={colors.muted}>
                This class has no quiz sets yet. Add one on the class page.
              </T>
            ) : (
              <View style={{ gap: 8 }}>
                {sets.map((s) => (
                  <Pressable
                    key={s.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: s.id === set?.id }}
                    onPress={() => setSetId(s.id)}
                    style={{
                      padding: 14,
                      borderRadius: radius.md,
                      borderWidth: 2,
                      borderColor: s.id === set?.id ? colors.yellow : colors.border,
                      backgroundColor: colors.bg,
                    }}>
                    <T weight={s.id === set?.id ? 'bold' : 'regular'}>
                      {s.title} ({s.question_count} questions)
                    </T>
                  </Pressable>
                ))}
              </View>
            )}

            <Label>Game</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {hostGames.map((g) => (
                <Chip key={g} label={g} selected={g === game} onPress={() => setGame(g)} accent={colors.cyan} />
              ))}
            </View>

            <Toggle label="Unique nicknames and icons only" value={unique} onChange={setUnique} />
            <Toggle label="Filter bad words in nicknames" value={filter} onChange={setFilter} />
          </Card>

          {/* Players */}
          <Card style={{ gap: 12 }} borderColor={live ? colors.cyan : colors.border}>
            {live && (
              <View style={{ gap: 4 }}>
                <Pixel size={12} color={colors.cyan}>
                  LIVE NOW
                </Pixel>
                <T size={14} color={colors.soft}>
                  {gameLabel(live.game)} is open on every student&apos;s lobby in {cls.name}.
                </T>
              </View>
            )}
            <Row style={{ justifyContent: 'space-between' }}>
              <T size={18} weight="bold">
                Players in class
              </T>
              <T weight="bold" color={colors.green}>
                {members.length} joined
              </T>
            </Row>
            {members.length === 0 ? (
              <T size={14} color={colors.muted}>
                No students yet. Share code {cls.code} so they can join.
              </T>
            ) : (
              members.map((m) => {
                const ic = iconByName(m.icon);
                return (
                  <Row key={m.student_id} style={{ backgroundColor: colors.bg, borderRadius: radius.md, padding: 10 }}>
                    <PlayerIcon pat={ic.pat} color={ic.color} size={4} />
                    <T style={{ flex: 1 }}>{m.nickname}</T>
                  </Row>
                );
              })
            )}
            <Eyebrow>{live ? 'Switch game or end it' : 'Ready when you are'}</Eyebrow>
            <Button
              label={live ? `Restart with ${game}` : 'Start game for everyone'}
              onPress={() => startLiveGame(db, cls.id, gameIds[game], set?.id ?? null)}
            />
            {live && <Button label="End game" variant="secondary" onPress={() => endLiveGame(db, cls.id)} />}
          </Card>
        </>
      )}
    </Screen>
  );
}

function Label({ children }: { children: string }) {
  return (
    <T size={13} color={colors.soft}>
      {children}
    </T>
  );
}
