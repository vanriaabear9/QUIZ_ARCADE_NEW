// Local sample data. Everything here stands in for a backend that is not chosen yet.
import { colors } from '@/theme';

export const quizSet = {
  title: 'Logic Gates Basics',
  questionCount: 10,
  teacher: '[Teacher name]',
};

export const subjects = ['Logic', 'Math', 'Science', 'Programming', 'English'];

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

export const mostMissed = [
  { label: 'XOR when inputs differ', pct: 0.72 },
  { label: 'NAND truth table row', pct: 0.54 },
  { label: 'NOT gate output', pct: 0.3 },
];

/** 5x5 player icons from the student lobby design. "#" is a filled pixel. Taken icons are tracked per class in the database. */
export const playerIcons = [
  { name: 'Alien', color: '#4ADE80', pat: '.#.#.#####.#.#.######...#' },
  { name: 'Ghost', color: '#E8ECFF', pat: '.###.######.#.#######.#.#' },
  { name: 'Heart', color: '#FF6B6B', pat: '##.############.###...#..' },
  { name: 'Star', color: '#FFD23F', pat: '..#...###.#####.###..#.#.' },
  { name: 'Robot', color: '#3DDCFF', pat: '######.#.######.#.#.##.##' },
  { name: 'Cat', color: '#FF9F43', pat: '#...###.########.#.#.###.' },
  { name: 'Sword', color: '#C084FC', pat: '....#...#.#.#...#...#.#..' },
  { name: 'Bolt', color: '#FFE27A', pat: '...##..##..####.##..##...' },
];

