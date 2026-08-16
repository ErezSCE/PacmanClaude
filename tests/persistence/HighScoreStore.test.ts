import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getHighScores,
  saveHighScore,
  qualifiesForHighScore,
  type HighScoreEntry,
} from '../../src/persistence/HighScoreStore';

describe('HighScoreStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getHighScores', () => {
    it('[US-011#1] returns empty array when no high scores exist', () => {
      const scores = getHighScores();
      expect(scores).toEqual([]);
    });

    it('[US-011#2] returns saved high scores in descending order', () => {
      const entry1: HighScoreEntry = { initials: 'AAA', score: 1000 };
      const entry2: HighScoreEntry = { initials: 'BBB', score: 2000 };
      const entry3: HighScoreEntry = { initials: 'CCC', score: 500 };

      saveHighScore(entry1);
      saveHighScore(entry2);
      saveHighScore(entry3);

      const scores = getHighScores();
      expect(scores).toHaveLength(3);
      expect(scores[0].score).toBe(2000);
      expect(scores[1].score).toBe(1000);
      expect(scores[2].score).toBe(500);
    });

    it('[US-011#3] maintains only top 10 high scores', () => {
      // Add 12 scores
      for (let i = 1; i <= 12; i++) {
        const entry: HighScoreEntry = {
          initials: `P${i.toString().padStart(2, '0')}`,
          score: i * 1000,
        };
        saveHighScore(entry);
      }

      const scores = getHighScores();
      expect(scores).toHaveLength(10);
      // Should keep the top 10 (highest scores)
      expect(scores[0].score).toBe(12000);
      expect(scores[9].score).toBe(3000);
    });
  });

  describe('saveHighScore', () => {
    it('[US-011#4] saves a high score entry to localStorage', () => {
      const entry: HighScoreEntry = { initials: 'ABC', score: 5000 };
      saveHighScore(entry);

      const scores = getHighScores();
      expect(scores).toContainEqual(entry);
    });

    it('[US-011#5] persists high scores across function calls', () => {
      const entry1: HighScoreEntry = { initials: 'AAA', score: 1000 };
      const entry2: HighScoreEntry = { initials: 'BBB', score: 2000 };

      saveHighScore(entry1);
      const firstCall = getHighScores();
      expect(firstCall).toHaveLength(1);

      saveHighScore(entry2);
      const secondCall = getHighScores();
      expect(secondCall).toHaveLength(2);
    });
  });

  describe('qualifiesForHighScore', () => {
    it('[US-011#6] returns true when score is higher than lowest top-10 score', () => {
      // Add 5 scores
      for (let i = 1; i <= 5; i++) {
        const entry: HighScoreEntry = {
          initials: `P${i}`,
          score: i * 1000,
        };
        saveHighScore(entry);
      }

      // Score higher than the lowest (5000) should qualify
      expect(qualifiesForHighScore(6000)).toBe(true);
    });

    it('[US-011#7] returns true when fewer than 10 high scores exist', () => {
      // Add only 3 scores
      for (let i = 1; i <= 3; i++) {
        const entry: HighScoreEntry = {
          initials: `P${i}`,
          score: i * 1000,
        };
        saveHighScore(entry);
      }

      // Any score should qualify when list is not full
      expect(qualifiesForHighScore(100)).toBe(true);
    });

    it('[US-011#8] returns false when score is lower than lowest top-10 score', () => {
      // Add 10 scores
      for (let i = 1; i <= 10; i++) {
        const entry: HighScoreEntry = {
          initials: `P${i.toString().padStart(2, '0')}`,
          score: i * 1000,
        };
        saveHighScore(entry);
      }

      // Score lower than the lowest (10000) should not qualify
      expect(qualifiesForHighScore(5000)).toBe(false);
    });

    it('[US-011#9] returns true when score equals a top-10 score', () => {
      const entry: HighScoreEntry = { initials: 'AAA', score: 5000 };
      saveHighScore(entry);

      expect(qualifiesForHighScore(5000)).toBe(true);
    });
  });
});
