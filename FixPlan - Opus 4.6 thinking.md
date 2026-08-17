---
agent: devin-local
session: wobbly-lychee
created: 2026-08-16T21:21:34Z
---
# Pac-Man App: Spec Gap Analysis & Fix Plan

A thorough review of the codebase against `pacman.md` reveals that the app is mostly skeleton/stub code with significant unmerged feature work on remote branches. The game is not playable. This plan identifies all issues and proposes a phased implementation.

---

## Current State Summary

### What's on the working branch (`project/pacmanclaude`):
- Scaffold (Vite + PWA config, TypeScript, project structure) - merged from `chore/scaffold`
- Pac-Man movement + input controls (keyboard, touch, on-screen buttons) - merged from `us-002`
- Everything else is **stub/skeleton code** with no real implementation

### What exists in unmerged remote feature branches:
| Branch | Content | Quality |
|--------|---------|---------|
| `us-001` (maze rendering) | Full maze layout, tile rendering, Canvas offscreen cache, completion tracking | Good |
| `us-003` (ghost AI) | Ghost targeting, chase/scatter timer, ghost house release, mode timer | Good |
| `us-004` (ghost frightened) | FrightenedState module, flashing, eyes return | Moderate - conflicts with us-003 Ghost architecture |
| `us-007` (bonus fruit) | Spawn timing, despawn, level-based scoring | Good |
| `us-008` (level progression) | Difficulty scaling (20 levels), GameState expansion, ScreenManager expansion | Good |
| `us-009` (audio) | Web Audio synthesis (oscillator-based), siren, mute toggle | Good |
| `us-011` (high scores) | Initials entry, ScreenManager with high score flow | Moderate |
| `us-012` (keyboard access) | ScreenManager with full overlay rendering, focus management | Good |
| `us-013` (settings palette) | Ghost color palettes (default + colorblind), toggle, persistence | Good |
| `us-005` (collisions) | **No work at all** - empty branch |
| `us-006` (HUD) | **No work at all** - empty branch |
| `us-015` (app bootstrap) | **No work at all** - empty branch |

### Critical Architectural Problems:
1. **Branches conflict with each other** - us-003 and us-004 both modify Ghost.ts with incompatible architectures
2. **us-011 and us-012** both rewrite ScreenManager.ts differently
3. **No rendering pipeline** - even combined, no branch renders Pac-Man, ghosts, or fruit on canvas
4. **No collision system** - `checkCollisions()` is a hard-coded stub returning all false/null
5. **No wiring** - `main.ts` only registers the service worker; nothing else is initialized

---

## Spec Compliance Gap Analysis

### Spec: The Maze
| Requirement | Status | Detail |
|-------------|--------|--------|
| 2D maze of walls and corridors | Branch only | Implemented in us-001 but not merged |
| Filled with small dots | Branch only | us-001 has dots in maze layout |
| 4 power pellets near corners | Branch only | us-001 places them correctly |
| Left-right tunnel wraparound | Partial | PacMan.ts handles wrap; maze layout in us-001 |
| Center ghost house | Branch only | us-001 defines ghost house region |

### Spec: Pac-Man (Player)
| Requirement | Status | Detail |
|-------------|--------|--------|
| Arrow keys + WASD | DONE | InputManager handles this |
| Swipe gestures | DONE | InputManager handles this |
| On-screen directional buttons | DONE | DirectionalControls component |
| Continuous movement until wall | DONE | PacMan.update() with wall blocking |
| Chomp animation | Partial | State tracked (mouthOpen toggle) but no canvas rendering |
| Faces movement direction | Partial | `direction` tracked but no canvas rendering |
| Eats dots on contact | NOT DONE | No collision detection |
| Eats power pellets | NOT DONE | No collision detection |

