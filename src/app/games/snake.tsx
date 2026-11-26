import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { useAnswers } from '@/components/use-answers';
import {
  Button,
  Card,
  Eyebrow,
  Feedback,
  Hearts,
  Hint,
  Pixel,
  ProgressBar,
  QuestionCard,
  Row,
  Screen,
  StatCard,
  T,
  TopBar,
} from '@/components/ui';
import { questions } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';

const GRID = 14;
const q = questions.snake;
/** Food positions on the grid, one per answer. */
const foodAt: Record<string, [number, number]> = { a: [11, 4], b: [2, 2], c: [11, 9], d: [7, 11] };
const startBody: [number, number][] = [
  [7, 6], [6, 6], [5, 6], [5, 7], [5, 8], [5, 9], [4, 9], [3, 9], [2, 9],
];

export default function SnakeQuiz() {
  const { width } = useWindowDimensions();
  const board = Math.min(width - 32, 480);
  const cell = board / GRID;
  const { used, score, streak, last, pick } = useAnswers(q.options);
  const [body, setBody] = useState(startBody);
  const [lives, setLives] = useState(2);
  const [seconds, setSeconds] = useState(12);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  function eat(id: string) {
    const o = q.options.find((x) => x.id === id)!;
    if (used.has(id)) return;
    const ok = pick(o);
    const [fx, fy] = foodAt[id];
    if (ok) setBody([[fx, fy], ...body]);
    else {
      setLives((l) => Math.max(0, l - 1));
      setBody(body.slice(0, Math.max(3, body.length - 2)));
    }
  }

  return (
    <Screen>
      <TopBar
        title="SNAKE QUIZ"
        color={colors.green}
        backLabel="Back to arcade"
        right={<Pixel size={14}>0:{String(seconds).padStart(2, '0')}</Pixel>}
      />
      <QuestionCard eyebrow={`Question ${q.n} of 10`} text={q.text} />

      <View
        style={{
          width: board + 4,
          height: board + 4,
          alignSelf: 'center',
          borderWidth: 2,
          borderColor: colors.green,
          borderRadius: radius.lg,
          backgroundColor: colors.deep,
          overflow: 'hidden',
        }}>
        {/* grid lines */}
        {Array.from({ length: GRID - 1 }, (_, i) => (
          <View key={`v${i}`} style={{ position: 'absolute', left: (i + 1) * cell, top: 0, bottom: 0, width: 1, backgroundColor: '#141733' }} />
        ))}
        {Array.from({ length: GRID - 1 }, (_, i) => (
          <View key={`h${i}`} style={{ position: 'absolute', top: (i + 1) * cell, left: 0, right: 0, height: 1, backgroundColor: '#141733' }} />
        ))}

        {/* snake */}
        {body.map(([x, y], i) => (
          <View
            key={`${x}-${y}-${i}`}
            style={{
              position: 'absolute',
              left: x * cell,
              top: y * cell,
              width: cell,
              height: cell,
              backgroundColor: i === 0 ? colors.greenSoft : colors.green,
              borderRadius: i === 0 ? 4 : 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {i === 0 && <T size={cell * 0.45} color={colors.bg} weight="bold">••</T>}
          </View>
        ))}

        {/* food with answers */}
        {q.options.map((o) => {
          if (used.has(o.id) && o.ok) return null;
          const [x, y] = foodAt[o.id];
          const gone = used.has(o.id);
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityLabel={`Answer ${o.label}`}
              onPress={() => eat(o.id)}
              hitSlop={8}
              style={{
                position: 'absolute',
                left: x * cell - cell * 0.6,
                top: y * cell - cell * 0.2,
                minWidth: cell * 2.2,
                height: cell * 1.4,
                paddingHorizontal: 6,
                borderRadius: 6,
                backgroundColor: gone ? colors.dim : colors.red,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <T size={13} weight="bold" color={gone ? colors.muted : colors.bg} style={{ fontFamily: fonts.bold }}>
                {o.label}
              </T>
            </Pressable>
          );
        })}
      </View>

      <Feedback text={last?.text ?? null} ok={last?.ok ?? null} />
      <Hint>Steer with swipes. Tap a food in this prototype to try an answer.</Hint>

      <Row style={{ alignItems: 'stretch' }}>
        <StatCard label="Score" value={String(score)} />
        <StatCard label="Lives" note={`${lives} of 3 left`}>
          <Hearts left={lives} total={3} />
        </StatCard>
      </Row>

      <Card style={{ gap: 8, padding: 14 }}>
        <Eyebrow>Progress</Eyebrow>
        <ProgressBar value={(3 + (streak > 0 ? 1 : 0)) / 10} />
        <T size={13} color={colors.soft}>
          {3 + (streak > 0 ? 1 : 0)} correct · streak x{3 + streak}
        </T>
      </Card>

      <Card style={{ gap: 6, padding: 14 }}>
        <Eyebrow>Rules</Eyebrow>
        <T size={14} color={colors.soft}>
          Right answer: grow and gain points. Wrong answer: shrink and lose a life. Hitting a wall ends the run.
        </T>
      </Card>

      <Button
        label="End run and see results"
        onPress={() => router.push({ pathname: '/results', params: { game: 'Snake Quiz', score: String(score) } })}
      />
    </Screen>
  );
}
