import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { art, PixelArt } from '@/components/pixel';
import { useAnswers } from '@/components/use-answers';
import { Button, Feedback, Hint, MiniStat, QuestionCard, Row, Screen, T, TopBar } from '@/components/ui';
import { questions } from '@/data/mock';
import { colors, radius } from '@/theme';

const q = questions.flappy;
// Stepped bands fake the sky gradient from the design, and fit the pixel look.
const sky = ['#28388A', '#2F449A', '#3A52A8', '#4561B6', '#5070C3', '#5B7ECF'];
const HEIGHT = 440;
const GROUND = 64;

export default function FlappyQuiz() {
  const { used, score, last, pick, reset } = useAnswers(q.options);
  const [pipes, setPipes] = useState(2);
  const [birdY, setBirdY] = useState(150);

  const gapH = (HEIGHT - GROUND - 4 * 22) / 3;

  return (
    <Screen>
      <TopBar
        title="FLAPPY QUIZ"
        color={colors.cyan}
        backLabel="Back to arcade"
        right={
          <Row>
            <MiniStat label="Pipes" value={pipes} color={colors.cyan} />
            <MiniStat label="Score" value={score} />
          </Row>
        }
      />
      <QuestionCard eyebrow={`Question ${q.n} of 10`} text={q.text} />

      <Pressable
        accessibilityLabel="Flap"
        onPress={() => setBirdY((y) => Math.max(10, y - 40))}
        style={{ height: HEIGHT, borderWidth: 2, borderColor: colors.cyan, borderRadius: radius.lg, overflow: 'hidden' }}>
        {sky.map((c, i) => (
          <View key={c} style={{ position: 'absolute', left: 0, right: 0, top: (i * (HEIGHT - GROUND)) / sky.length, height: (HEIGHT - GROUND) / sky.length + 1, backgroundColor: c }} />
        ))}
        <View style={[cloud, { left: 30, top: 40 }]} />
        <View style={[cloud, { right: 120, top: 90, width: 60 }]} />

        {/* bird */}
        <View style={{ position: 'absolute', left: 28, top: birdY, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <PixelArt rows={[...art.bird.rows]} palette={art.bird.palette} size={5} />
          {!last && (
            <View style={{ backgroundColor: colors.white, borderRadius: 6, paddingHorizontal: 6 }}>
              <T size={12} weight="bold" color={colors.bg}>
                tap to flap
              </T>
            </View>
          )}
        </View>

        {/* pipe with 3 answer gaps */}
        <View style={{ position: 'absolute', right: 24, top: 0, width: 84, height: HEIGHT - GROUND }}>
          {q.options.map((o, i) => {
            const top = 22 + i * (gapH + 22);
            const picked = used.has(o.id);
            return (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                accessibilityLabel={`Fly through gap ${o.label}`}
                onPress={() => {
                  if (used.has(o.id)) return;
                  if (pick(o)) setPipes((p) => p + 1);
                }}
                style={{
                  position: 'absolute',
                  top,
                  left: 0,
                  right: 0,
                  height: gapH,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: picked ? (o.ok ? colors.green : colors.red) : 'rgba(255,255,255,0.35)',
                  borderRadius: 6,
                }}>
                <View style={{ backgroundColor: colors.card, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2 }}>
                  <T size={16} weight="bold">
                    {o.label}
                  </T>
                </View>
              </Pressable>
            );
          })}
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{ position: 'absolute', left: 0, right: 0, top: i * (gapH + 22), height: 22, backgroundColor: colors.green, borderWidth: 2, borderColor: '#2E9E5B' }}
            />
          ))}
        </View>

        {/* ground */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: GROUND, backgroundColor: '#C08457', borderTopWidth: 6, borderColor: colors.green }} />

        <View style={{ position: 'absolute', left: 0, right: 0, bottom: GROUND + 12 }}>
          <Feedback text={last?.text ?? null} ok={last?.ok ?? null} />
        </View>
      </Pressable>

      <Hint>Tap to flap. Each pipe has 3 gaps, only one is the right answer. Tap a gap in this prototype.</Hint>
      <Row>
        <Button
          label="Try again"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => {
            reset();
            setBirdY(150);
          }}
        />
        <Button
          label="See results"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/results', params: { game: 'Flappy Quiz', score: String(score) } })}
        />
      </Row>
    </Screen>
  );
}

const cloud = {
  position: 'absolute' as const,
  width: 72,
  height: 26,
  borderRadius: 13,
  backgroundColor: 'rgba(232,236,255,0.7)',
};
