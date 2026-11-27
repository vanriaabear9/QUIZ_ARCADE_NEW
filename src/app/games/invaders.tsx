import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { art, PixelArt } from '@/components/pixel';
import { NextQuestion, useQuiz } from '@/components/use-quiz';
import { Button, Feedback, Hint, MiniStat, QuestionCard, Row, Screen, T, TopBar } from '@/components/ui';
import { colors, radius } from '@/theme';

const stars = [
  [8, 6], [82, 4], [62, 22], [16, 48], [88, 40], [40, 60], [70, 70], [10, 80],
];

export default function InvadersQuiz() {
  const quiz = useQuiz();
  const { options, used, answered, score, last, pick } = quiz;
  const [lives, setLives] = useState(3);

  if (!quiz.ready) return null;

  return (
    <Screen>
      <TopBar
        title="SPACE INVADERS QUIZ"
        color={colors.purple}
        backLabel="Back to arcade"
        right={
          <Row>
            <MiniStat label="Wave" value={quiz.n} color={colors.cyan} />
            <MiniStat label="Score" value={score} />
          </Row>
        }
      />
      <QuestionCard eyebrow={`${quiz.title} · Question ${quiz.n} of ${quiz.total}`} text={quiz.question.text} />

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
          {options.map((o) => {
            const hit = used.has(o.id);
            const out = answered && !hit;
            return (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityLabel={`Shoot alien ${o.label}`}
                disabled={answered}
                onPress={() => {
                  if (!pick(o)) setLives((l) => Math.max(0, l - 1));
                }}
                style={{ alignItems: 'center', gap: 6, width: '45%', opacity: hit ? (o.ok ? 0 : 0.35) : out && !o.ok ? 0.5 : 1 }}>
                <PixelArt rows={[...art.alien.rows]} palette={{ P: hit || (out && !o.ok) ? colors.dim : out ? colors.green : colors.purple }} size={4} />
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

      <NextQuestion quiz={quiz} game="Space Invaders Quiz" />
      <Hint>Move by dragging the ship. Tap an alien in this prototype to shoot it.</Hint>
      <Row style={{ justifyContent: 'space-between' }}>
        <T>Shields 3 · Lives {lives}</T>
        <Button label="End run" variant="secondary" onPress={() => quiz.showResults('Space Invaders Quiz')} />
      </Row>
    </Screen>
  );
}