### Spec: Ghosts
| Requirement | Status | Detail |
|-------------|--------|--------|
| 4 ghosts with distinct colors/names | Partial | Types defined; rendering not done |
| Blinky: direct chase | Branch only | us-003 |
| Pinky: aims ahead | Branch only | us-003 (but always +4 cols, ignoring direction) |
| Inky: flanking approach | Branch only | us-003 (but just +2 cols, not a true flank) |
| Clyde: chase/wander hybrid | Branch only | us-003 (switches at dist 8) |
| Chase/scatter alternation on timer | Branch only | us-003 has mode timer |
| Frightened: turn blue, reverse, slow | Branch only | us-003 + us-004 (conflicting) |
| Flash/blink last 2 seconds | Branch only | us-003 + us-004 |
| Eaten -> eyes -> ghost house -> respawn | Partial | us-004 has logic but relies on nonexistent Ghost properties |
| Escalating ghost eat points 200/400/800/1600 | Stub only | POINTS constants defined but not wired |
| Ghost house staggered release | Branch only | us-003 |
| Ghost pathfinding through maze | NOT DONE | Target tiles chosen but no A* or path navigation |

### Spec: Bonus Fruit
| Requirement | Status | Detail |
|-------------|--------|--------|
| Appears twice per level (at ~70 and ~170 dots) | Branch only | us-007 |
| Level-based fruit type and points | Branch + stub | FRUIT_TABLE defined; us-007 has logic |
| Disappears if not grabbed in time | Branch only | us-007 has despawn timer |
| Rendering on canvas | NOT DONE | No fruit drawing code |

### Spec: Lives and Game Over
| Requirement | Status | Detail |
|-------------|--------|--------|
| Start with 3 lives | Partial | `lives = 3` in GameState/ScoreManager stubs |
| Ghost touch = death + life lost | NOT DONE | No collision system |
| Death animation | NOT DONE | No animation system |
| Level resets with remaining dots | NOT DONE | No death/reset flow |
| Extra life at 10,000 points | Stub | Constant defined, no logic |
| Game over screen with final score | Branch only | us-011/us-012 have partial screen |
| Restart option | Branch only | us-012 |

### Spec: Levels and Difficulty
| Requirement | Status | Detail |
|-------------|--------|--------|
| Level complete when all dots eaten | Branch only | us-001 tracks remaining dots; us-008 has transition |
| Ghosts faster each level | Branch only | us-008 has difficulty scaling |
| Shorter frightened time | Branch only | us-008 |
| Less scatter, more chase | Branch only | us-008 |
| 20+ levels | Branch only | us-008 caps at level 20 |

### Spec: Scoring
| Requirement | Status | Detail |
|-------------|--------|--------|
| Dot = 10 pts | Defined | POINTS.DOT = 10 |
| Power pellet = 50 pts | Defined | POINTS.POWER_PELLET = 50 |
| Ghost escalation | Defined | Constants defined |
| Current score visible | NOT DONE | No HUD |
| High score visible | NOT DONE | No HUD |

### Spec: High Scores
| Requirement | Status | Detail |
|-------------|--------|--------|
| Top-10 list | DONE | HighScoreStore.ts works |
| Initials entry (3 letters) | Branch only | us-011 |
| Saved between sessions | DONE | localStorage |

### Spec: Screens and Flow
| Requirement | Status | Detail |
|-------------|--------|--------|
| Start screen | Branch only | us-012 renders it |
| Countdown 3-2-1-GO | Branch only | us-012 has type but no animated countdown |
| Gameplay screen | NOT DONE | No canvas rendering of gameplay |
| Pause/unpause | Branch only | us-012 |
| Level complete transition | Branch only | us-008 |
| Game over screen | Branch only | us-011/us-012 |

### Spec: Audio
| Requirement | Status | Detail |
|-------------|--------|--------|
| Start-up jingle | Branch only | us-009 synthesizes it |
| Dot-eating waka-waka | Branch only | us-009 |
| Power pellet sound | Branch only | us-009 |
| Ghost-eating sound | Branch only | us-009 |
| Death sound | Branch only | us-009 |
| Fruit collected sound | Branch only | us-009 |
| Extra life chime | Branch only | us-009 |
| Background siren (dynamic) | Branch only | us-009 |
| Mute button | Branch only | us-009 (persisted) |

