export interface ScoreEntry {
  id: string;
  date: string;
  score: number;
  category: string;
  personality: string;
}

export const saveScore = (score: number, category: string, personality: string) => {
  if (score === 0) return;
  const scores = getScores();
  scores.push({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    score,
    category,
    personality
  });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('trivia_scores', JSON.stringify(scores));
}

export const getScores = (): ScoreEntry[] => {
  try {
    const data = localStorage.getItem('trivia_scores');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
