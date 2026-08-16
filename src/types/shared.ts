/** Cardinal direction for entity movement. */
export type Direction = 'up' | 'down' | 'left' | 'right';

/** Tile content in the maze grid. */
export type Tile =
  | 'wall'
  | 'corridor'
  | 'dot'
  | 'power-pellet'
  | 'tunnel'
  | 'ghost-house'
  | 'empty';

/** Ghost character names. */
export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

/** Ghost behavioral mode. */
export type GhostMode = 'chase' | 'scatter' | 'frightened' | 'eyes';
