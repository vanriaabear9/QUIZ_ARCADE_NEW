import { useState } from 'react';

import type { Option } from '@/data/mock';

const PRAISE = ['Correct!', 'Nice one!', 'Great!'];

/** Shared answer state for the prototype games: score, streak and feedback text. */
export function useAnswers(options: Option[], points = 100) {
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [last, setLast] = useState<{ text: string; ok: boolean } | null>(null);

  function pick(o: Option) {
    if (used.has(o.id)) return o.ok;
    setUsed(new Set(used).add(o.id));
    if (o.ok) {
      const next = streak + 1;
      setStreak(next);
      setScore((s) => s + points * Math.max(1, next));
      setLast({ text: `${PRAISE[next % PRAISE.length]} ${o.label} is right`, ok: true });
    } else {
      setStreak(0);
      const answer = options.filter((x) => x.ok).map((x) => x.label).join(' / ');
      setLast({ text: `Not ${o.label}. Answer: ${answer}`, ok: false });
    }
    return o.ok;
  }

  function reset() {
    setUsed(new Set());
    setStreak(0);
    setLast(null);
  }

  return { used, score, streak, last, pick, reset };
}
