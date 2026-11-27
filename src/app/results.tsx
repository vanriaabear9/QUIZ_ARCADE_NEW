import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { getLobbyClass } from '@/components/active-class';
import { useAuth } from '@/components/auth';
import { LeaderboardRows } from '@/components/leaderboard';
import { Button, Card, Chip, Pixel, Row, Screen, StatCard, T, Well } from '@/components/ui';
import { mistakes, quizSet } from '@/data/mock';
import { useLiveQuery } from '@/db/live';
import { getClass, leaderboard } from '@/db/queries';
import { colors } from '@/theme';

export default function Results() {
  const { game = 'Snake Quiz', score, correct, total, streak, set, classId } = useLocalSearchParams<{
    game?: string;
    score?: string;
    correct?: string;
    total?: string;
    streak?: string;
    set?: string;
    classId?: string;
  }>();
  // Opened from a lobby's "See full leaderboard" (no score yet): start on All games.
  const [tab, setTab] = useState(score === undefined ? 'All games' : 'This game');
  const { user } = useAuth();
  // The class comes from the quiz set the game was played with, else the last lobby opened.
  const cid = Number(classId) || getLobbyClass() || 0;
  const board = useLiveQuery(`results-board:${cid}:${tab}:${game}`, async (db) => {
    if (!cid) return null;
    const [cls, rows] = await Promise.all([
      getClass(db, cid),
      leaderboard(db, cid, { game: tab === 'This game' ? game : undefined, limit: 10 }),
    ]);
    return { cls, rows };
  });

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 6, paddingTop: 8 }}>
        <Pixel size={24}>GAME OVER</Pixel>
        <T color={colors.soft}>
          {game} · {set ?? quizSet.title}
        </T>
      </View>

      <Row style={{ alignItems: 'stretch' }}>
        <StatCard label="Final score" value={score ?? '[score]'} />
        <StatCard label="Accuracy" value={correct && total ? `${correct} / ${total}` : '[x / 10]'} color={colors.green} />
      </Row>
      <Row style={{ alignItems: 'stretch' }}>
        <StatCard label="Best streak" value={streak ?? '[x]'} color={colors.cyan} />
        <StatCard label="Coins earned" value="[+x]" color={colors.orange} />
      </Row>

      <Card style={{ gap: 12 }}>
        <T size={18} weight="bold">
          Review your mistakes
        </T>
        {mistakes.map((m) => (
          <Well key={m.q} style={{ gap: 4 }}>
            <T weight="bold">{m.q}</T>
            <T size={14} color={colors.red}>
              Your answer: {m.yours}
            </T>
            <T size={14} color={colors.green}>
              Correct: {m.correct}
            </T>
            <T size={14} color={colors.soft}>
              {m.why}
            </T>
          </Well>
        ))}
      </Card>

      <Card style={{ gap: 12 }}>
        <T size={18} weight="bold">
          Class leaderboard
        </T>
        {board?.cls && (
          <T size={13} color={colors.muted} style={{ marginTop: -6 }}>
            {board.cls.name} · best run this week
          </T>
        )}
        <Row gap={8}>
          {['This game', 'All games'].map((t) => (
            <Chip key={t} label={t} selected={t === tab} onPress={() => setTab(t)} accent={colors.cyan} />
          ))}
        </Row>
        {board === null ? (
          <T size={14} color={colors.muted}>
            Play from a class lobby to see your class leaderboard.
          </T>
        ) : (
          <LeaderboardRows
            rows={board?.rows}
            meId={user?.id}
            empty={tab === 'This game' ? `No ${game} scores this week yet.` : undefined}
          />
        )}
      </Card>

      <Row>
        <Button label="Play again" style={{ flex: 1 }} onPress={() => router.back()} />
        <Button label="Back to arcade" variant="secondary" style={{ flex: 1 }} onPress={backToArcade} />
      </Row>
    </Screen>
  );
}

function backToArcade() {
  const id = getLobbyClass();
  if (id === null) router.dismissTo('/');
  else router.dismissTo({ pathname: '/student/class/[id]', params: { id: String(id) } });
}
