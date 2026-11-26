// Local sample data. Everything here stands in for a backend that is not chosen yet.
import { colors } from '@/theme';

export type Option = { id: string; label: string; ok: boolean };

export const quizSet = {
  title: 'Logic Gates Basics',
  questionCount: 10,
  teacher: '[Teacher name]',
};

export const subjects = ['Logic', 'Math', 'Science', 'Programming', 'English'];

export const quizSets = [
  'Logic Gates Basics (10 questions)',
  'Number Systems (12 questions)',
  'Boolean Algebra (8 questions)',
];

export const hostGames = ['Snake', 'Invaders', 'Whack a Mole', 'Flappy', 'Tetris', 'Student choice'];

export type GameId = 'snake' | 'invaders' | 'mole' | 'flappy' | 'tetris';

export const games: {
  id: GameId;
  title: string;
  blurb: string;
  accent: string;
}[] = [
  { id: 'snake', title: 'Snake Quiz', blurb: 'Eat the food with the right answer to grow.', accent: colors.green },
  { id: 'invaders', title: 'Space Invaders Quiz', blurb: 'Shoot the alien carrying the right answer.', accent: colors.purple },
  { id: 'mole', title: 'Whack a Mole Quiz', blurb: 'Hit only the moles holding correct answers.', accent: colors.orange },
  { id: 'flappy', title: 'Flappy Quiz', blurb: 'Fly through the pipe gap with the right answer.', accent: colors.cyan },
  { id: 'tetris', title: 'Tetris Quiz', blurb: 'Answer right to clear a row when blocks stack up.', accent: colors.purple },
];

export const questions = {
  snake: {
    n: 4,
    text: 'Which gate outputs 1 only when both inputs are 1?',
    options: [
      { id: 'a', label: 'AND', ok: true },
      { id: 'b', label: 'OR', ok: false },
      { id: 'c', label: 'XOR', ok: false },
      { id: 'd', label: 'NOR', ok: false },
    ],
  },
  invaders: {
    n: 6,
    text: 'Convert binary 1010 to decimal.',
    options: [
      { id: 'a', label: '8', ok: false },
      { id: 'b', label: '10', ok: true },
      { id: 'c', label: '12', ok: false },
      { id: 'd', label: '5', ok: false },
    ],
  },
  mole: {
    n: 7,
    text: 'Whack every universal gate!',
    options: [
      { id: 'a', label: 'NAND', ok: true },
      { id: 'b', label: 'AND', ok: false },
      { id: 'c', label: 'XOR', ok: false },
      { id: 'd', label: 'NOR', ok: true },
      { id: 'e', label: 'OR', ok: false },
    ],
  },
  flappy: {
    n: 3,
    text: 'How many bits are in one byte?',
    options: [
      { id: 'a', label: '4', ok: false },
      { id: 'b', label: '8', ok: true },
      { id: 'c', label: '16', ok: false },
    ],
  },
  tetris: {
    n: 5,
    text: 'What is binary 1111 in hexadecimal?',
    options: [
      { id: 'a', label: 'F', ok: true },
      { id: 'b', label: 'E', ok: false },
      { id: 'c', label: '15', ok: false },
      { id: 'd', label: 'A', ok: false },
    ],
  },
} satisfies Record<GameId, { n: number; text: string; options: Option[] }>;

export const mistakes = [
  {
    q: 'Which gate outputs 1 when inputs are different?',
    yours: 'OR',
    correct: 'XOR',
    why: 'XOR gives 1 only when exactly one input is 1.',
  },
  {
    q: 'What does a NOT gate do to an input of 1?',
    yours: '1',
    correct: '0',
    why: 'A NOT gate flips the input.',
  },
];

export const leaderboard = [1, 2, 3, 4, 5].map((rank) => ({
  rank,
  name: '[Player]',
  score: '[score]',
}));

export const mostMissed = [
  { label: 'XOR when inputs differ', pct: 0.72 },
  { label: 'NAND truth table row', pct: 0.54 },
  { label: 'NOT gate output', pct: 0.3 },
];

/** 5x5 player icons from the student lobby design. '#' is a filled pixel. */
export const playerIcons = [
  { name: 'Alien', color: '#4ADE80', pat: '.#.#.#####.#.#.######...#', taken: false },
  { name: 'Ghost', color: '#E8ECFF', pat: '.###.######.#.#######.#.#', taken: true },
  { name: 'Heart', color: '#FF6B6B', pat: '##.############.###...#..', taken: true },
  { name: 'Star', color: '#FFD23F', pat: '..#...###.#####.###..#.#.', taken: false },
  { name: 'Robot', color: '#3DDCFF', pat: '######.#.######.#.#.##.##', taken: false },
  { name: 'Cat', color: '#FF9F43', pat: '#...###.########.#.#.###.', taken: false },
  { name: 'Sword', color: '#C084FC', pat: '....#...#.#.#...#...#.#..', taken: false },
  { name: 'Bolt', color: '#FFE27A', pat: '...##..##..####.##..##...', taken: false },
];

export const DEMO_CODE = 'K7Q2XM';
