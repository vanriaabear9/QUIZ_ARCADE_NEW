import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { setLobbyClass } from '@/components/active-class';
import { useUser } from '@/components/auth';
import { iconByName } from '@/components/classes';
import { LeaderboardRows } from '@/components/leaderboard';
import { art, PixelArt, PlayerIcon } from '@/components/pixel';
import { Button, Card, Chip, Eyebrow, LinkText, Pixel, Row, Screen, T } from '@/components/ui';
import { games, type GameId } from '@/data/mock';
import { useLiveQuery } from '@/db/live';
import { getClass, getLiveGame, getMembership, leaderboard, quizSets } from '@/db/queries';
import { colors, radius } from '@/theme';

const gameArt: Record<GameId, { rows: readonly string[]; palette: Record<string, string>; size: number }> = {
  snake: { ...art.snake, size: 7 },
  invaders: { ...art.invader, size: 6 },
  mole: { ...art.mole, size: 7 },
  flappy: { ...art.bird, size: 7 },
  tetris: { ...art.tetris, size: 7 },
};

const gameTitle = (id: string) => games.find((g) => g.id === id)?.title ?? 'Student choice';

/** Arcade lobby for one class: its quiz sets, the games and the class top 5. */
export default function Lobby() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = Number(id);
  const user = useUser();
  const [setId, setSetId] = useState<number | null>(null);
  const { width } = useWindowDimensions();
  const cardW = (width - 16 * 2 - 12) / 2;

  useFocusEffect(
    useCallback(() => {
      setLobbyClass(classId);
    }, [classId]),
  );

  const data = useLiveQuery(`lobby:${classId}:${user.id}`, async (db) => {
    const [cls, me, sets, live, top] = await Promise.all([
      getClass(db, classId),
      getMembership(db, classId, user.id),
      quizSets(db, classId),
      getLiveGame(db, classId),
      leaderboard(db, classId, { limit: 5 }),
    ]);
    return { cls, me, sets, live, top };
  });

  if (!data) return null;
  const { cls, me, sets, live, top } = data;

  if (!cls || !me) {
    return (
      <Screen>
        <LinkText label="‹ My classes" onPress={() => router.replace('/student')} />
        <Card style={{ gap: 10 }}>
          <T size={18} weight="bold">
            You are not in this class
          </T>
          <T color={colors.soft}>It may have been removed, or your teacher took you off the list.</T>
          <Button label="Back to my classes" onPress={() => router.replace('/student')} />
        </Card>
      </Screen>
    );
  }

  const quizSet = sets.find((s) => s.id === setId) ?? sets[0];
  const liveSet = live ? sets.find((s) => s.id === live.quiz_set_id) : undefined;
  const gameHref = (game: string, set?: number | null) => (`/games/${game}${set ? `?set=${set}` : ''}` as Href);
  const liveRoute = live ? gameHref(live.game === 'choice' ? games[0].id : live.game, live.quiz_set_id) : null;
  const ic = iconByName(me.icon);

  return (
    <Screen>
      <Row>
        <LinkText label="‹ My classes" onPress={() => (router.canGoBack() ? router.back() : router.replace('/student'))} />
      </Row>

      {/* Header */}
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={10}>
          <PixelArt rows={[...art.logo.rows]} palette={art.logo.palette} size={3} />
          <Pixel size={16}>QUIZ ARCADE</Pixel>
        </Row>
        <View style={[pill, { paddingVertical: 4, paddingLeft: 4 }]}>
          <View style={avatar} accessibilityLabel={`Your icon: ${ic.name}`}>
            <PlayerIcon pat={ic.pat} color={ic.color} size={5} />
          </View>
        </View>
      </Row>

      <Row>
        <View style={[pill, { flex: 1 }]}>
          <T>
            Coins{' '}
            <T weight="bold" color={colors.yellow}>
              [0]
            </T>
          </T>
        </View>
        <View style={[pill, { flex: 1 }]}>
          <T>
            Level{' '}
            <T weight="bold" color={colors.cyan}>
              [1]
            </T>
          </T>
        </View>
        <View style={[pill, { flex: 2 }]}>
          <T numberOfLines={1}>{me.nickname}</T>
        </View>
      </Row>

      {/* Class */}
      <Card style={{ gap: 4 }} borderColor={cls.is_open ? colors.green : colors.border}>
        <Eyebrow color={cls.is_open ? colors.green : colors.muted}>{cls.is_open ? 'Open class' : 'Class'}</Eyebrow>
        <T size={18} weight="bold">
          {cls.name}
        </T>
        <T size={13} color={colors.soft}>
          {cls.subject} · {cls.section} · {cls.teacher_name}
        </T>
      </Card>

      {/* Live game started by the teacher */}
      {live && liveRoute && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Play live game ${gameTitle(live.game)}`}
          onPress={() => router.push(liveRoute)}>
          <Card borderColor={colors.cyan} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Pixel size={11} color={colors.cyan}>
                LIVE NOW
              </Pixel>
              <T size={14} color={colors.soft}>
                {cls.teacher_name} started {gameTitle(live.game)}
                {liveSet ? ` · ${liveSet.title}` : ''}. Tap to play.
              </T>
            </View>
            <T size={22} color={colors.cyan}>
              ›
            </T>
          </Card>
        </Pressable>
      )}

      {/* Current quiz set */}
      <Card style={{ gap: 8 }}>
        <Eyebrow>Current quiz set</Eyebrow>
        {quizSet ? (
          <>
            <T size={24} weight="bold">
              {quizSet.title}
            </T>
            <T size={14} color={colors.soft}>
              {quizSet.question_count} questions · set by {cls.teacher_name} · every game uses this set
            </T>
          </>
        ) : (
          <T size={14} color={colors.soft}>
            {cls.teacher_name} has not added a quiz set yet. You can still try the games with sample questions.
          </T>
        )}
        {sets.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
            {sets.map((s) => (
              <Chip key={s.id} label={s.title} selected={s.id === quizSet?.id} onPress={() => setSetId(s.id)} />
            ))}
          </ScrollView>
        )}
      </Card>

      {/* Games */}
      <Pixel size={12} color={colors.cyan}>
        PICK A GAME
      </Pixel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {games.map((g) => {
          const a = gameArt[g.id];
          return (
            <Pressable
              key={g.id}
              accessibilityRole="button"
              accessibilityLabel={`Play ${g.title}`}
              onPress={() => router.push(gameHref(g.id, quizSet?.id))}
              style={({ pressed }) => [gameCard, { width: cardW, opacity: pressed ? 0.85 : 1 }]}>
              <View style={artBox}>
                <PixelArt rows={[...a.rows]} palette={a.palette} size={a.size} />
              </View>
              <T size={16} weight="bold">
                {g.title}
              </T>
              <T size={13} color={colors.soft} style={{ flex: 1 }}>
                {g.blurb}
              </T>
              <T size={13} weight="bold" color={colors.yellow}>
                PLAY ›
              </T>
            </Pressable>
          );
        })}
      </View>

      {/* Leaderboard */}
      <Card style={{ gap: 10 }}>
        <Pixel size={12}>CLASS TOP 5</Pixel>
        <T size={13} color={colors.muted}>
          {cls.is_open ? cls.name : cls.section} · best run this week
        </T>
        <LeaderboardRows rows={top} meId={user.id} />
        {top.length > 0 && (
          <LinkText
            label="See full leaderboard"
            onPress={() => router.push({ pathname: '/results', params: { classId: String(cls.id) } })}
          />
        )}
      </Card>
    </Screen>
  );
}

const pill = {
  backgroundColor: colors.card,
  borderWidth: 2,
  borderColor: colors.border,
  borderRadius: radius.md,
  paddingVertical: 10,
  paddingHorizontal: 12,
  alignItems: 'center' as const,
};

const avatar = {
  width: 34,
  height: 34,
  borderRadius: radius.sm,
  backgroundColor: colors.deep,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const gameCard = {
  backgroundColor: colors.card,
  borderWidth: 2,
  borderColor: colors.border,
  borderRadius: radius.lg,
  padding: 12,
  gap: 8,
};

const artBox = {
  height: 96,
  backgroundColor: colors.deep,
  borderRadius: radius.md,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
