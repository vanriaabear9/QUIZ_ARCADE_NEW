import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { useUser } from '@/components/auth';
import { Button, Card, Chip, ErrorBox, Field, Screen, T, TopBar } from '@/components/ui';
import { subjects } from '@/data/mock';
import { createClass } from '@/db/queries';
import { colors } from '@/theme';

export default function CreateClass() {
  const db = useSQLiteContext();
  const user = useUser();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [maxStudents, setMaxStudents] = useState('40');
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const r = await createClass(db, user.id, { name, subject, section, maxStudents });
    setBusy(false);
    if (!r.ok) return setError({ text: r.error, field: r.field });
    router.replace({ pathname: '/teacher/class/[id]', params: { id: String(r.id) } });
  }

  const bad = (f: string) => error?.field === f;

  return (
    <Screen>
      <TopBar title="CREATE CLASS" color={colors.yellow} backLabel="My classes" />
      <Card style={{ gap: 14 }}>
        <T size={14} color={colors.soft}>
          The app gives this class one 6 character code. Students enter it once to join.
        </T>
        <Field
          label="Class name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Digital Logic"
          autoCapitalize="words"
          maxLength={40}
          error={bad('name')}
        />
        <Field
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="e.g. Logic"
          autoCapitalize="words"
          maxLength={30}
          error={bad('subject')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
          {subjects.map((s) => (
            <Chip key={s} label={s} selected={s === subject} onPress={() => setSubject(s)} />
          ))}
        </ScrollView>
        <Field
          label="Section"
          value={section}
          onChangeText={setSection}
          placeholder="e.g. BSCPE 1-G"
          autoCapitalize="characters"
          maxLength={30}
          error={bad('section')}
        />
        <Field
          label="Max students"
          value={maxStudents}
          onChangeText={(t) => setMaxStudents(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={3}
          error={bad('maxStudents')}
        />
        <ErrorBox text={error?.text} />
        <Button label={busy ? 'Creating…' : 'Create class and get code'} disabled={busy} onPress={submit} />
      </Card>
    </Screen>
  );
}
