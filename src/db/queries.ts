import type { SQLiteDatabase } from 'expo-sqlite';

import { notifyChange } from '@/db/live';
import { hashPassword, HASH_ROUNDS, makeSalt } from '@/db/password';

export type Role = 'student' | 'teacher';
export type User = { id: number; role: Role; full_name: string; username: string };

export type ClassInfo = {
  id: number;
  teacher_id: number | null;
  teacher_name: string;
  name: string;
  subject: string;
  section: string;
  /** 0 means no limit. */
  max_students: number;
  code: string;
  accepting: boolean;
  is_open: boolean;
  student_count: number;
};

export type StudentClass = ClassInfo & { nickname: string; icon: string };
export type Member = { student_id: number; nickname: string; icon: string; joined_at: number };
/** `bank` names a sample question bank (see src/data/question-bank.ts); null for teacher-made sets. */
export type QuizSet = { id: number; class_id: number; title: string; question_count: number; bank: string | null };
export type LiveGame = { class_id: number; game: string; quiz_set_id: number | null; started_at: number };

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string; field?: string };

/* ---------- Accounts ---------- */

export const USERNAME_RULE = /^[a-z0-9_.]{3,20}$/;
export const MIN_PASSWORD = 6;

export function normalizeUsername(u: string) {
  return u.trim().toLowerCase();
}

const roleName = (r: Role) => (r === 'teacher' ? 'teacher' : 'student');

