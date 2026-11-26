// Quiz Arcade design tokens, taken from the "Quiz Arcade Draft Prototype" design.

export const colors = {
  bg: '#0E1022',
  card: '#181B33',
  cardRaised: '#2C3058',
  border: '#2C3058',
  deep: '#0A0C1A',
  well: '#0E1022',
  text: '#F4F4F8',
  soft: '#C9CCE4',
  muted: '#A7ABC8',
  dim: '#3A3F6B',
  yellow: '#FFD23F',
  yellowHi: '#FFE27A',
  cyan: '#3DDCFF',
  green: '#4ADE80',
  greenSoft: '#A7F3C0',
  red: '#FF6B6B',
  redSoft: '#FF8A8A',
  purple: '#C084FC',
  orange: '#FF9F43',
  white: '#E8ECFF',
  brown: '#C08457',
} as const;

export const fonts = {
  pixel: 'PressStart2P_400Regular',
  body: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  bold: 'SpaceGrotesk_700Bold',
} as const;

export const radius = { sm: 8, md: 10, lg: 14, xl: 16, pill: 999 } as const;

export const space = { gutter: 16, gap: 12 } as const;
