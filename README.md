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

Prototype with local accounts. Students and teachers sign up and log in; accounts, classes, members,
quiz sets and live games are saved in an on-device SQLite database (`expo-sqlite`). Passwords are
stored as salted, iterated SHA-256 hashes (`expo-crypto`), never as plain text.

Everything lives on one phone. A teacher on one phone and a student on another do not see each
other yet; that needs a server.

Class leaderboards are real: every finished run from a class lobby is saved, and the board ranks
each student by their best single run in the last 7 days (Results can filter to one game).

Every game plays a 10 question quiz set one question at a time: answer, read the explanation,
then **Next question** until the last one, which goes to results. The sample questions (10 each for
Logic, Math, Science, Programming and English) live in `src/data/question-bank.ts`. Quiz sets a
teacher creates have no saved questions yet, so they play the Logic sample.

Every class has one 6 character code that students enter once. The ready-made open class
**Teacher Van** (code `VANFUN`) is open to every student and has one quiz set per subject.

## Screens

| Route | Screen |
|---|---|
| `/` | Landing: I'm a student / I'm a teacher |
| `/login?role=student\|teacher` | Log in and sign up |
| `/student` | Student: my classes, join a class, Teacher Van "Join for fun" |
| `/student/join` | Join flow (code, profile, joined) |
| `/student/class/[id]` | Arcade lobby for one class |
| `/games/snake` `/games/invaders` `/games/mole` `/games/flappy` `/games/tetris` | Game screens |
| `/results` | Results and leaderboard |
| `/teacher` | Teacher: my classes |
| `/teacher/create` | Create class |
| `/teacher/class/[id]` | Class page: code, students, accept switch, quiz sets |
| `/teacher/host` | Host a game for a class |
| `/teacher/questions` | Question editor (add question, most missed) |

## Layout

- `src/app/` routes (every file is a screen)
- `src/db/` SQLite schema and seed data, queries, password hashing, live query hook
- `src/components/use-quiz.tsx` runs a quiz set inside a game (answer, Next question, results)
- `src/components/auth.tsx` logged-in user context; `role-stack.tsx` guards the student and teacher routes
- `src/components/ui.tsx` shared building blocks (cards, buttons, chips, fields, steps, code tiles)
- `src/components/pixel.tsx` pixel art drawn with Views (logo, game art, player icons)
- `src/theme.ts` colors and fonts (Press Start 2P + Space Grotesk)
- `src/data/question-bank.ts` sample questions per subject
- `src/data/mock.ts` games, player icons and placeholders

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