export async function signUp(
  db: SQLiteDatabase,
  f: { role: Role; fullName: string; username: string; password: string; confirm: string },
): Promise<Result<{ user: User }>> {
  const fullName = f.fullName.trim().replace(/\s+/g, ' ');
  const username = normalizeUsername(f.username);
  if (fullName.length < 2) return { ok: false, field: 'fullName', error: 'Enter your full name.' };
  if (!USERNAME_RULE.test(username))
    return { ok: false, field: 'username', error: 'Username must be 3 to 20 letters, numbers, dots or underscores.' };
  if (f.password.length < MIN_PASSWORD)
    return { ok: false, field: 'password', error: `Password must be at least ${MIN_PASSWORD} characters.` };
  if (f.password !== f.confirm) return { ok: false, field: 'confirm', error: 'Passwords do not match.' };

  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM users WHERE username = ?', username);
  if (existing) return { ok: false, field: 'username', error: 'That username is already taken. Try another one.' };

  const salt = makeSalt();
  const hash = await hashPassword(f.password, salt);
  const r = await db.runAsync(
    `INSERT INTO users (role, full_name, username, password_hash, salt, hash_rounds, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    f.role, fullName, username, hash, salt, HASH_ROUNDS, Date.now(),
  );
  const user: User = { id: r.lastInsertRowId, role: f.role, full_name: fullName, username };
  await saveSession(db, user.id);
  return { ok: true, user };
}

export async function logIn(
  db: SQLiteDatabase,
  f: { role: Role; username: string; password: string },
): Promise<Result<{ user: User }>> {
  const username = normalizeUsername(f.username);
  if (!username) return { ok: false, field: 'username', error: 'Enter your username.' };
  if (!f.password) return { ok: false, field: 'password', error: 'Enter your password.' };

  const row = await db.getFirstAsync<User & { password_hash: string; salt: string; hash_rounds: number }>(
    'SELECT * FROM users WHERE username = ?',
    username,
  );
  if (!row) return { ok: false, field: 'username', error: 'No account uses that username. Check it or sign up.' };

  const hash = await hashPassword(f.password, row.salt, row.hash_rounds);
  if (hash !== row.password_hash) return { ok: false, field: 'password', error: 'Wrong password. Try again.' };

  // Only say which side the account belongs to once the password is right.
  if (row.role !== f.role) {
    return {
      ok: false,
      field: 'role',
      error: `This is a ${roleName(row.role)} account. Log in on the ${roleName(row.role)} side instead.`,
    };
  }

  const user: User = { id: row.id, role: row.role, full_name: row.full_name, username: row.username };
  await saveSession(db, user.id);
  return { ok: true, user };
}

async function saveSession(db: SQLiteDatabase, userId: number) {
  await db.runAsync('INSERT OR REPLACE INTO session (id, user_id) VALUES (1, ?)', userId);
}

export async function getSessionUser(db: SQLiteDatabase) {
  return db.getFirstAsync<User>(
    `SELECT u.id, u.role, u.full_name, u.username FROM session s JOIN users u ON u.id = s.user_id WHERE s.id = 1`,
  );
}

export async function logOut(db: SQLiteDatabase) {
  await db.runAsync('DELETE FROM session');
}

/* ---------- Classes ---------- */

// No 0/O or 1/I so codes are easy to read off a projector.
export const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

export function makeCode(random = Math.random) {
  return Array.from({ length: CODE_LENGTH }, () => CODE_CHARS[Math.floor(random() * CODE_CHARS.length)]).join('');
}

const CLASS_SELECT = `
  SELECT c.id, c.teacher_id, c.name, c.subject, c.section, c.max_students, c.code, c.accepting, c.is_open,
    COALESCE(u.full_name, c.owner_name, '') AS teacher_name,
    (SELECT COUNT(*) FROM members m WHERE m.class_id = c.id) AS student_count
  FROM classes c LEFT JOIN users u ON u.id = c.teacher_id`;

type RawClass = Omit<ClassInfo, 'accepting' | 'is_open'> & { accepting: number; is_open: number };
/** SQLite stores booleans as 0/1. */
function toClass<T extends RawClass>(r: T): Omit<T, 'accepting' | 'is_open'> & { accepting: boolean; is_open: boolean } {
  return { ...r, accepting: !!r.accepting, is_open: !!r.is_open };
}

export async function getClass(db: SQLiteDatabase, id: number) {
  const r = await db.getFirstAsync<RawClass>(`${CLASS_SELECT} WHERE c.id = ?`, id);
  return r ? toClass(r) : null;
}

export async function getOpenClass(db: SQLiteDatabase) {
  const r = await db.getFirstAsync<RawClass>(`${CLASS_SELECT} WHERE c.is_open = 1 ORDER BY c.id LIMIT 1`);
  return r ? toClass(r) : null;
}

export async function teacherClasses(db: SQLiteDatabase, teacherId: number) {
  const rows = await db.getAllAsync<RawClass>(`${CLASS_SELECT} WHERE c.teacher_id = ? ORDER BY c.created_at DESC`, teacherId);
  return rows.map(toClass);
}

export async function studentClasses(db: SQLiteDatabase, studentId: number): Promise<StudentClass[]> {
  const rows = await db.getAllAsync<RawClass & { nickname: string; icon: string }>(
    `SELECT x.*, me.nickname, me.icon FROM (${CLASS_SELECT}) x
     JOIN members me ON me.class_id = x.id AND me.student_id = ?
     ORDER BY me.joined_at DESC`,
    studentId,
  );
  return rows.map(toClass);
}

export async function createClass(
  db: SQLiteDatabase,
  teacherId: number,
  f: { name: string; subject: string; section: string; maxStudents: string },
): Promise<Result<{ id: number; code: string }>> {
  const name = f.name.trim();
  const subject = f.subject.trim();
  const section = f.section.trim();
  const max = Number(f.maxStudents);
  if (name.length < 2) return { ok: false, field: 'name', error: 'Give the class a name.' };
  if (!subject) return { ok: false, field: 'subject', error: 'Enter the subject.' };
  if (!section) return { ok: false, field: 'section', error: 'Enter the section, e.g. BSCPE 1-G.' };
  if (!Number.isInteger(max) || max < 1 || max > 500)
    return { ok: false, field: 'maxStudents', error: 'Max students must be a number from 1 to 500.' };

  let code = makeCode();
  while (await db.getFirstAsync('SELECT 1 FROM classes WHERE code = ?', code)) code = makeCode();

  const r = await db.runAsync(
    `INSERT INTO classes (teacher_id, name, subject, section, max_students, code, accepting, is_open, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?)`,
    teacherId, name, subject, section, max, code, Date.now(),
  );
  notifyChange();
  return { ok: true, id: r.lastInsertRowId, code };
}

export async function setAccepting(db: SQLiteDatabase, classId: number, accepting: boolean) {
  await db.runAsync('UPDATE classes SET accepting = ? WHERE id = ?', accepting ? 1 : 0, classId);
  notifyChange();
}

/* ---------- Members ---------- */

export async function classMembers(db: SQLiteDatabase, classId: number) {
  return db.getAllAsync<Member>(
    'SELECT student_id, nickname, icon, joined_at FROM members WHERE class_id = ? ORDER BY joined_at',
    classId,
  );
}

export async function getMembership(db: SQLiteDatabase, classId: number, studentId: number) {
  return db.getFirstAsync<Member>(
    'SELECT student_id, nickname, icon, joined_at FROM members WHERE class_id = ? AND student_id = ?',
    classId, studentId,
  );
}

function isFull(c: ClassInfo) {
  return c.max_students > 0 && c.student_count >= c.max_students;
}

/** Step 1 of joining: is this code a class the student can join right now? */
export async function checkCode(
  db: SQLiteDatabase,
  rawCode: string,
  studentId: number,
): Promise<Result<{ cls: ClassInfo }> & { alreadyIn?: number }> {
  const code = rawCode.trim().toUpperCase();
  const r = await db.getFirstAsync<RawClass>(`${CLASS_SELECT} WHERE c.code = ?`, code);
  if (!r) return { ok: false, error: 'No class uses that code. Check it with your teacher.' };
  const cls = toClass(r);
  if (await getMembership(db, cls.id, studentId))
    return { ok: false, error: `You are already in ${cls.name}.`, alreadyIn: cls.id };
  if (!cls.accepting) return { ok: false, error: `${cls.name} is not accepting new students right now.` };
  if (isFull(cls)) return { ok: false, error: `${cls.name} is full (${cls.max_students} students).` };
  return { ok: true, cls };
}

export async function joinClass(
  db: SQLiteDatabase,
  f: { classId: number; studentId: number; nickname: string; icon: string },
): Promise<Result> {
  const nickname = f.nickname.trim().replace(/\s+/g, ' ');
  const cls = await getClass(db, f.classId);
  if (!cls) return { ok: false, error: 'That class no longer exists.' };
  if (await getMembership(db, cls.id, f.studentId)) return { ok: true };
  if (!cls.accepting) return { ok: false, error: `${cls.name} stopped accepting new students.` };
  if (isFull(cls)) return { ok: false, error: `${cls.name} is full.` };
  if (nickname.length < 2) return { ok: false, field: 'nickname', error: 'Nickname needs at least 2 characters.' };
  if (await db.getFirstAsync('SELECT 1 FROM members WHERE class_id = ? AND nickname = ?', cls.id, nickname))
    return { ok: false, field: 'nickname', error: 'Someone in this class already uses that nickname.' };
  if (await db.getFirstAsync('SELECT 1 FROM members WHERE class_id = ? AND icon = ?', cls.id, f.icon))
    return { ok: false, field: 'icon', error: 'That icon was just taken. Pick another one.' };

  await db.runAsync(
    'INSERT INTO members (class_id, student_id, nickname, icon, joined_at) VALUES (?, ?, ?, ?, ?)',
    cls.id, f.studentId, nickname, f.icon, Date.now(),
  );
  notifyChange();
  return { ok: true };
}

export async function removeMember(db: SQLiteDatabase, classId: number, studentId: number) {
  await db.runAsync('DELETE FROM members WHERE class_id = ? AND student_id = ?', classId, studentId);
  notifyChange();
}

/* ---------- Quiz sets and live games ---------- */

export async function quizSets(db: SQLiteDatabase, classId: number) {
  return db.getAllAsync<QuizSet>(
    'SELECT id, class_id, title, question_count, bank FROM quiz_sets WHERE class_id = ? ORDER BY created_at, id',
    classId,
  );
}

export async function getQuizSet(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<QuizSet>('SELECT id, class_id, title, question_count, bank FROM quiz_sets WHERE id = ?', id);
}

export async function addQuizSet(db: SQLiteDatabase, classId: number, title: string, count: string): Promise<Result> {
  const t = title.trim();
  const n = Number(count || '0');
  if (t.length < 2) return { ok: false, field: 'title', error: 'Give the quiz set a title.' };
  if (!Number.isInteger(n) || n < 0 || n > 200) return { ok: false, field: 'count', error: 'Questions must be 0 to 200.' };
  await db.runAsync(
    'INSERT INTO quiz_sets (class_id, title, question_count, created_at) VALUES (?, ?, ?, ?)',
    classId, t, n, Date.now(),
  );
  notifyChange();
  return { ok: true };
}

/* ---------- Scores and leaderboards ---------- */

export type LeaderRow = { student_id: number; nickname: string; icon: string; score: number; rank: number };

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Saves a finished run. Only counts for students who are in the quiz set's class. */
export async function recordScore(
  db: SQLiteDatabase,
  f: { quizSetId: number; studentId: number; game: string; score: number; correct: number; total: number },
) {
  const set = await getQuizSet(db, f.quizSetId);
  if (!set || !(await getMembership(db, set.class_id, f.studentId))) return false;
  await db.runAsync(
    `INSERT INTO scores (class_id, student_id, quiz_set_id, game, score, correct, total, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    set.class_id, f.studentId, set.id, f.game, f.score, f.correct, f.total, Date.now(),
  );
  notifyChange();
  return true;
}

/**
 * Each student's best single run in the class since `since`, highest first.
 * Pass `game` to rank one game only. Students who left the class drop off the board.
 */
export async function leaderboard(
  db: SQLiteDatabase,
  classId: number,
  opts: { since?: number; game?: string; limit?: number } = {},
): Promise<LeaderRow[]> {
  const since = opts.since ?? Date.now() - WEEK_MS;
  const rows = await db.getAllAsync<Omit<LeaderRow, 'rank'>>(
    `SELECT m.student_id, m.nickname, m.icon, MAX(s.score) AS score
     FROM scores s
     JOIN members m ON m.class_id = s.class_id AND m.student_id = s.student_id
     WHERE s.class_id = ? AND s.created_at >= ? AND (? IS NULL OR s.game = ?)
     GROUP BY m.student_id
     ORDER BY score DESC, MIN(s.created_at) ASC
     LIMIT ?`,
    classId, since, opts.game ?? null, opts.game ?? null, opts.limit ?? 5,
  );
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

export async function getLiveGame(db: SQLiteDatabase, classId: number) {
  return db.getFirstAsync<LiveGame>('SELECT * FROM live_games WHERE class_id = ?', classId);
}

export async function startLiveGame(db: SQLiteDatabase, classId: number, game: string, quizSetId: number | null) {
  await db.runAsync(
    'INSERT OR REPLACE INTO live_games (class_id, game, quiz_set_id, started_at) VALUES (?, ?, ?, ?)',
    classId, game, quizSetId, Date.now(),
  );
  notifyChange();
}

export async function endLiveGame(db: SQLiteDatabase, classId: number) {
  await db.runAsync('DELETE FROM live_games WHERE class_id = ?', classId);
  notifyChange();
}
