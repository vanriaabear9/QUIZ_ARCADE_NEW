import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { PixelArt } from '@/components/pixel';
import { useAnswers } from '@/components/use-answers';
import {
  Button,
  Card,
  Eyebrow,
  Feedback,
  Hint,
  MiniStat,
  Pixel,
  Row,
  Screen,
  T,
  TopBar,
} from '@/components/ui';
import { questions } from '@/data/mock';
import { colors, radius } from '@/theme';

const q = questions.tetris;
const COLS = 10;
const ROWS = 16;
const DANGER_ROW = 6; // rows above this index are the danger zone
const palette: Record<string, string> = {
  C: colors.cyan,
  O: colors.orange,
  P: colors.purple,
  G: colors.green,
  Y: colors.yellow,
  R: colors.red,
};
/** Stacked blocks, bottom 10 rows. '.' is empty. */
const startStack = [
  '....CC....',
  '...CCO....',
  'P..OOOG...',
  'PP.YYGGG..',
  'PPYYRRGO..',
  'GGGYRROOO.',
  'GPPPRCCOOY',
  'GGPRRCCYYY',
  'OGGRPPCYY.',
  'OOGPPPCC.Y',
];

export default function TetrisQuiz() {
  const { width } = useWindowDimensions();
  const cell = Math.floor(Math.min(width - 36, 340) / COLS);
  const { used, score, last, pick } = useAnswers(q.options);
  const [stack, setStack] = useState(startStack);
  const [lines, setLines] = useState(4);
  const [level, setLevel] = useState(3);

  const solved = q.options.some((o) => o.ok && used.has(o.id));
  const board = [...Array(ROWS - stack.length).fill('.'.repeat(COLS)), ...stack];

  function answer(id: string) {
    const o = q.options.find((x) => x.id === id)!;
    if (used.has(id) || solved) return;
    if (pick(o)) {
      setStack((s) => s.slice(0, -2));
      setLines((l) => l + 2);
    } else setLevel((l) => l + 1);
  }

  return (
    <Screen>
      <TopBar
        title="TETRIS QUIZ"
        color={colors.purple}
        backLabel="Back to arcade"
        right={
          <Row>
            <MiniStat label="Lines" value={lines} color={colors.cyan} />
            <MiniStat label="Score" value={score} />
          </Row>
        }
      />

      <View style={{ alignSelf: 'center', borderWidth: 2, borderColor: colors.purple, borderRadius: radius.lg, padding: 6, backgroundColor: '#05060F' }}>
        <PixelArt rows={board} palette={palette} size={cell} />
        <View style={{ position: 'absolute', left: 6, right: 6, top: 6 + DANGER_ROW * cell, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.red }} />
        <T size={10} weight="bold" color={colors.red} style={{ position: 'absolute', right: 10, top: DANGER_ROW * cell - 10 }}>
          DANGER LINE
        </T>
      </View>

      <Card borderColor={solved ? colors.green : colors.red} style={{ gap: 10 }}>
        <Pixel size={11} color={solved ? colors.green : colors.red}>
          {solved ? 'ROWS CLEARED!' : 'STACK TOO HIGH!'}
        </Pixel>
        <T size={14} color={colors.soft}>
          The game pauses. Answer right to clear the 2 bottom rows.
        </T>
        <Eyebrow>Question {q.n} of 10</Eyebrow>
        <T size={18} weight="bold">
          {q.text}
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {q.options.map((o) => {
            const picked = used.has(o.id);
            return (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                onPress={() => answer(o.id)}
                style={{
                  width: '47%',
                  minHeight: 48,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: picked ? (o.ok ? colors.green : colors.red) : colors.border,
                  backgroundColor: colors.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <T size={17} weight="bold">
                  {o.label}
                </T>
              </Pressable>
            );
          })}
        </View>
        <Feedback text={last?.text ?? null} ok={last?.ok ?? null} />
      </Card>

      <Row style={{ alignItems: 'stretch' }}>
        <Card style={{ flex: 1, gap: 8, padding: 14 }}>
          <Eyebrow>Next</Eyebrow>
          <PixelArt rows={['CCC', '.C.']} palette={palette} size={14} />
        </Card>
        <Card style={{ flex: 1, gap: 4, padding: 14 }}>
          <Eyebrow>Speed</Eyebrow>
          <Pixel size={16} color={colors.orange}>
            LV {level}
          </Pixel>
          <T size={12} color={colors.soft}>
            Wrong answer: speed goes up
          </T>
        </Card>
      </Row>

      <Hint>Swipe to move, tap to rotate, swipe down to drop.</Hint>
      <Row>
        <Button
          label="Reset board"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => {
            setStack(startStack);
            setLines(4);
          }}
        />
        <Button
          label="See results"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/results', params: { game: 'Tetris Quiz', score: String(score) } })}
        />
      </Row>
    </Screen>
  );
}
