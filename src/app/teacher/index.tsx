import { router } from 'expo-router';

import { useUser } from '@/components/auth';
import { AccountBar, ClassRow } from '@/components/classes';
import { BrandHeader, Button, Card, CodeTiles, Hint, Pixel, Row, Screen, T } from '@/components/ui';
import { useLiveQuery } from '@/db/live';
import { teacherClasses } from '@/db/queries';
import { colors } from '@/theme';

export default function TeacherClasses() {
  const user = useUser();
  const classes = useLiveQuery(`teacher-classes:${user.id}`, (db) => teacherClasses(db, user.id));

  return (
    <Screen>
      <BrandHeader />
      <AccountBar />

      <Row style={{ justifyContent: 'space-between' }}>
        <Pixel size={14}>MY CLASSES</Pixel>
        {!!classes?.length && (
          <Button label="Host a game" variant="secondary" style={{ minHeight: 40 }} onPress={() => router.push('/teacher/host')} />
        )}
      </Row>

      {classes?.length === 0 && (
        <Card style={{ gap: 6 }}>
          <T size={18} weight="bold">
            No classes yet
          </T>
          <T size={14} color={colors.soft}>
            Create a class for each subject and section. Students join it once with its code, then see every quiz set
            you add.
          </T>
        </Card>
      )}

      {classes?.map((c) => (
        <ClassRow
          key={c.id}
          title={c.name}
          meta={`${c.subject} · ${c.section}`}
          label={`Open ${c.name}, code ${c.code}, ${c.student_count} students`}
          onPress={() => router.push({ pathname: '/teacher/class/[id]', params: { id: String(c.id) } })}
          footer={
            <Row style={{ justifyContent: 'space-between' }}>
              <CodeTiles code={c.code} size="sm" />
              <T size={13} weight="bold" color={c.accepting ? colors.green : colors.muted}>
                {c.student_count} / {c.max_students} students{c.accepting ? '' : ' · closed'}
              </T>
            </Row>
          }
        />
      ))}

      <Button label="Create class" onPress={() => router.push('/teacher/create')} />
      <Hint>One code per class, not per quiz. Students keep it for the whole term.</Hint>
    </Screen>
  );
}