### Spec: Performance & Device
| Requirement | Status | Detail |
|-------------|--------|--------|
| All modern browsers | Config only | Playwright config covers Chrome/FF/Safari |
| 60fps | Partial | Fixed-timestep loop exists but nothing to render |
| Responsive 375px-2560px | Partial | CSS breakpoints exist |
| Under 2MB total | Unknown | No actual game assets to measure |
| Offline support | Partial | SW registration + PWA config, but no sw.js generated yet |

### Spec: Accessibility
| Requirement | Status | Detail |
|-------------|--------|--------|
| Fully keyboard playable | Partial | Input works; menus not keyboard-navigable on current branch |
| Visible focus indicators | DONE | CSS `:focus-visible` styles exist |
| Colorblind-friendly option | Branch only | us-013 |

---

## Broken Infrastructure

1. **Tests fail with `ERR_REQUIRE_ESM`**: jsdom 29.x has an ESM-only dependency (`@exodus/bytes`) that breaks under `require()` in Node 18. Fix: downgrade jsdom to 25.x or switch to `happy-dom`.
2. ~~**Missing PWA icons**: `index.html` references `/icons/icon-192x192.png` and `/icons/icon-512x512.png` that don't exist.~~ **FIXED** — icons already exist in `public/icons/`.
3. ~~**No manifest.webmanifest file**: Referenced in HTML but generated by vite-plugin-pwa only at build time.~~ **FIXED** — created static `public/manifest.webmanifest` so the file is served directly by Vite regardless of whether the VitePWA plugin is active.
4. ~~**`renderer` referenced before initialization in `main.ts`**~~ **FIXED** — `resize()` was defined and called (line 54) before `const renderer = new Renderer(...)` (line 62), hitting a `const` temporal dead zone. Moved all core system declarations (`GameState`, `ScoreManager`, `AudioManager`, `InputManager`, `Renderer`, `GhostModeTimer`) above the `resize()` function definition.
5. ~~**Service worker registration fails in dev mode**~~ **FIXED** — `sw-register.ts` tried to register `/sw.js` unconditionally, but that file is only generated by VitePWA at build time (and VitePWA itself is skipped on Node 18). Added an `import.meta.env.DEV` guard to skip registration during development.

---

## Implementation Plan

### Phase 0: Fix Infrastructure (Pre-req)
1. **Fix test runner**: Downgrade `jsdom` to `^25.0.0` (or switch test environment to `happy-dom`) to resolve ESM compatibility.
2. **Create placeholder PWA icons**: Generate minimal 192x192 and 512x512 PNG files in `public/icons/`.
3. **Verify tests pass** after jsdom fix.

### Phase 1: Integrate Unmerged Branch Work
Rather than merging conflicting branches, manually integrate the best implementations:

4. **Maze system** (from us-001):
   - Add `src/maze/mazeLayout.ts` with `buildDefaultLayout()`, `MAZE_WIDTH`, `MAZE_HEIGHT`, `TUNNEL_ROW`
   - Rewrite `src/maze/Maze.ts` with full grid management, rendering, dot/pellet tracking, and Canvas drawing

5. **Ghost AI system** (from us-003, primary; reconcile us-004 frightened logic):
   - Rewrite `src/entities/Ghost.ts` with full state machine (chase, scatter, frightened, eaten), ghost house logic, speed, flashing, release timers
   - Rewrite `src/entities/ghostAI.ts` with proper targeting (fix Pinky to aim ahead based on direction, fix Inky to use Blinky position for flanking), mode timer, pathfinding constants
   - Add ghost pathfinding: simple BFS or greedy tile-by-tile navigation toward target tiles

6. **Audio system** (from us-009):
   - Rewrite `src/audio/AudioManager.ts` with Web Audio oscillator synthesis, siren loop, dynamic pitch, mute toggle with persistence

7. **Level progression** (from us-008):
   - Rewrite `src/game/GameState.ts` with difficulty scaling, level transition, completeLevel(), getDifficultySettings()

8. **Bonus fruit** (from us-007):
   - Rewrite `src/fruit/BonusFruit.ts` with spawn thresholds, despawn timer, level-based fruit lookup

9. **Screen Manager** (from us-012, merge us-011 initials):
   - Rewrite `src/ui/ScreenManager.ts` with DOM overlay rendering for all 6 screen types, callbacks, keyboard focus management, initials entry on game over

