export const POINTS = {
  DOT: 10,
  POWER_PELLET: 50,
  GHOST_SEQUENCE: [200, 400, 800, 1600] as const,
  EXTRA_LIFE_THRESHOLD: 10_000,
} as const;

/**
 * Tracks score, lives, level, ghost-eat combo, and extra-life award.
 */
export class ScoreManager {
  score = 0;
  lives = 3;
  level = 1;
  extraLifeAwarded = false;
  highScore = 0;

  /** Number of ghosts eaten during the current power pellet. */
  private ghostCombo = 0;

  /** Called when a dot is eaten. */
  addDotPoints(): number {
    this.score += POINTS.DOT;
    this.checkExtraLife();
    return POINTS.DOT;
  }

  /** Called when a power pellet is eaten. Resets ghost combo. */
  addPelletPoints(): number {
    this.score += POINTS.POWER_PELLET;
    this.ghostCombo = 0;
    this.checkExtraLife();
    return POINTS.POWER_PELLET;
  }

  /** Called when a frightened ghost is eaten. Returns points awarded. */
  addGhostPoints(): number {
    const idx = Math.min(this.ghostCombo, POINTS.GHOST_SEQUENCE.length - 1);
    const pts = POINTS.GHOST_SEQUENCE[idx];
    this.score += pts;
    this.ghostCombo++;
    this.checkExtraLife();
    return pts;
  }

  /** Called when fruit is collected. */
  addFruitPoints(pts: number): number {
    this.score += pts;
    this.checkExtraLife();
    return pts;
  }

  /** Called when Pac-Man dies. Returns true if game over (0 lives). */
  loseLife(): boolean {
    this.lives--;
    return this.lives <= 0;
  }

  /** Advance to the next level. */
  nextLevel(): void {
    this.level++;
    this.ghostCombo = 0;
  }

  /** Reset the ghost combo counter (e.g. when frightened mode ends naturally). */
  resetGhostCombo(): void {
    this.ghostCombo = 0;
  }

  /** Update the high score if current score exceeds it. */
  updateHighScore(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  /** Reset for a new game. */
  reset(): void {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.extraLifeAwarded = false;
    this.ghostCombo = 0;
  }

  private checkExtraLife(): void {
    if (!this.extraLifeAwarded && this.score >= POINTS.EXTRA_LIFE_THRESHOLD) {
      this.extraLifeAwarded = true;
      this.lives++;
    }
    this.updateHighScore();
  }
}
