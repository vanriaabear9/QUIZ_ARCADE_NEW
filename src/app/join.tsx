import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { PlayerIcon } from '@/components/pixel';
import { Button, Card, LinkText, Pixel, Row, Screen, T, Well } from '@/components/ui';
import { DEMO_CODE, playerIcons, quizSet } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';

const steps = ['Code', 'Profile', 'Waiting room'];

export default function Join() {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [nick, setNick] = useState('');
  const [icon, setIcon] = useState<string | null>(null);

  const nickTaken = nick.trim().toLowerCase() === 'player1';
  const canReady = nick.trim().length >= 2 && !nickTaken && icon !== null;
  const chosen = playerIcons.find((i) => i.name === icon);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <LinkText label="‹ Back to arcade" onPress={() => router.back()} />
      </Row>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Pixel size={22}>QUIZ ARCADE</Pixel>
        <T color={colors.soft}>Student lobby</T>
        <Row gap={8} style={{ paddingTop: 4 }}>
          {steps.map((s, i) => (
            <Row key={s} gap={8}>
              {i > 0 && <View style={{ width: 16, height: 1, backgroundColor: colors.dim }} />}
              <T size={13} weight={i === step ? 'bold' : 'regular'} color={i === step ? colors.yellow : colors.muted}>
                {s}
              </T>
            </Row>
          ))}
        </Row>
      </View>

      {step === 0 && (
        <Card style={{ gap: 12 }}>
          <T size={20} weight="bold">
            Enter your game code
          </T>
          <T size={14} color={colors.soft}>
            Your teacher shows a 6 character code on the screen.
          </T>
          <T size={13} color={colors.soft}>
            Game code
          </T>
          <TextInput
            value={code}
            onChangeText={(t) => {
              setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setCodeError(false);
            }}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="ABC123"
            placeholderTextColor={colors.dim}
            style={[input, { fontFamily: fonts.pixel, fontSize: 22, textAlign: 'center', color: colors.yellow, letterSpacing: 6, height: 64 }]}
          />
          {codeError && (
            <T size={14} color={colors.red}>
              That code does not match an open game. Check with your teacher.
            </T>
          )}
          <Button
            label="Join game"
            disabled={code.length !== 6}
            onPress={() => (code === DEMO_CODE ? setStep(1) : setCodeError(true))}
          />
          <T size={13} color={colors.muted} style={{ textAlign: 'center' }}>
            Prototype demo code:{' '}
            <T size={13} weight="bold">
              {DEMO_CODE}
            </T>
          </T>
        </Card>
      )}

      {step === 1 && (
        <Card style={{ gap: 12 }}>
          <T size={20} weight="bold">
            Make your player
          </T>
          <T size={13} color={colors.green}>
            Joined game {DEMO_CODE} · {quizSet.title}
          </T>
          <T size={13} color={colors.soft}>
            Nickname (shown on the leaderboard)
          </T>
          <TextInput
            value={nick}
            onChangeText={setNick}
            maxLength={16}
            placeholder="Pick a nickname"
            placeholderTextColor={colors.dim}
            style={[input, { fontFamily: fonts.medium, fontSize: 17, color: colors.text, height: 52 }]}
          />
          <T size={13} color={nickTaken ? colors.red : colors.muted}>
            {nickTaken ? 'Someone in this game already uses that name.' : 'Keep it friendly. Bad words are filtered.'}
          </T>
          <T size={14} color={colors.soft}>
            Pick a unique icon. Icons already used in this game are locked.
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {playerIcons.map((ic) => {
              const on = icon === ic.name;
              return (
                <Pressable
                  key={ic.name}
                  disabled={ic.taken}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on, disabled: ic.taken }}
                  accessibilityLabel={`${ic.name} icon${ic.taken ? ', taken' : ''}`}
                  onPress={() => setIcon(ic.name)}
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
                    opacity: ic.taken ? 0.35 : 1,
                  }}>
                  <PlayerIcon pat={ic.pat} color={ic.color} size={6} />
                  <T size={11} color={colors.soft}>
                    {ic.taken ? 'Taken' : ic.name}
                  </T>
                </Pressable>
              );
            })}
          </View>
          <Row>
            <Button label="Back" variant="secondary" onPress={() => setStep(0)} />
            <Button label="I'm ready" style={{ flex: 1 }} disabled={!canReady} onPress={() => setStep(2)} />
          </Row>
        </Card>
      )}

      {step === 2 && chosen && (
        <Card style={{ gap: 14, alignItems: 'center' }}>
          <PlayerIcon pat={chosen.pat} color={chosen.color} size={12} />
          <T size={20} weight="bold">
            {nick}
          </T>
          <Pixel size={12} color={colors.cyan}>
            WAITING ROOM
          </Pixel>
          <T size={14} color={colors.soft} style={{ textAlign: 'center' }}>
            You are in! Wait for your teacher to start the game. It opens on everyone&apos;s phone at the same time.
          </T>
          <Well style={{ alignSelf: 'stretch' }}>
            <T size={13} color={colors.muted} style={{ textAlign: 'center' }}>
              [x] players joined · {quizSet.title}
            </T>
          </Well>
          <Button label="Start (prototype)" style={{ alignSelf: 'stretch' }} onPress={() => router.replace('/games/snake')} />
        </Card>
      )}
    </Screen>
  );
}

const input = {
  backgroundColor: colors.bg,
  borderWidth: 2,
  borderColor: colors.border,
  borderRadius: radius.md,
  paddingHorizontal: 14,
};