10. **Settings + colorblind palette** (from us-013):
    - Update `src/persistence/SettingsStore.ts` if needed
    - Add `src/rendering/ghostPalette.ts` with default + colorblind palettes, toggle, cache

### Phase 2: Implement Missing Core Systems

11. **Collision system**: Rewrite `src/collision/CollisionSystem.ts` to detect:
    - Pac-Man on dot tile -> eat dot, add 10 pts
    - Pac-Man on power pellet -> eat pellet, add 50 pts, trigger frightened
    - Pac-Man on normal ghost -> death
    - Pac-Man on frightened ghost -> eat ghost, escalating points
    - Pac-Man on fruit -> collect, add level-based points

12. **Score/lives manager**: Expand `src/scoring/ScoreManager.ts` with:
    - `addDotPoints()`, `addPelletPoints()`, `addGhostPoints()` with escalation counter
    - `addFruitPoints(level)`
    - `loseLife()`, `checkExtraLife()`
    - Reset ghost-eat counter per pellet

13. **Canvas renderer**: Create `src/rendering/Renderer.ts`:
    - Draw Pac-Man (yellow circle with animated mouth opening, facing direction)
    - Draw ghosts (colored shapes, blue when frightened, flashing near end, eyes when eaten)
    - Draw bonus fruit (simple colored shapes or text)
    - Draw HUD (score, high score, lives indicators, level number)
    - Support colorblind palette for ghosts

14. **Ghost pathfinding**: Add to ghostAI.ts or a new module:
    - Implement greedy tile-by-tile movement: at each intersection, choose the direction that minimizes distance to target (excluding reversal unless frightened)
    - Handle tunnel traversal at reduced speed
    - Handle ghost house exit path

15. **Death sequence**: 
    - Death animation (Pac-Man shrinks/disappears over ~1 second)
    - Level reset: reposition Pac-Man and ghosts, keep remaining dots, decrement life
    - If no lives left -> game over

16. **Countdown animation**: Implement "3...2...1...GO!" with timed DOM overlay

17. **Level complete flow**: Flash maze, brief transition screen, advance to next level with increased difficulty

### Phase 3: Wire Everything Together

18. **App bootstrap** (`src/main.ts`):
    - Initialize canvas context
    - Create Maze, PacMan, Ghost[4], BonusFruit, ScoreManager, AudioManager, InputManager, ScreenManager, GameState
    - Wire ScreenManager callbacks (start -> countdown -> play, pause, restart)
    - Start game loop

19. **Game loop integration** (`src/game/GameLoop.ts` / new orchestrator):
    - Each frame: read input -> update PacMan -> update Ghosts -> check collisions -> update fruit -> update score -> check level complete -> render everything
    - Handle pause (freeze all updates)
    - Handle death sequence
    - Handle level transitions

20. **Screen flow wiring**:
    - Start -> countdown -> playing
    - Playing + pause key -> paused -> resume key -> playing
    - Death with lives > 0 -> brief death anim -> reset -> startup jingle -> playing
    - Death with lives = 0 -> game over screen (+ initials if qualifying)
    - Game over + restart -> start screen
    - All dots eaten -> level complete -> next level

### Phase 4: Polish & Verification

21. **Fix ghost targeting accuracy**:
    - Pinky: aim 4 tiles ahead in Pac-Man's *facing direction* (not just +4 cols)
    - Inky: use vector from Blinky to 2 tiles ahead of Pac-Man, doubled (classic flanking)
    - Clyde: scatter to corner when within 8 tiles, chase when far

22. **Ensure 20 levels of difficulty scaling work correctly**

23. **Audio polish**: Verify all 8 sound events fire at correct times, siren pitch scales with dot depletion

24. **Responsive layout testing**: Verify 375px to 2560px scaling

25. **Accessibility pass**: All menus keyboard-navigable, focus visible, colorblind toggle works

26. **Performance**: Verify 60fps in Chrome DevTools, total build under 2MB

27. **Offline**: Build, serve, verify game loads without network

