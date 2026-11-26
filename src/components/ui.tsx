import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { art, PixelArt } from '@/components/pixel';
import { colors, fonts, radius, space } from '@/theme';

/* ---------- Layout ---------- */

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Row({ children, gap = space.gap, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Card({
  children,
  style,
  borderColor = colors.border,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
}) {
  return <View style={[styles.card, { borderColor }, style]}>{children}</View>;
}

/** Darker inset panel, used inside cards. */
export function Well({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.well, style]}>{children}</View>;
}

/* ---------- Text ---------- */

type Weight = 'regular' | 'medium' | 'bold';
const weightFont: Record<Weight, string> = { regular: fonts.body, medium: fonts.medium, bold: fonts.bold };

export function T({
  size = 15,
  weight = 'regular',
  color = colors.text,
  style,
  ...rest
}: TextProps & { size?: number; weight?: Weight; color?: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: weightFont[weight], fontSize: size, color, lineHeight: Math.round(size * 1.4) }, style]}
    />
  );
}

/** Retro pixel font, for titles and big numbers. */
export function Pixel({
  children,
  size = 14,
  color = colors.yellow,
  style,
  ...rest
}: TextProps & { size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fonts.pixel, fontSize: size, color, lineHeight: Math.round(size * 1.5) }, style]}>
      {children}
    </Text>
  );
}

/** Small uppercase label like "CURRENT QUIZ SET". */
export function Eyebrow({ children, color = colors.muted }: { children: ReactNode; color?: string }) {
  return (
    <T size={12} color={color} style={{ letterSpacing: 2, textTransform: 'uppercase' }}>
      {children}
    </T>
  );
}

/* ---------- Controls ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'outline';

export function Button({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const v = {
    primary: { bg: colors.yellow, border: colors.yellow, text: colors.bg },
    secondary: { bg: colors.card, border: colors.border, text: colors.text },
    outline: { bg: 'transparent', border: colors.yellow, text: colors.yellow },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}>
      <T weight="bold" color={v.text}>
        {label}
      </T>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  accent = colors.yellow,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accent?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: selected ? accent : colors.border, backgroundColor: selected ? accent : colors.bg },
      ]}>
      <T weight={selected ? 'bold' : 'medium'} color={selected ? colors.bg : colors.text}>
        {label}
      </T>
    </Pressable>
  );
}

export function LinkText({ label, onPress, color = colors.yellow }: { label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} hitSlop={10}>
      <T color={color} weight="medium">
        {label}
      </T>
    </Pressable>
  );
}

/* ---------- Game chrome ---------- */

export function TopBar({
  title,
  color,
  backLabel = 'Back',
  onBack,
  right,
}: {
  title: string;
  color: string;
  backLabel?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <View style={{ gap: 10 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <LinkText label={`‹ ${backLabel}`} onPress={back} />
        {right}
      </Row>
      <Pixel size={16} color={color}>
        {title}
      </Pixel>
    </View>
  );
}

export function QuestionCard({ eyebrow, text, right }: { eyebrow: string; text: string; right?: ReactNode }) {
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <T size={18} weight="bold">
          {text}
        </T>
      </View>
      {right}
    </Card>
  );
}

export function StatCard({
  label,
  value,
  color = colors.yellow,
  note,
  children,
  style,
}: {
  label: string;
  value?: string;
  color?: string;
  note?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Card style={[{ flex: 1, padding: 14, gap: 6 }, style]}>
      <Eyebrow>{label}</Eyebrow>
      {value !== undefined && (
        <Pixel size={16} color={color} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Pixel>
      )}
      {children}
      {note && (
        <T size={13} color={colors.soft}>
          {note}
        </T>
      )}
    </Card>
  );
}

/** Inline stat for the top bar, e.g. "Score 300". */
export function MiniStat({ label, value, color = colors.yellow }: { label: string; value: string | number; color?: string }) {
  return (
    <T size={14}>
      {label}{' '}
      <T size={14} weight="bold" color={color}>
        {String(value)}
      </T>
    </T>
  );
}

export function Hearts({ left, total }: { left: number; total: number }) {
  return (
    <Row gap={6}>
      {Array.from({ length: total }, (_, i) => (
        <PixelArt key={i} rows={[...art.heart.rows]} palette={{ X: i < left ? colors.red : colors.dim }} size={3} />
      ))}
    </Row>
  );
}

export function ProgressBar({ value, color = colors.green, height = 12 }: { value: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height, borderRadius: radius.pill, backgroundColor: colors.deep, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: radius.pill, backgroundColor: color }} />
    </View>
  );
}

export function Feedback({ text, ok }: { text: string | null; ok: boolean | null }) {
  if (!text) return null;
  return (
    <View
      style={{
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: ok ? colors.green : colors.red,
      }}>
      <T weight="bold" color={ok ? colors.green : colors.red}>
        {text}
      </T>
    </View>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <T size={13} color={colors.muted}>
      {children}
    </T>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.gutter, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderRadius: radius.xl,
    padding: 18,
  },
  well: { backgroundColor: colors.bg, borderRadius: radius.md, padding: 14 },
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
