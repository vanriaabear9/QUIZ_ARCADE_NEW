import { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { PixelArt } from '@/components/pixel';
import { NextQuestion, useQuiz } from '@/components/use-quiz';
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
import { colors, radius } from '@/theme';

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
  const quiz = useQuiz();
  const { options, used, answered, score, last, pick } = quiz;
  const [stack, setStack] = useState(startStack);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);

  const solved = options.some((o) => o.ok && used.has(o.id));
  const board = [...Array(ROWS - stack.length).fill('.'.repeat(COLS)), ...stack];

  function answer(id: string) {
    const o = options.find((x) => x.id === id)!;
    if (answered) return;
    if (pick(o)) {
      setStack((s) => s.slice(0, -2));
      setLines((l) => l + 2);
    } else setLevel((l) => l + 1);
  }

  // Blocks keep falling between questions: a low stack builds back up for the next one.
  function nextStack() {
    setStack((s) => (s.length < 6 ? startStack : s));
  }

  if (!quiz.ready) return null;

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
          {solved ? 'ROWS CLEARED!' : answered ? 'NO CLEAR!' : 'STACK TOO HIGH!'}
        </Pixel>
        <T size={14} color={colors.soft}>
          The game pauses. Answer right to clear the 2 bottom rows.
        </T>
        <Eyebrow>
          {quiz.title} · Question {quiz.n} of {quiz.total}
        </Eyebrow>
        <T size={18} weight="bold">
          {quiz.question.text}
        </T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {options.map((o) => {
            const picked = used.has(o.id);
            const reveal = answered && !picked && o.ok;
            return (
              <Pressable
                key={o.id}
                accessibilityRole="button"
                disabled={answered}
                onPress={() => answer(o.id)}
                style={{
                  width: '47%',
                  minHeight: 48,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: picked ? (o.ok ? colors.green : colors.red) : reveal ? colors.green : colors.border,
                  opacity: answered && !picked && !o.ok ? 0.5 : 1,
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
      <NextQuestion quiz={quiz} game="Tetris Quiz" onNext={nextStack} />

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
            setLines(0);
          }}
        />
        <Button label="End run" style={{ flex: 1 }} onPress={() => quiz.showResults('Tetris Quiz')} />
      </Row>
    </Screen>
  );
}
