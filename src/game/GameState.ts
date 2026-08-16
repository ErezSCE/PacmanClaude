/**
 * Central game state container: score, lives, level, pause, game-over flags.
 */
export class GameState {
  score = 0;
  lives = 3;
  level = 1;
  paused = false;
  gameOver = false;
  extraLifeAwarded = false;
}
