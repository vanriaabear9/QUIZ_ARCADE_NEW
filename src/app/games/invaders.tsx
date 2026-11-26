import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { art, PixelArt } from '@/components/pixel';
import { useAnswers } from '@/components/use-answers';
import { Button, Feedback, Hint, MiniStat, QuestionCard, Row, Screen, T, TopBar } from '@/components/ui';
import { questions } from '@/data/mock';
import { colors, radius } from '@/theme';

const q = questions.invaders;
const stars = [
  [8, 6], [82, 4], [62, 22], [16, 48], [88, 40], [40, 60], [70, 70], [10, 80],
];

export default function InvadersQuiz() {
  const { used, score, last, pick } = useAnswers(q.options);
  const [lives, setLives] = useState(2);

  return (
    <Screen>
      <TopBar
        title="SPACE INVADERS QUIZ"
        color={colors.purple}
        backLabel="Back to arcade"
        right={
          <Row>
            <MiniStat label="Wave" value={2} color={colors.cyan} />
            <MiniStat label="Score" value={score} />
          </Row>
        }
      />
      <QuestionCard eyebrow={`Question ${q.n} of 10`} text={q.text} />

      <View
        style={{
          height: 420,
          borderWidth: 2,
          borderColor: colors.purple,
          borderRadius: radius.lg,
          backgroundColor: '#05060F',
          overflow: 'hidden',
          padding: 16,
          justifyContent: 'space-between',
        }}>
        {stars.map(([x, y], i) => (
          <View
            key={i}
            style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 2, height: 2, backgroundColor: colors.muted }}
          />
        ))}

        {/* aliens carrying answers */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', rowGap: 18 }}>
          {q.options.map((o) => {
            const hit = used.has(o.id);
            return (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityLabel={`Shoot alien ${o.label}`}
                disabled={hit}
                onPress={() => {
                  if (!pick(o)) setLives((l) => Math.max(0, l - 1));
                }}
                style={{ alignItems: 'center', gap: 6, width: '45%', opacity: hit ? (o.ok ? 0 : 0.35) : 1 }}>
                <PixelArt rows={[...art.alien.rows]} palette={{ P: hit ? colors.dim : colors.purple }} size={4} />
                <View style={{ paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.card }}>
                  <T weight="bold">{o.label}</T>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Feedback text={last?.text ?? null} ok={last?.ok ?? null} />

        {/* shields + ship */}
        <View style={{ gap: 18, alignItems: 'center' }}>
          <Row style={{ justifyContent: 'space-around', alignSelf: 'stretch' }}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ width: 64, height: 20, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: '#3BB067' }} />
            ))}
          </Row>
          <PixelArt rows={[...art.ship.rows]} palette={art.ship.palette} size={6} />
        </View>
      </View>

      <Hint>Move by dragging the ship. Tap an alien in this prototype to shoot it.</Hint>
      <Row style={{ justifyContent: 'space-between' }}>
        <T>Shields 3 · Lives {lives}</T>
        <Button
          label="Finish wave"
          onPress={() => router.push({ pathname: '/results', params: { game: 'Space Invaders Quiz', score: String(score) } })}
        />
      </Row>
    </Screen>
  );
}
