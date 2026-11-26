import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { art, PixelArt } from '@/components/pixel';
import { useAnswers } from '@/components/use-answers';
import {
  Button,
  Card,
  Eyebrow,
  Feedback,
  Hint,
  MiniStat,
  Pixel,
  QuestionCard,
  Row,
  Screen,
  T,
  TopBar,
} from '@/components/ui';
import { questions } from '@/data/mock';
import { colors, radius } from '@/theme';

const q = questions.mole;
/** Which of the 9 holes holds which answer. Empty holes have no mole. */
const holes: (string | null)[] = ['a', null, 'b', null, 'c', 'd', null, 'e', null];
const needed = q.options.filter((o) => o.ok).length;

export default function MoleQuiz() {
  const { used, score, last, pick, reset } = useAnswers(q.options);
  const [combo, setCombo] = useState(1);
  const [time, setTime] = useState(20);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const found = q.options.filter((o) => o.ok && used.has(o.id)).length;

  function whack(id: string) {
    const o = q.options.find((x) => x.id === id)!;
    if (used.has(id)) return;
    if (pick(o)) setCombo((c) => c * 2);
    else {
      setCombo(1);
      setTime((t) => Math.max(0, t - 2));
    }
  }

  return (
    <Screen>
      <TopBar
        title="WHACK A MOLE QUIZ"
        color={colors.orange}
        backLabel="Back to arcade"
        right={
          <Row>
            <MiniStat label="Time" value={`0:${String(time).padStart(2, '0')}`} color={colors.cyan} />
            <MiniStat label="Score" value={score} />
          </Row>
        }
      />
      <QuestionCard
        eyebrow={`Question ${q.n} of 10 · more than one answer`}
        text={q.text}
        right={
          <T size={14} color={colors.soft}>
            Found{' '}
            <T weight="bold" color={colors.green}>
              {found}
            </T>{' '}
            of {needed}
          </T>
        }
      />

      <View
        style={{
          borderWidth: 2,
          borderColor: colors.orange,
          borderRadius: radius.lg,
          backgroundColor: '#2F6B3A',
          padding: 12,
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: 16,
        }}>
        {holes.map((id, i) => {
          const o = id ? q.options.find((x) => x.id === id) : undefined;
          const hit = o ? used.has(o.id) : false;
          return (
            <Pressable
              key={i}
              disabled={!o || hit}
              accessibilityRole="button"
              accessibilityLabel={o ? `Mole ${o.label}` : 'Empty hole'}
              onPress={() => o && whack(o.id)}
              style={{ width: '33.33%', alignItems: 'center', justifyContent: 'flex-end', height: 104 }}>
              {o && !hit && (
                <View style={{ alignItems: 'center', marginBottom: -6, zIndex: 1 }}>
                  <View style={{ paddingHorizontal: 8, borderRadius: 4, backgroundColor: colors.white, marginBottom: 2 }}>
                    <T size={13} weight="bold" color={colors.bg}>
                      {o.label}
                    </T>
                  </View>
                  <PixelArt rows={art.mole.rows.slice(0, 5)} palette={art.mole.palette} size={5} />
                </View>
              )}
              {o && hit && (
                <Pixel size={10} color={o.ok ? colors.green : colors.red} style={{ marginBottom: 4 }}>
                  {o.ok ? 'BONK!' : 'MISS'}
                </Pixel>
              )}
              <View style={{ width: 80, height: 22, borderRadius: 40, backgroundColor: '#1C130C', borderTopWidth: 3, borderColor: '#4A3524' }} />
            </Pressable>
          );
        })}
      </View>

      <Feedback text={last?.text ?? null} ok={last?.ok ?? null} />

      <Row style={{ alignItems: 'stretch' }}>
        <Card style={{ flex: 1, gap: 4, padding: 14 }}>
          <Eyebrow>Combo</Eyebrow>
          <Pixel size={18} color={colors.orange}>
            x{combo}
          </Pixel>
          <T size={13} color={colors.soft}>
            Correct hits in a row double your points.
          </T>
        </Card>
        <Card style={{ flex: 1, gap: 4, padding: 14 }}>
          <Eyebrow>Rules</Eyebrow>
          <T size={13} color={colors.soft}>
            Hit the right moles fast. A wrong mole breaks your combo and costs 2 seconds.
          </T>
        </Card>
      </Row>

      <Hint>Tap the moles holding correct answers.</Hint>
      <Row>
        <Button
          label="Reset moles"
          variant="secondary"
          style={{ flex: 1 }}
          onPress={() => {
            reset();
            setCombo(1);
          }}
        />
        <Button
          label="End run"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/results', params: { game: 'Whack a Mole Quiz', score: String(score) } })}
        />
      </Row>
    </Screen>
  );
}
