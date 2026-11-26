# Quiz Arcade

A retro arcade quiz app for class: students answer the teacher's quiz set inside mini games
(Snake, Space Invaders, Whack a Mole, Flappy, Tetris). Built with Expo SDK 58 (React Native 0.88)
and Expo Router, runs in **Expo Go**.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app (Android) or the Camera app (iOS).

## Status

UI prototype. All 10 screens from the design are built and tappable, using local sample data
in `src/data/mock.ts`. There is no backend yet, so join codes, lobbies and leaderboards do not
sync between phones. The demo join code is `K7Q2XM`.

## Screens

| Route | Screen |
|---|---|
| `/` | Arcade lobby |
| `/games/snake` `/games/invaders` `/games/mole` `/games/flappy` `/games/tetris` | Game screens |
| `/results` | Results and leaderboard |
| `/join` | Student join lobby (code, profile, waiting room) |
| `/teacher` | Teacher panel (add question, analytics) |
| `/teacher/host` | Host a game, generate join code |

## Layout

- `src/app/` routes (every file is a screen)
- `src/components/ui.tsx` shared building blocks (cards, buttons, chips, stat cards, top bar)
- `src/components/pixel.tsx` pixel art drawn with Views (logo, game art, player icons)
- `src/theme.ts` colors and fonts (Press Start 2P + Space Grotesk)
- `src/data/mock.ts` sample questions and placeholders

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
