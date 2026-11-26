import { useState } from 'react';
import { Pressable, Share, Switch, TextInput, View } from 'react-native';

import { PlayerIcon } from '@/components/pixel';
import { Button, Card, Chip, Eyebrow, LinkText, Pixel, Row, Screen, T, TopBar } from '@/components/ui';
import { hostGames, playerIcons, quizSets } from '@/data/mock';
import { colors, fonts, radius } from '@/theme';

const expiries = ['15 minutes', '30 minutes', '1 hour'];
// No 0/O or 1/I so codes are easy to read off a projector.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeCode() {
  return Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
}

export default function HostGame() {
  const [set, setSet] = useState(quizSets[0]);
  const [game, setGame] = useState('Snake');
  const [expiry, setExpiry] = useState('30 minutes');
  const [maxPlayers, setMaxPlayers] = useState('40');
  const [unique, setUnique] = useState(true);
  const [filter, setFilter] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [players, setPlayers] = useState(() =>
    playerIcons.slice(0, 5).map((ic, i) => ({ ...ic, id: i, nick: `[nickname ${i + 1}]` })),
  );

  return (
    <Screen>
      <TopBar
        title="HOST A GAME"
        color={colors.yellow}
        backLabel="Back to teacher panel"
        right={
          <T size={13} color={colors.muted}>
            [Teacher name]
          </T>
        }
      />

      {/* Code display */}
      <Card style={{ gap: 12, alignItems: 'center' }}>
        <Eyebrow>Students join with this code</Eyebrow>
        {code ? (
          <>
            <Row gap={6}>
              {code.split('').map((ch, i) => (
                <View key={i} style={{ width: 44, height: 56, borderRadius: radius.md, borderWidth: 2, borderColor: colors.yellow, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Pixel size={20}>{ch}</Pixel>
                </View>
              ))}
            </Row>
            <T size={14} color={colors.soft}>
              Open Quiz Arcade › Join class game ·{' '}
              <T size={14} weight="bold" color={locked ? colors.red : colors.green}>
                {locked ? 'Locked' : 'Open'}
              </T>
            </T>
            <Row gap={8}>
              <Button label={locked ? 'Unlock' : 'Lock lobby'} variant="secondary" onPress={() => setLocked(!locked)} />
              <Button
                label="Share code"
                variant="secondary"
                onPress={() => Share.share({ message: `Join my Quiz Arcade game with code ${code}` })}
              />
            </Row>
          </>
        ) : (
          <>
            <Pixel size={14} color={colors.muted}>
              NO CODE YET
            </Pixel>
            <T size={14} color={colors.soft} style={{ textAlign: 'center' }}>
              Pick a quiz set and game, then press Generate game code.
            </T>
          </>
        )}
      </Card>

      {/* Setup */}
      <Card style={{ gap: 12 }}>
        <T size={20} weight="bold">
          Game setup
        </T>
        <Label>Quiz set</Label>
        <View style={{ gap: 8 }}>
          {quizSets.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="radio"
              accessibilityState={{ checked: s === set }}
              onPress={() => setSet(s)}
              style={{ padding: 14, borderRadius: radius.md, borderWidth: 2, borderColor: s === set ? colors.yellow : colors.border, backgroundColor: colors.bg }}>
              <T weight={s === set ? 'bold' : 'regular'}>{s}</T>
            </Pressable>
          ))}
        </View>

        <Label>Game</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {hostGames.map((g) => (
            <Chip key={g} label={g} selected={g === game} onPress={() => setGame(g)} accent={colors.cyan} />
          ))}
        </View>

        <Label>Code expires in</Label>
        <Row gap={8}>
          {expiries.map((e) => (
            <Chip key={e} label={e} selected={e === expiry} onPress={() => setExpiry(e)} />
          ))}
        </Row>

        <Label>Max players</Label>
        <TextInput
          value={maxPlayers}
          onChangeText={(t) => setMaxPlayers(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          style={{ backgroundColor: colors.bg, borderWidth: 2, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, height: 48, color: colors.text, fontFamily: fonts.medium, fontSize: 15 }}
        />

        <Toggle label="Unique nicknames and icons only" value={unique} onChange={setUnique} />
        <Toggle label="Filter bad words in nicknames" value={filter} onChange={setFilter} />

        <Button
          label={code ? 'Generate a new code' : 'Generate game code'}
          onPress={() => {
            setCode(makeCode());
            setLocked(false);
          }}
        />
      </Card>

      {/* Lobby */}
      <Card style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T size={18} weight="bold">
            Players in lobby
          </T>
          <T weight="bold" color={colors.green}>
            {code ? players.length : 0} joined
          </T>
        </Row>
        {code &&
          players.map((p) => (
            <Row key={p.id} style={{ backgroundColor: colors.bg, borderRadius: radius.md, padding: 10 }}>
              <PlayerIcon pat={p.pat} color={p.color} size={4} />
              <T style={{ flex: 1 }}>{p.nick}</T>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${p.nick}`}
                hitSlop={10}
                onPress={() => setPlayers(players.filter((x) => x.id !== p.id))}>
                <T color={colors.muted}>✕</T>
              </Pressable>
            </Row>
          ))}
        <T size={13} color={colors.muted}>
          Names and icons here are placeholders. In the real system they appear live as students join.
        </T>
        <LinkText label="Start game for everyone" onPress={() => {}} />
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

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <T style={{ flex: 1 }}>{label}</T>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.yellow, false: colors.border }} thumbColor={colors.text} />
    </Row>
  );
}
