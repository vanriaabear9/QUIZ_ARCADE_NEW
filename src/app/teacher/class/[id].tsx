import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, Share, View } from 'react-native';

import { useUser } from '@/components/auth';
import { iconByName } from '@/components/classes';
import { PlayerIcon } from '@/components/pixel';
import { Button, Card, CodeTiles, ErrorBox, Eyebrow, Field, Hint, Row, Screen, T, Toggle, TopBar, Well } from '@/components/ui';
import { useLiveQuery } from '@/db/live';
import { addQuizSet, classMembers, getClass, quizSets, removeMember, setAccepting } from '@/db/queries';
import { colors, radius } from '@/theme';

export default function TeacherClass() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = Number(id);
  const db = useSQLiteContext();
  const user = useUser();
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('');
  const [count, setCount] = useState('10');
  const [quizSetError, setQuizSetError] = useState<{ text: string; field?: string } | null>(null);

  const data = useLiveQuery(`teacher-class:${classId}`, async (d) => {
    const [cls, members, sets] = await Promise.all([getClass(d, classId), classMembers(d, classId), quizSets(d, classId)]);
    return { cls, members, sets };
  });

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!data) return null;
  const { cls, members, sets } = data;

  if (!cls || cls.teacher_id !== user.id) {
    return (
      <Screen>
        <TopBar title="CLASS" color={colors.yellow} backLabel="My classes" />
        <Card>
          <T>This class was not found.</T>
        </Card>
      </Screen>
    );
  }

  async function copy() {
    if (!cls) return;
    await Clipboard.setStringAsync(cls.code);
    setCopied(true);
  }

  async function saveSet() {
    const r = await addQuizSet(db, classId, title, count);
    if (!r.ok) return setQuizSetError({ text: r.error, field: r.field });
    setQuizSetError(null);
    setTitle('');
  }

  return (
    <Screen>
      <TopBar title={cls.name.toUpperCase()} color={colors.yellow} backLabel="My classes" />
      <T size={14} color={colors.soft} style={{ marginTop: -8 }}>
        {cls.subject} · {cls.section}
      </T>

      {/* Code */}
      <Card style={{ gap: 12, alignItems: 'center' }}>
        <Eyebrow>Class code</Eyebrow>
        <CodeTiles code={cls.code} />
        <T size={14} color={colors.soft} style={{ textAlign: 'center' }}>
          Students open Quiz Arcade › Join a class ·{' '}
          <T size={14} weight="bold" color={cls.accepting ? colors.green : colors.red}>
            {cls.accepting ? 'Open' : 'Closed'}
          </T>
        </T>
        <Row gap={8}>
          <Button label={copied ? 'Copied!' : 'Copy'} variant={copied ? 'outline' : 'secondary'} onPress={copy} />
          <Button
            label="Share"
            variant="secondary"
            onPress={() => Share.share({ message: `Join my Quiz Arcade class "${cls.name}" with code ${cls.code}` })}
          />
        </Row>
      </Card>

      {/* Students */}
      <Card style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={18} weight="bold">
            Students
          </T>
          <T weight="bold" color={colors.green}>
            {members.length} / {cls.max_students} joined
          </T>
        </Row>
        <Toggle label="Accept new students" value={cls.accepting} onChange={(v) => setAccepting(db, cls.id, v)} />
        {members.length === 0 ? (
          <Well>
            <T size={14} color={colors.muted} style={{ textAlign: 'center' }}>
              No one has joined yet. Students appear here as soon as they join.
            </T>
          </Well>
        ) : (
          members.map((m) => {
            const ic = iconByName(m.icon);
            return (
              <Row key={m.student_id} style={{ backgroundColor: colors.bg, borderRadius: radius.md, padding: 10 }}>
                <PlayerIcon pat={ic.pat} color={ic.color} size={4} />
                <T style={{ flex: 1 }}>{m.nickname}</T>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${m.nickname} from class`}
                  hitSlop={10}
                  onPress={() => removeMember(db, cls.id, m.student_id)}>
                  <T color={colors.muted}>✕</T>
                </Pressable>
              </Row>
            );
          })
        )}
      </Card>

      {/* Quiz sets */}
      <Card style={{ gap: 12 }}>
        <T size={18} weight="bold">
          Quiz sets
        </T>
        {sets.length === 0 ? (
          <T size={14} color={colors.muted}>
            No quiz sets yet. Add one below and it shows up for every student in this class.
          </T>
        ) : (
          sets.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={`Edit questions for ${s.title}`}
              onPress={() => router.push({ pathname: '/teacher/questions', params: { set: s.title, count: String(s.question_count) } })}>
              <Row style={{ backgroundColor: colors.bg, borderRadius: radius.md, padding: 12 }}>
                <View style={{ flex: 1 }}>
                  <T weight="bold">{s.title}</T>
                  <T size={13} color={colors.soft}>
                    {s.question_count} questions
                  </T>
                </View>
                <T size={13} weight="bold" color={colors.yellow}>
                  Edit ›
                </T>
              </Row>
            </Pressable>
          ))
        )}
        <Row style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 3 }}>
            <Field label="New quiz set" value={title} onChangeText={setTitle} placeholder="e.g. Logic Gates Basics" error={quizSetError?.field === 'title'} maxLength={40} />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Questions"
              value={count}
              onChangeText={(t) => setCount(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={3}
              error={quizSetError?.field === 'count'}
            />
          </View>
        </Row>
        <ErrorBox text={quizSetError?.text} />
        <Button label="Add quiz set" variant="outline" onPress={saveSet} />
      </Card>

      <Button label="Host a game for this class" onPress={() => router.push({ pathname: '/teacher/host', params: { classId: String(cls.id) } })} />
      <Hint>The student list updates as students join on this device. Syncing between phones needs a server.</Hint>
    </Screen>
  );
}
