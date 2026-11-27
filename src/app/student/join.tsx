import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { useUser } from '@/components/auth';
import { PlayerIcon } from '@/components/pixel';
import { Button, Card, ErrorBox, inputStyle, LinkText, Pixel, Row, Screen, Steps, T, Well } from '@/components/ui';
import { playerIcons } from '@/data/mock';
import { useLiveQuery } from '@/db/live';
import { checkCode, classMembers, getClass, joinClass, type ClassInfo } from '@/db/queries';
import { colors, fonts, radius } from '@/theme';

const steps = ['Code', 'Profile', 'Joined'];

export default function Join() {
  const db = useSQLiteContext();
  const user = useUser();
  // The open class ("Join for fun") passes its id and skips the code step.
  const { classId } = useLocalSearchParams<{ classId?: string }>();

  const [step, setStep] = useState(classId ? 1 : 0);
  const [cls, setCls] = useState<ClassInfo | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<{ text: string; alreadyIn?: number } | null>(null);
  const [nick, setNick] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<{ text: string; field?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!classId) return;
    getClass(db, Number(classId)).then((c) => {
      if (c) setCls(c);
      else setStep(0);
    });
  }, [db, classId]);

  // Nicknames and icons already used in this class, kept live while the student picks.
  const members = useLiveQuery(`members:${cls?.id ?? 0}`, (d) => (cls ? classMembers(d, cls.id) : Promise.resolve([])));
  const takenIcons = new Set((members ?? []).map((m) => m.icon));
  const nickTaken = (members ?? []).some((m) => m.nickname.toLowerCase() === nick.trim().toLowerCase());
  const canJoin = nick.trim().length >= 2 && !nickTaken && icon !== null && !takenIcons.has(icon);
  const chosen = playerIcons.find((i) => i.name === icon);

  async function submitCode() {
    setBusy(true);
    const r = await checkCode(db, code, user.id);
    setBusy(false);
    if (!r.ok) return setCodeError({ text: r.error, alreadyIn: r.alreadyIn });
    setCls(r.cls);
    setStep(1);
  }

  async function submitProfile() {
    if (!cls || !icon) return;
    setBusy(true);
    const r = await joinClass(db, { classId: cls.id, studentId: user.id, nickname: nick, icon });
    setBusy(false);
    if (!r.ok) return setJoinError({ text: r.error, field: r.field });
    setStep(2);
  }

  function openClass(id: number) {
    router.replace({ pathname: '/student/class/[id]', params: { id: String(id) } });
  }

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <LinkText label="‹ My classes" onPress={() => router.back()} />
      </Row>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Pixel size={22}>QUIZ ARCADE</Pixel>
        <T color={colors.soft}>Student lobby</T>
        <Steps steps={steps} current={step} />
      </View>

      {step === 0 && (
        <Card style={{ gap: 12 }}>
          <T size={20} weight="bold">
            Enter your class code
          </T>
          <T size={14} color={colors.soft}>
            Your teacher gives each class one 6 character code. You only enter it once.
          </T>
          <T size={13} color={colors.soft}>
            Class code
          </T>
          <TextInput
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setCodeError(null);
            }}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="ABC123"
            placeholderTextColor={colors.dim}
            onSubmitEditing={() => code.length === 6 && submitCode()}
            style={[
              inputStyle,
              { fontFamily: fonts.pixel, fontSize: 22, textAlign: 'center', color: colors.yellow, letterSpacing: 6, height: 64 },
              codeError && { borderColor: colors.red },
            ]}
          />
          <ErrorBox text={codeError?.text} />
          {codeError?.alreadyIn !== undefined && (
            <LinkText label="Open that class ›" onPress={() => openClass(codeError.alreadyIn!)} />
          )}
          <Button label={busy ? 'Checking…' : 'Join class'} disabled={code.length !== 6 || busy} onPress={submitCode} />
        </Card>
      )}

      {step === 1 && cls && (
        <Card style={{ gap: 12 }}>
          <T size={20} weight="bold">
            Make your player
          </T>
          <T size={13} color={colors.green}>
            {cls.is_open ? 'Open class' : `Class ${cls.code}`} · {cls.name} · {cls.teacher_name}
          </T>
          <T size={13} color={colors.soft}>
            Nickname (shown on the leaderboard)
          </T>
          <TextInput
            value={nick}
            onChangeText={(t) => {
              setNick(t);
              setJoinError(null);
            }}
            maxLength={16}
            placeholder="Pick a nickname"
            placeholderTextColor={colors.dim}
            style={[inputStyle, { fontSize: 17 }, (nickTaken || joinError?.field === 'nickname') && { borderColor: colors.red }]}
          />
          <T size={13} color={nickTaken ? colors.red : colors.muted}>
            {nickTaken ? 'Someone in this class already uses that name.' : 'Keep it friendly. Bad words are filtered.'}
          </T>
          <T size={14} color={colors.soft}>
            Pick a unique icon. Icons already used in this class are locked.
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {playerIcons.map((ic) => {
              const taken = takenIcons.has(ic.name);
              const on = icon === ic.name && !taken;
              return (
                <Pressable
                  key={ic.name}
                  disabled={taken}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on, disabled: taken }}
                  accessibilityLabel={`${ic.name} icon${taken ? ', taken' : ''}`}
                  onPress={() => {
                    setIcon(ic.name);
                    setJoinError(null);
                  }}
                  style={{
                    width: '22%',
                    aspectRatio: 0.85,
                    borderRadius: radius.md,
                    borderWidth: 2,
                    borderColor: on ? colors.yellow : colors.border,
                    backgroundColor: colors.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    opacity: taken ? 0.35 : 1,
                  }}>
                  <PlayerIcon pat={ic.pat} color={ic.color} size={6} />
                  <T size={11} color={colors.soft}>
                    {taken ? 'Taken' : ic.name}
                  </T>
                </Pressable>
              );
            })}
          </View>
          <ErrorBox text={joinError?.text} />
          <Row>
            {!classId && <Button label="Back" variant="secondary" onPress={() => setStep(0)} />}
            <Button label={busy ? 'Joining…' : "I'm ready"} style={{ flex: 1 }} disabled={!canJoin || busy} onPress={submitProfile} />
          </Row>
        </Card>
      )}

      {step === 2 && cls && chosen && (
        <Card style={{ gap: 14, alignItems: 'center' }}>
          <PlayerIcon pat={chosen.pat} color={chosen.color} size={12} />
          <T size={20} weight="bold">
            {nick.trim()}
          </T>
          <Pixel size={12} color={colors.green}>
            JOINED!
          </Pixel>
          <T size={14} color={colors.soft} style={{ textAlign: 'center' }}>
            You are in {cls.name}. Every quiz set and game {cls.teacher_name} adds to this class shows up here, no new
            code needed.
          </T>
          <Well style={{ alignSelf: 'stretch' }}>
            <T size={13} color={colors.muted} style={{ textAlign: 'center' }}>
              {cls.subject} · {cls.section} · {(members ?? []).length} players
            </T>
          </Well>
          <Button label="Enter class" style={{ alignSelf: 'stretch' }} onPress={() => openClass(cls.id)} />
        </Card>
      )}
    </Screen>
  );
}
