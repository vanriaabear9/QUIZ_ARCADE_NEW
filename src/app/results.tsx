import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Chip, Pixel, Row, Screen, StatCard, T, Well } from '@/components/ui';
import { leaderboard, mistakes, quizSet } from '@/data/mock';
import { colors } from '@/theme';

export default function Results() {
  const { game = 'Snake Quiz', score } = useLocalSearchParams<{ game?: string; score?: string }>();
  const [tab, setTab] = useState('This game');

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 6, paddingTop: 8 }}>
        <Pixel size={24}>GAME OVER</Pixel>
        <T color={colors.soft}>
          {game} · {quizSet.title}
        </T>
      </View>

      <Row style={{ alignItems: 'stretch' }}>
        <StatCard label="Final score" value={score ?? '[score]'} />
        <StatCard label="Accuracy" value="[x / 10]" color={colors.green} />
      </Row>
      <Row style={{ alignItems: 'stretch' }}>
        <StatCard label="Best streak" value="[x]" color={colors.cyan} />
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
        <Row gap={8}>
          {['This game', 'All games'].map((t) => (
            <Chip key={t} label={t} selected={t === tab} onPress={() => setTab(t)} accent={colors.cyan} />
          ))}
        </Row>
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
      </Card>

      <Row>
        <Button label="Play again" style={{ flex: 1 }} onPress={() => router.back()} />
        <Button label="Back to arcade" variant="secondary" style={{ flex: 1 }} onPress={() => router.dismissTo('/')} />
      </Row>
    </Screen>
  );
}
