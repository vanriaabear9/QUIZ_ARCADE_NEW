import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/components/auth';
import { art, PixelArt } from '@/components/pixel';
import { Button, Card, Chip, ErrorBox, Field, LinkText, Pixel, Row, Screen, T } from '@/components/ui';
import { MIN_PASSWORD, type Role } from '@/db/queries';
import { colors } from '@/theme';

type Tab = 'login' | 'signup';

export default function Login() {
  const params = useLocalSearchParams<{ role?: string }>();
  const role: Role = params.role === 'teacher' ? 'teacher' : 'student';
  const other: Role = role === 'teacher' ? 'student' : 'teacher';
  const accent = role === 'teacher' ? colors.purple : colors.cyan;

  const { user, logIn, signUp } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Redirect href={user.role === 'teacher' ? '/teacher' : '/student'} />;

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setPassword('');
    setConfirm('');
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const r =
        tab === 'login'
          ? await logIn({ role, username, password })
          : await signUp({ role, fullName, username, password, confirm });
      if (!r.ok) setError({ text: r.error, field: r.field });
      else router.replace(role === 'teacher' ? '/teacher' : '/student');
    } catch {
      setError({ text: 'Something went wrong saving your account. Try again.' });
    } finally {
      setBusy(false);
    }
  }

  const bad = (f: string) => error?.field === f;

  return (
    <Screen>
      <Row>
        <LinkText label="‹ Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      </Row>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <PixelArt rows={[...art.logo.rows]} palette={art.logo.palette} size={5} />
        <Pixel size={22}>QUIZ ARCADE</Pixel>
        <Pixel size={11} color={accent}>
          {role === 'teacher' ? 'TEACHER LOGIN' : 'STUDENT LOGIN'}
        </Pixel>
      </View>

      <Card style={{ gap: 14 }} borderColor={accent}>
        <Row gap={8}>
          <Chip label="Log in" selected={tab === 'login'} accent={accent} onPress={() => switchTab('login')} />
          <Chip label="Sign up" selected={tab === 'signup'} accent={accent} onPress={() => switchTab('signup')} />
        </Row>

        <T size={20} weight="bold">
          {tab === 'login' ? 'Welcome back' : role === 'teacher' ? 'Create a teacher account' : 'Create a student account'}
        </T>

        {tab === 'signup' && (
          <Field
            label="Full name"
            note={role === 'teacher' ? 'Students see this name on your classes and quiz sets.' : undefined}
            value={fullName}
            onChangeText={setFullName}
            placeholder={role === 'teacher' ? 'e.g. Ms. Jonna Bohol' : 'e.g. Juan Dela Cruz'}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            error={bad('fullName')}
            maxLength={60}
          />
        )}
        <Field
          label="Username"
          value={username}
          // Length is capped here rather than with maxLength: maxLength plus autofill hints
          // can stop backspace from working on some Android keyboards.
          onChangeText={(t) => setUsername(t.slice(0, 20))}
          placeholder="username"
          autoCapitalize="none"
          autoComplete={tab === 'login' ? 'username' : 'off'}
          importantForAutofill={tab === 'login' ? 'auto' : 'no'}
          textContentType={tab === 'login' ? 'username' : 'none'}
          error={bad('username') || bad('role')}
        />
        <Field
          label="Password"
          note={tab === 'signup' ? `At least ${MIN_PASSWORD} characters.` : undefined}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          textContentType={tab === 'login' ? 'password' : 'newPassword'}
          error={bad('password')}
          onSubmitEditing={tab === 'login' ? submit : undefined}
        />
        {tab === 'signup' && (
          <Field
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            error={bad('confirm')}
            onSubmitEditing={submit}
          />
        )}

        <ErrorBox text={error?.text} />
        {error?.field === 'role' && (
          <LinkText
            label={`Go to ${other} login ›`}
            onPress={() => {
              setError(null);
              router.setParams({ role: other });
            }}
          />
        )}

        <Button
          label={busy ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Sign up'}
          disabled={busy}
          onPress={submit}
        />
        <Row style={{ justifyContent: 'center' }}>
          <LinkText
            label={tab === 'login' ? 'New here? Sign up' : 'Have an account? Log in'}
            color={colors.muted}
            onPress={() => switchTab(tab === 'login' ? 'signup' : 'login')}
          />
        </Row>
      </Card>

      <Row style={{ justifyContent: 'center' }}>
        <LinkText
          label={role === 'teacher' ? "I'm a student ›" : "I'm a teacher ›"}
          color={colors.muted}
          onPress={() => {
            setError(null);
            router.setParams({ role: other });
          }}
        />
      </Row>
    </Screen>
  );
}
