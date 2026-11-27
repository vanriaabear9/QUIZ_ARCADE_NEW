import type { SQLiteDatabase } from 'expo-sqlite';

import { questionBank, type Subject } from '@/data/question-bank';

export const DATABASE_NAME = 'quiz-arcade.db';
const DATABASE_VERSION = 3;

/** The ready-made open class every student can join without a teacher's code. */
export const OPEN_CLASS = {
  name: 'Teacher Van',
  owner: 'Teacher Van',
  subject: 'Just for fun',
  section: 'Open class',
  code: 'VANFUN',
  /** One quiz set per subject. `bank` points at the questions in src/data/question-bank.ts. */
  quizSets: [
    { title: 'Logic Gates Basics', bank: 'Logic' },
    { title: 'Math Warm-up', bank: 'Math' },
    { title: 'Science Facts', bank: 'Science' },
    { title: 'Programming Basics', bank: 'Programming' },
    { title: 'English Grammar', bank: 'English' },
  ] satisfies { title: string; bank: Subject }[],
};

/** Runs before the app renders. Creates the tables on first launch and seeds the open class. */
export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Foreign keys are off by default and apply per connection, so turn them on every launch.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  if (current >= DATABASE_VERSION) return;

  if (current === 0) {
    await db.execAsync(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
        full_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        hash_rounds INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        owner_name TEXT,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        section TEXT NOT NULL,
        max_students INTEGER NOT NULL DEFAULT 0,
        code TEXT NOT NULL UNIQUE,
        accepting INTEGER NOT NULL DEFAULT 1,
        is_open INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE members (
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nickname TEXT NOT NULL COLLATE NOCASE,
        icon TEXT NOT NULL,
        joined_at INTEGER NOT NULL,
        PRIMARY KEY (class_id, student_id),
        UNIQUE (class_id, nickname),
        UNIQUE (class_id, icon)
      );

      CREATE TABLE quiz_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        question_count INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE live_games (
        class_id INTEGER PRIMARY KEY REFERENCES classes(id) ON DELETE CASCADE,
        game TEXT NOT NULL,
        quiz_set_id INTEGER REFERENCES quiz_sets(id) ON DELETE SET NULL,
        started_at INTEGER NOT NULL
      );

      CREATE TABLE session (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await db.runAsync(
      `INSERT INTO classes (teacher_id, owner_name, name, subject, section, max_students, code, accepting, is_open, created_at)
       VALUES (NULL, ?, ?, ?, ?, 0, ?, 1, 1, ?)`,
      OPEN_CLASS.owner, OPEN_CLASS.name, OPEN_CLASS.subject, OPEN_CLASS.section, OPEN_CLASS.code, Date.now(),
    );
  }

  if (current < 2) {
    // Version 2: quiz sets can point at a bank of sample questions, and the open class
    // gets one 10 question set per subject (replacing the version 1 placeholder sets).
    await db.execAsync('ALTER TABLE quiz_sets ADD COLUMN bank TEXT');
    const open = await db.getFirstAsync<{ id: number }>('SELECT id FROM classes WHERE is_open = 1 ORDER BY id LIMIT 1');
    if (open) {
      await db.runAsync('DELETE FROM quiz_sets WHERE class_id = ?', open.id);
      const now = Date.now();
      for (const [i, s] of OPEN_CLASS.quizSets.entries()) {
        await db.runAsync(
          'INSERT INTO quiz_sets (class_id, title, question_count, bank, created_at) VALUES (?, ?, ?, ?, ?)',
          open.id, s.title, questionBank[s.bank].length, s.bank, now + i,
        );
      }
    }
  }

  if (current < 3) {
    // Version 3: every finished run is saved so class leaderboards show real players.
    await db.execAsync(`
      CREATE TABLE scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quiz_set_id INTEGER REFERENCES quiz_sets(id) ON DELETE SET NULL,
        game TEXT NOT NULL,
        score INTEGER NOT NULL,
        correct INTEGER NOT NULL,
        total INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX scores_by_class ON scores (class_id, created_at);
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