28. **Write/fix tests**:
    - Fix existing tests after integration
    - Add tests for collision system
    - Add tests for score manager
    - Add tests for game state transitions
    - Add Playwright e2e smoke test

---

## Files to Modify/Create

### Modified (substantial rewrite):
- `src/main.ts` - Full app bootstrap and wiring
- `src/maze/Maze.ts` - Full maze with layout, rendering, dot tracking
- `src/entities/Ghost.ts` - Full ghost entity with state machine
- `src/entities/ghostAI.ts` - Full targeting + pathfinding + mode timer
- `src/game/GameLoop.ts` - Orchestrate full game update/render cycle
- `src/game/GameState.ts` - Level progression, difficulty scaling
- `src/collision/CollisionSystem.ts` - Full collision detection
- `src/scoring/ScoreManager.ts` - Full scoring with ghost escalation
- `src/audio/AudioManager.ts` - Web Audio synthesis
- `src/fruit/BonusFruit.ts` - Spawn/despawn with timing
- `src/ui/ScreenManager.ts` - All overlay screens with DOM rendering
- `src/style.css` - Additional styles for screens, HUD, game over
- `src/persistence/SettingsStore.ts` - Minor updates
- `index.html` - May need minor DOM structure updates
- `package.json` - Fix jsdom version

### New Files:
- `src/maze/mazeLayout.ts` - Default maze tile grid data
- `src/rendering/Renderer.ts` - Canvas rendering for all entities + HUD
- `src/rendering/ghostPalette.ts` - Ghost color palettes (default + colorblind)
- `public/icons/icon-192x192.png` - PWA icon placeholder
- `public/icons/icon-512x512.png` - PWA icon placeholder

### Test Files:
- Fix `tests/entities/PacMan.test.ts` (may need updates for new Maze constructor)
- Fix `tests/input/*.test.ts`
- New: `tests/collision/CollisionSystem.test.ts`
- New: `tests/scoring/ScoreManager.test.ts`
- New: `tests/game/GameState.test.ts`
- New: `tests/maze/Maze.test.ts`
- New: `tests/maze/mazeLayout.test.ts`

---

## Risks & Considerations

1. **Scope**: This is essentially implementing the entire game from scaffolds. The unmerged branch work provides good reference implementations but they need reconciliation.
2. **Ghost pathfinding**: The branches have targeting (choosing a target tile) but no actual pathfinding (navigating the maze to reach it). This is a significant gap.
3. **Canvas rendering**: Zero rendering code exists anywhere. This must be built from scratch.
4. **Branch conflicts**: us-003 and us-004 have incompatible Ghost architectures. The plan uses us-003 as primary and incorporates us-004's frightened logic into it.
5. **Node version**: Node 18 is old; some dependencies may require workarounds.
6. **No sprite assets**: The spec implies visual fidelity. Current approach will use Canvas 2D primitive drawing (circles, rectangles) which is appropriate for the under-2MB budget but won't look like the classic arcade game.

---

## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] `npm test` passes all unit tests
- [ ] Game loads in browser at localhost:3000
- [ ] Start screen shows with "Start" button
- [ ] Countdown plays before gameplay
- [ ] Pac-Man moves with arrow keys, WASD, swipe, on-screen buttons
- [ ] Pac-Man eats dots (score updates)
- [ ] Power pellet makes ghosts blue/frightened
- [ ] Eating frightened ghosts awards 200/400/800/1600
- [ ] Ghost eyes return to ghost house
- [ ] Ghosts alternate chase/scatter
- [ ] Normal ghost kills Pac-Man (death animation, life lost)
- [ ] Game over when 0 lives
- [ ] Bonus fruit appears at ~70 and ~170 dots
- [ ] Level completes when all dots eaten
- [ ] Difficulty increases across levels
- [ ] Extra life at 10,000 points
- [ ] All sounds play (mute toggle works)
- [ ] High scores persist across reloads
- [ ] Initials entry on qualifying game over
- [ ] Pause/unpause works
- [ ] Colorblind palette toggle works
- [ ] Game works offline after first load
- [ ] Responsive from 375px to 2560px
- [ ] All menus keyboard-navigable
