import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { useUser } from '@/components/auth';
import { Button, Card, Chip, LinkText, Pixel, ProgressBar, Row, Screen, T, Well } from '@/components/ui';
import { mostMissed, quizSet } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';

const sections = ['Quiz sets', 'Host a game', 'Analytics', 'Classes and students', 'Game settings'];
const difficulties = ['Easy', 'Medium', 'Hard'];

export default function TeacherPanel() {
  const user = useUser();
  const params = useLocalSearchParams<{ set?: string; count?: string }>();
  const setTitle = params.set ?? quizSet.title;
  const setSize = Math.max(1, Number(params.count) || quizSet.questionCount);
  const [section, setSection] = useState('Quiz sets');
  const [question, setQuestion] = useState('Which gate outputs 1 when inputs are different?');
  const [options, setOptions] = useState(['OR', 'XOR', 'AND', 'NAND']);
  const [correct, setCorrect] = useState(1);
  const [time, setTime] = useState('20');
  const [difficulty, setDifficulty] = useState('Medium');
  const [why, setWhy] = useState('XOR gives 1 only when exactly one input is 1.');
  const [saved, setSaved] = useState(9);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <LinkText label="‹ Back" onPress={() => router.back()} />
        <T size={13} color={colors.muted}>
          Teacher: {user.full_name}
        </T>
      </Row>
      <Pixel size={16}>TEACHER PANEL</Pixel>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {sections.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={s === section}
            accent={colors.cyan}
            onPress={() =>
              s === 'Host a game'
                ? router.push('/teacher/host')
                : s === 'Classes and students'
                  ? router.dismissTo('/teacher')
                  : setSection(s)
            }
          />
        ))}
      </ScrollView>

      <Card style={{ gap: 12 }}>
        <T size={20} weight="bold">
          Add a question
        </T>
        <T size={13} color={colors.muted}>
          Set: {setTitle} · {Math.min(saved, setSize)} of {setSize} questions
        </T>

        <Label>Question</Label>
        <TextInput value={question} onChangeText={setQuestion} multiline style={[input, { minHeight: 52 }]} placeholderTextColor={colors.dim} />

        <Label>Answers · tap the circle to mark the correct one</Label>
        {options.map((o, i) => {
          const on = i === correct;
          return (
            <View key={i} style={[input, { flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: on ? colors.green : colors.border, paddingVertical: 0 }]}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`Mark answer ${String.fromCharCode(65 + i)} correct`}
                onPress={() => setCorrect(i)}
                hitSlop={8}
                style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? colors.green : colors.muted, alignItems: 'center', justifyContent: 'center' }}>
                {on && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green }} />}
              </Pressable>
              <T weight="bold" color={colors.muted}>
                {String.fromCharCode(65 + i)}.
              </T>
              <TextInput
                value={o}
                onChangeText={(t) => setOptions(options.map((x, j) => (j === i ? t : x)))}
                style={{ flex: 1, height: 48, color: colors.text, fontFamily: fonts.medium, fontSize: 15 }}
              />
              {on && (
                <T size={12} weight="bold" color={colors.green}>
                  correct
                </T>
              )}
            </View>
          );
        })}

        <Row style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Label>Time limit (sec)</Label>
            <TextInput value={time} onChangeText={(t) => setTime(t.replace(/\D/g, ''))} keyboardType="number-pad" style={input} />
          </View>
          <View style={{ flex: 2, gap: 6 }}>
            <Label>Difficulty</Label>
            <Row gap={6}>
              {difficulties.map((d) => (
                <Chip key={d} label={d} selected={d === difficulty} onPress={() => setDifficulty(d)} />
              ))}
            </Row>
          </View>
        </Row>

        <Label>Explanation shown after</Label>
        <TextInput value={why} onChangeText={setWhy} multiline style={[input, { minHeight: 52 }]} />

        <Row>
          <Button label="Import from CSV" variant="secondary" style={{ flex: 1 }} />
          <Button label="Save question" variant="outline" style={{ flex: 1 }} onPress={() => setSaved((n) => Math.min(setSize, n + 1))} />
        </Row>
        <Button label="Finish quiz set" onPress={() => router.back()} />
      </Card>

      <Card style={{ gap: 12 }}>
        <T size={20} weight="bold">
          Most missed questions
        </T>
        <T size={13} color={colors.muted}>
          Bars show sample layout only. Real values come from student play data.
        </T>
        {mostMissed.map((m) => (
          <View key={m.label} style={{ gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T size={14}>{m.label}</T>
              <T size={13} color={colors.soft}>
                [x%] wrong
              </T>
            </Row>
            <ProgressBar value={m.pct} color={colors.orange} height={10} />
          </View>
        ))}
        <Row style={{ alignItems: 'stretch' }}>
          {[
            ['Students played', '[x]'],
            ['Class average', '[x%]'],
            ['Most played', '[game]'],
          ].map(([k, v]) => (
            <Well key={k} style={{ flex: 1, gap: 2, padding: 10 }}>
              <T size={11} color={colors.muted}>
                {k}
              </T>
              <T size={17} weight="bold">
                {v}
              </T>
            </Well>
          ))}
        </Row>
      </Card>
    </Screen>
  );
}

function Label({ children }: { children: string }) {
  return (
    <T size={13} color={colors.soft}>
      {children}
    </T>
  );
}

const input = {
  backgroundColor: colors.bg,
  borderWidth: 2,
  borderColor: colors.border,
  borderRadius: radius.md,
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: colors.text,
  fontFamily: fonts.medium,
  fontSize: 15,
};
