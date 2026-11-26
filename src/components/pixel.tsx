import { View } from 'react-native';

import { colors } from '@/theme';

type Props = {
  /** Rows of equal length. Each character is looked up in `palette`; '.' is empty. */
  rows: string[];
  palette: Record<string, string>;
  /** Size of one pixel in points. */
  size: number;
};

/** Draws crisp pixel art out of plain Views, so no image or SVG library is needed. */
export function PixelArt({ rows, palette, size }: Props) {
  return (
    <View>
      {rows.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row' }}>
          {row.split('').map((ch, x) => (
            <View
              key={x}
              style={{ width: size, height: size, backgroundColor: palette[ch] ?? 'transparent' }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/** A 5x5 player icon, stored as a 25 character string ('#' = filled). */
export function PlayerIcon({ pat, color, size }: { pat: string; color: string; size: number }) {
  const rows = [0, 1, 2, 3, 4].map((i) => pat.slice(i * 5, i * 5 + 5));
  return <PixelArt rows={rows} palette={{ '#': color }} size={size} />;
}

const Y = colors.yellow;
const C = colors.cyan;
const G = colors.green;
const P = colors.purple;
const R = colors.red;
const D = colors.bg;

export const art = {
  logo: {
    rows: [
      '..YYYYYYY..',
      '..YYYYYYY..',
      '.YYYYYYYYY.',
      '.YYDYYYDYY.',
      '.YYDYYYDYY.',
      '.YYYYYYYYY.',
      '.YYYYYYYYY.',
      '.CC.YYY.CC.',
      '.CC.YYY.CC.',
      '.CC.....CC.',
    ],
    palette: { Y, C, D },
  },
  snake: {
    rows: [
      '..............',
      '......GGGH..R.',
      '......G.......',
      '......G.......',
      '.GGGGGG.......',
      '..............',
    ],
    palette: { G, H: colors.greenSoft, R },
  },
  invader: {
    rows: [
      '..P.....P..',
      '..PPPPPPP..',
      '.PP.PPP.PP.',
      'PPPPPPPPPPP',
      'P.PPPPPPP.P',
      '...........',
      '.....C.....',
      '.....C.....',
    ],
    palette: { P, C },
  },
  alien: {
    rows: [
      '..P.....P..',
      '...P...P...',
      '..PPPPPPP..',
      '.PP.PPP.PP.',
      'PPPPPPPPPPP',
      'P.PPPPPPP.P',
      'P.P.....P.P',
      '...PP.PP...',
    ],
    palette: { P },
  },
  ship: {
    rows: ['....C....', '....C....', '..CCCCC..', '.CCCCCCC.', 'CCCCCCCCC'],
    palette: { C },
  },
  mole: {
    rows: [
      '...BBBB...',
      '..BBBBBB..',
      '..BDBBDB..',
      '..BBNNBB..',
      '..BBBBBB..',
      'EEEEEEEEEE',
      '.EEEEEEEE.',
    ],
    palette: { B: colors.brown, D: colors.bg, N: '#FFB4A0', E: '#4A3524' },
  },
  bird: {
    rows: ['..YYYY....', '.YYYYYDY..', 'LLYYYYYYOO', 'LLYYYYYY..', '.YYYYYY...'],
    palette: { Y, D, L: colors.yellowHi, O: colors.orange },
  },
  tetris: {
    rows: ['....CCC...', '.....C....', '..........', 'OO..GG....', 'OPPPGGYYY.'],
    palette: { C, O: colors.orange, P, G, Y },
  },
  heart: {
    rows: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  },
} as const;
