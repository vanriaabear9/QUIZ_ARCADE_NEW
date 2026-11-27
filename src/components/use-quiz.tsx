import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { useAuth } from '@/components/auth';
import { Button, Card, T } from '@/components/ui';
import { questionsFor, SAMPLE_SUBJECT } from '@/data/question-bank';
import { useLiveQuery } from '@/db/live';
import { getQuizSet, recordScore } from '@/db/queries';
import { colors } from '@/theme';

export type Option = { id: string; label: string; ok: boolean };

const IDS = ['a', 'b', 'c', 'd'];
const PRAISE = ['Correct!', 'Nice one!', 'Great!'];

/**
 * Runs a quiz set inside a game: one question at a time, locked after the first answer,
 * then "Next question" until the last one. The set comes from the `?set=<quiz set id>` route param.
 */
export function useQuiz(points = 100) {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const { set } = useLocalSearchParams<{ set?: string }>();
  const setId = Number(set) || 0;
  const quizSet = useLiveQuery(`quiz-set:${setId}`, (db) => (setId ? getQuizSet(db, setId) : Promise.resolve(null)));

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [last, setLast] = useState<{ text: string; ok: boolean } | null>(null);

  const questions = questionsFor(quizSet?.bank);
  const title = quizSet?.title ?? `${SAMPLE_SUBJECT} sample`;
  const total = questions.length;
  const q = questions[Math.min(index, total - 1)];
  const options: Option[] = q.options.map((label, i) => ({ id: IDS[i], label, ok: i === q.answer }));
  const answered = picked !== null;
  const isLast = index >= total - 1;

  /** Answer the current question. Only the first answer counts. Returns whether it was right. */
  function pick(o: Option) {
    if (answered) return false;
    setPicked(o.id);
    if (o.ok) {
      const next = streak + 1;
      setStreak(next);
      setBestStreak((b) => Math.max(b, next));
      setCorrect((c) => c + 1);
      setScore((s) => s + points * next);
      setLast({ text: `${PRAISE[next % PRAISE.length]} ${o.label} is right`, ok: true });
    } else {
      setStreak(0);
      setLast({ text: `Not ${o.label}. Answer: ${q.options[q.answer]}`, ok: false });
    }
    return o.ok;
  }

  function next() {
    if (isLast) return;
    setIndex((i) => i + 1);
    setPicked(null);
    setLast(null);
  }

  async function showResults(game: string) {
    // Runs from a class quiz set count toward that class leaderboard.
    if (quizSet && user?.role === 'student' && score > 0) {
      try {
        await recordScore(db, { quizSetId: quizSet.id, studentId: user.id, game, score, correct, total });
      } catch {
        // A failed save should not block the results screen.
      }
    }
    router.push({
      pathname: '/results',
      params: {
        game,
        score: String(score),
        correct: String(correct),
        total: String(total),
        streak: String(bestStreak),
        set: title,
        ...(quizSet ? { classId: String(quizSet.class_id) } : {}),
      },
    });
  }

  return {
    /** False until the quiz set loads from the database. */
    ready: !setId || quizSet !== undefined,
    title,
    question: q,
    options,
    /** 1-based question number. */
    n: index + 1,
    total,
    picked,
    /** Same shape the games used before: the set of picked option ids. */
    used: new Set(picked ? [picked] : []),
    answered,
    isLast,
    score,
    streak,
    correct,
    last,
    pick,
    next,
    showResults,
  };
}

export type Quiz = ReturnType<typeof useQuiz>;

/** Shown once a question is answered: the explanation and "Next question" (or "See results" on the last one). */
export function NextQuestion({ quiz, game, onNext }: { quiz: Quiz; game: string; onNext?: () => void }) {
  if (!quiz.answered) return null;
  return (
    <Card borderColor={quiz.last?.ok ? colors.green : colors.red} style={{ gap: 12, padding: 14 }}>
      <T size={14} color={colors.soft}>
        {quiz.question.why}
      </T>
      {quiz.isLast ? (
        <Button label="See results" onPress={() => quiz.showResults(game)} />
      ) : (
        <Button
          label="Next question"
          onPress={() => {
            quiz.next();
            onNext?.();
          }}
        />
      )}
    </Card>
  );
}
