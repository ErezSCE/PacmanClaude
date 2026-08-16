import { describe, it, expect, beforeEach } from 'vitest';
import {
  getHighScores,
  saveHighScore,
  qualifiesForHighScore,
  type HighScoreEntry,
} from '../../src/persistence/HighScoreStore';

describe('HighScoreStore', () => {
  // Global setup in tests/setup.ts already clears localStorage in beforeEach,
  // so no manual clearing needed here.

  describe('[US-011#1] getHighScores returns empty array when no scores exist', () => {
    it('should return an empty array on first call', () => {
      const scores = getHighScores();
      expect(scores).toEqual([]);
    });
  });

  describe('[US-011#2] saveHighScore persists a single entry to localStorage', () => {
    it('should save a high score entry and retrieve it', () => {
      const entry: HighScoreEntry = { initials: 'ABC', score: 1000 };
      saveHighScore(entry);

      const scores = getHighScores();
      expect(scores).toHaveLength(1);
      expect(scores[0]).toEqual(entry);
    });
  });

  describe('[US-011#3] saveHighScore maintains top-10 sorting by score descending', () => {
    it('should keep scores sorted in descending order', () => {
      saveHighScore({ initials: 'AAA', score: 500 });
      saveHighScore({ initials: 'BBB', score: 1500 });
      saveHighScore({ initials: 'CCC', score: 1000 });

      const scores = getHighScores();
      expect(scores).toHaveLength(3);
      expect(scores[0].score).toBe(1500);
      expect(scores[1].score).toBe(1000);
      expect(scores[2].score).toBe(500);
    });
  });

  describe('[US-011#4] saveHighScore enforces 10-entry cap', () => {
    it('should keep only top 10 scores when more are added', () => {
      // Add 12 scores with valid 3-character initials
      for (let i = 0; i < 12; i++) {
        const initials = String.fromCharCode(65 + i).repeat(3); // AAA, BBB, CCC, etc.
        saveHighScore({
          initials,
          score: 1000 + i * 100,
        });
      }

      const scores = getHighScores();
      expect(scores).toHaveLength(10);
      // Lowest score should be 1200 (the 11th highest score added)
      expect(scores[9].score).toBe(1200);
    });
  });

  describe('[US-011#5] qualifiesForHighScore returns true for scores in top 10', () => {
    it('should return true when list has fewer than 10 entries', () => {
      saveHighScore({ initials: 'AAA', score: 1000 });
      expect(qualifiesForHighScore(500)).toBe(true);
    });

    it('should return true when score beats the 10th place', () => {
      // Fill with 10 scores: 1000, 1100, 1200, ..., 1900
      for (let i = 0; i < 10; i++) {
        const initials = String.fromCharCode(65 + i).repeat(3); // AAA, BBB, CCC, etc.
        saveHighScore({
          initials,
          score: 1000 + i * 100,
        });
      }

      expect(qualifiesForHighScore(1950)).toBe(true);
    });

    it('should return false when score does not beat 10th place', () => {
      // Fill with 10 scores: 1000, 1100, 1200, ..., 1900
      for (let i = 0; i < 10; i++) {
        const initials = String.fromCharCode(65 + i).repeat(3); // AAA, BBB, CCC, etc.
        saveHighScore({
          initials,
          score: 1000 + i * 100,
        });
      }

      expect(qualifiesForHighScore(900)).toBe(false);
    });

    it('should return false for zero score when list has fewer than 10 entries', () => {
      saveHighScore({ initials: 'AAA', score: 1000 });
      expect(qualifiesForHighScore(0)).toBe(false);
    });

    it('should return false for zero score when list has 10 entries', () => {
      for (let i = 0; i < 10; i++) {
        saveHighScore({
          initials: String.fromCharCode(65 + i),
          score: 1000 + i * 100,
        });
      }

      expect(qualifiesForHighScore(0)).toBe(false);
    });
  });

  describe('[US-011#6] saveHighScore handles corrupted localStorage gracefully', () => {
    it('should recover from invalid JSON in localStorage', () => {
      localStorage.setItem('pacman_high_scores', 'invalid json {]');

      // Should not throw and should treat as empty
      const scores = getHighScores();
      expect(scores).toEqual([]);

      // Should be able to save new scores
      saveHighScore({ initials: 'ABC', score: 1000 });
      const newScores = getHighScores();
      expect(newScores).toHaveLength(1);
      expect(newScores[0]).toEqual({ initials: 'ABC', score: 1000 });
    });
  });

  describe('[US-011#7] saveHighScore handles duplicate initials', () => {
    it('should allow multiple entries with the same initials', () => {
      saveHighScore({ initials: 'ABC', score: 1000 });
      saveHighScore({ initials: 'ABC', score: 2000 });

      const scores = getHighScores();
      expect(scores).toHaveLength(2);
      expect(scores[0]).toEqual({ initials: 'ABC', score: 2000 });
      expect(scores[1]).toEqual({ initials: 'ABC', score: 1000 });
    });
  });

  describe('[US-011#8] saveHighScore persists across multiple calls', () => {
    it('should accumulate scores across multiple saves', () => {
      saveHighScore({ initials: 'AAA', score: 1000 });
      expect(getHighScores()).toHaveLength(1);

      saveHighScore({ initials: 'BBB', score: 2000 });
      expect(getHighScores()).toHaveLength(2);

      saveHighScore({ initials: 'CCC', score: 1500 });
      const scores = getHighScores();
      expect(scores).toHaveLength(3);
      expect(scores[0].score).toBe(2000);
    });
  });

  describe('[US-011#9] qualifiesForHighScore edge case: score equals 10th place', () => {
    it('should return false when score equals the 10th place score', () => {
      // Fill with 10 scores: 1000, 1100, 1200, ..., 1900
      for (let i = 0; i < 10; i++) {
        saveHighScore({
          initials: String.fromCharCode(65 + i).repeat(3), // "AAA", "BBB", "CCC", etc.
          score: 1000 + i * 100,
        });
      }

      // 10th place is 1000, so equal score should not qualify
      expect(qualifiesForHighScore(1000)).toBe(false);
    });
  });

  describe('[US-011#10] getHighScores returns correct order after multiple operations', () => {
    it('should maintain correct order after mixed save operations', () => {
      saveHighScore({ initials: 'ZZZ', score: 5000 });
      saveHighScore({ initials: 'AAA', score: 1000 });
      saveHighScore({ initials: 'MMM', score: 3000 });
      saveHighScore({ initials: 'BBB', score: 2000 });

      const scores = getHighScores();
      expect(scores.map((s) => s.score)).toEqual([5000, 3000, 2000, 1000]);
    });
  });
});
