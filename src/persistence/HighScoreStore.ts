/**
 * Persists and retrieves the top-10 high score list (initials + score)
 * across sessions using localStorage.
 */

const STORAGE_KEY = 'pacman_high_scores';

export type HighScoreEntry = {
  initials: string;
  score: number;
};

/**
 * Retrieves the top-10 high scores from localStorage.
 */
export function getHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: HighScoreEntry[] = JSON.parse(raw);
    return parsed.slice(0, 10);
  } catch {
    return [];
  }
}

/**
 * Saves a new high score entry, keeping only the top 10.
 */
export function saveHighScore(entry: HighScoreEntry): void {
  const scores = getHighScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  const top10 = scores.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
}

/**
 * Returns true if the given score qualifies for the top-10 list.
 */
export function qualifiesForHighScore(score: number): boolean {
  const scores = getHighScores();
  if (scores.length < 10) return score > 0;
  return score > scores[scores.length - 1].score;
}
