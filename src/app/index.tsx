import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { art, PixelArt } from '@/components/pixel';
import { Card, Chip, Eyebrow, LinkText, Pixel, Row, Screen, T, Well } from '@/components/ui';
import { games, leaderboard, quizSet, subjects, type GameId } from '@/data/mock';
import { colors, radius } from '@/theme';

const gameArt: Record<GameId, { rows: readonly string[]; palette: Record<string, string>; size: number }> = {
  snake: { ...art.snake, size: 7 },
  invaders: { ...art.invader, size: 6 },
  mole: { ...art.mole, size: 7 },
  flappy: { ...art.bird, size: 7 },
  tetris: { ...art.tetris, size: 7 },
};

export default function Lobby() {
  const [subject, setSubject] = useState('Logic');
  const { width } = useWindowDimensions();
  const cardW = (width - 16 * 2 - 12) / 2;

  return (
    <Screen>
      {/* Header */}
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={10}>
          <PixelArt rows={[...art.logo.rows]} palette={art.logo.palette} size={3} />
          <Pixel size={16}>QUIZ ARCADE</Pixel>
        </Row>
        <View style={[pill, { paddingVertical: 4, paddingLeft: 4 }]}>
          <View style={avatar}>
            <T weight="bold" color={colors.bg}>
              P
            </T>
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
          <T numberOfLines={1}>[Student name]</T>
        </View>
      </Row>

      {/* Current quiz set */}
      <Card style={{ gap: 8 }}>
        <Eyebrow>Current quiz set</Eyebrow>
        <T size={24} weight="bold">
          {quizSet.title}
        </T>
        <T size={14} color={colors.soft}>
          {quizSet.questionCount} questions · set by {quizSet.teacher} · every game uses this set
        </T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
          {subjects.map((s) => (
            <Chip key={s} label={s} selected={s === subject} onPress={() => setSubject(s)} />
          ))}
        </ScrollView>
      </Card>

      {/* Join a live game */}
      <Pressable onPress={() => router.push('/join')}>
        <Card borderColor={colors.cyan} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Pixel size={11} color={colors.cyan}>
              JOIN CLASS GAME
            </Pixel>
            <T size={14} color={colors.soft}>
              Got a 6 character code from your teacher? Tap here.
            </T>
          </View>
          <T size={22} color={colors.cyan}>
            ›
          </T>
        </Card>
      </Pressable>

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
              onPress={() => router.push(`/games/${g.id}` as Href)}
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
          BSCPE section · this week
        </T>
        {leaderboard.map((r) => (
          <Well key={r.rank} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
            <Pixel size={11} color={colors.cyan}>
              {r.rank}
            </Pixel>
            <T style={{ flex: 1 }}>{r.name}</T>
            <T weight="bold" color={colors.yellow}>
              {r.score}
            </T>
          </Well>
        ))}
        <LinkText label="See full leaderboard" onPress={() => router.push('/results')} />
      </Card>

      <Row style={{ justifyContent: 'center', paddingTop: 8 }}>
        <LinkText label="I'm a teacher ›" color={colors.muted} onPress={() => router.push('/teacher')} />
      </Row>
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
  backgroundColor: colors.cyan,
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
