# Product Manager Mission Report

**Agent**: product-manager  
**Generated**: 2026-08-16T16:00:13.084Z

---

## User Stories (15)

### US-001: As a player, I want to see a fully rendered maze with walls, corridors, dots, power pellets, tunnel wraparound, and the ghost house
- So that: I can recognize the classic Pac-Man playfield and understand where I can move
- AC: The maze renders on the Canvas with distinct wall and corridor tiles, including a visible center ghost house and at least one left-right tunnel connection.; All regular dots and four power pellets are drawn in the correct maze locations and are removed visually when eaten.; The maze model tracks remaining dots/pellets and exposes a completion condition when all consumables are gone.
### US-002: As a player, I want to control Pac-Man with keyboard, swipe, and on-screen directional buttons
- So that: I can play comfortably on desktop and mobile devices
- AC: Arrow keys and WASD both update directional intent, and swipe gestures and on-screen buttons map to the same direction API.; Pac-Man continues moving in the last chosen direction until blocked by a wall, and he wraps through the tunnel correctly.; Pac-Man visibly faces his movement direction and plays a chomp animation while moving.
### US-003: As a player, I want the four ghosts to use distinct personalities and chase/scatter timing
- So that: the game feels like the classic arcade experience with varied enemy behavior
- AC: Each ghost uses a distinct targeting strategy: direct chase, ahead-of-Pac-Man ambush, flank/cutoff, and chase/random hybrid.; Ghosts alternate between chase and scatter modes on a timer, and the current mode affects their target selection.; Ghosts release from the ghost house in a staggered sequence at level start and after Pac-Man loses a life.
### US-004: As a player, I want ghosts to become frightened after a power pellet and return as eyes when eaten
- So that: power pellets create a temporary advantage and match the classic rules
- AC: Eating a power pellet switches all ghosts into frightened mode, reverses their direction, and slows them down.; During the final two seconds of frightened mode, ghosts flash or blink as a warning.; If Pac-Man eats a frightened ghost, the ghost becomes eyes, travels back to the ghost house, and respawns as a normal ghost after arrival.
### US-005: As a player, I want collisions with dots, pellets, ghosts, and fruit to update score and lives correctly
- So that: gameplay rewards and penalties follow the expected Pac-Man rules
- AC: Eating a regular dot adds 10 points, a power pellet adds 50 points, and bonus fruit awards the level-specific value.; Eating multiple frightened ghosts during one pellet awards escalating points in the correct sequence: 200, 400, 800, 1600.; A collision with a normal ghost removes one life, triggers a death sequence, and resets the level state without clearing remaining dots.
### US-006: As a player, I want to earn an extra life at 10,000 points and see the current score and lives during play
- So that: I can track progress and be rewarded for high performance
- AC: The score display updates immediately after scoring events and remains visible during gameplay.; When the score reaches 10,000 points for the first time, the player gains exactly one extra life and receives a distinct audio cue.; The game starts with 3 lives and the lives counter decrements correctly after each death until game over.
### US-007: As a player, I want bonus fruit to appear twice per level near the center and disappear if ignored
- So that: I can earn additional points by taking risks at the right time
- AC: A bonus fruit spawns near the maze center after approximately 70 dots eaten and again after approximately 170 dots eaten in each level.; The fruit type and score value change by level according to the configured fruit table.; If the fruit is not collected within its lifetime, it disappears automatically and cannot be collected afterward.
### US-008: As a player, I want the game to advance to harder levels after clearing all dots and pellets
- So that: the challenge increases over time and the game remains engaging
- AC: When the last dot or pellet is eaten, the level is marked complete and the next level begins after a transition screen.; Across levels, ghost speed increases, frightened duration decreases, and scatter time decreases according to the difficulty curve.; After level 20, the hardest settings repeat rather than increasing beyond the configured cap.
### US-009: As a player, I want all game sounds and the siren to play with a mute toggle
- So that: I can enjoy audio feedback or silence the game when needed
- AC: The game plays distinct sounds for startup, dot eating, power pellet, ghost eaten, death, fruit, and extra life events.; The background siren loops during gameplay and changes playback rate or pitch as dots deplete and levels increase.; A global mute toggle silences all audio immediately and persists across browser sessions.
### US-010: As a player, I want accessible Start, Countdown, Pause, Level Complete, and Game Over screens
- So that: I can understand game state changes and control the flow without using the canvas alone
- AC: Each screen is rendered as an accessible DOM overlay with visible text and focusable controls where applicable.; Starting the game shows a 3-2-1-GO countdown before gameplay begins, and pausing freezes the game state until resumed.; Game Over shows the final score and provides a restart path, and Level Complete appears briefly before the next level starts.
### US-011: As a player, I want my top-10 high scores to persist and allow initials entry when I qualify
- So that: I can compete for replay value across sessions
- AC: The game stores and retrieves a top-10 high score list in browser localStorage across reloads and browser restarts.; When a final score qualifies, the Game Over flow prompts for 3-letter initials and saves the entry after confirmation.; The high score list is sorted correctly and only the top 10 entries are retained.
### US-012: As a keyboard-only player, I want all menus and screens to be fully operable with visible focus states
- So that: I can navigate and play without a mouse
- AC: All interactive menu controls can be reached and activated using only the keyboard.; Visible focus indicators are present on every screen with interactive controls, including Start, Pause, Game Over, and settings-related actions.; Keyboard bindings for pause and mute work during gameplay without requiring mouse interaction.
### US-013: As a player with color vision differences, I want a colorblind-friendly ghost palette toggle that persists in settings
- So that: I can distinguish ghosts more easily during play
- AC: A settings control toggles between the default ghost palette and a colorblind-friendly palette.; The selected palette is applied to ghost rendering immediately and remains active after reload.; The settings object persists in localStorage and does not interfere with other saved data such as high scores.
### US-014: As a player, I want the game to work offline after the first load and stay within performance and size budgets
- So that: I can play reliably on slow or disconnected connections
- AC: The app shell and static assets are precached by a Service Worker so the game loads and runs offline after an initial online visit.; The build remains a static client-only app with no server dependency and the total shipped asset budget stays under 2 MB.; Gameplay remains smooth at 60fps with responsive layout scaling from 375px to 2560px across supported browsers.
### US-015: As a player, I want all game systems to be wired together in the main application entry point
- So that: I can start the app and play end-to-end from the start screen through gameplay and game over
- AC: The SPA shell initializes the screen manager, input manager, audio manager, score/state systems, and game loop into a working boot sequence.; Starting from the root entry point shows the start screen, transitions into countdown and gameplay, and allows a full playable session without manual developer intervention.; The application can be launched as a single-page client-only build and remains interactive end-to-end, including pause, level transitions, and game over restart.

## Tasks (38)

- **TASK-001** [infra/Vite, TypeScript, vite-plugin-pwa, Workbox] Initialize Vite PWA project configuration
- **TASK-002** [infra/GitHub Actions, npm, Vitest, Playwright, Vite] Configure GitHub Actions CI for build and test
- **TASK-003** [testing/Vitest, Playwright] Set up Playwright and Vitest test scaffolding
- **TASK-004** [frontend/TypeScript, Canvas 2D] Implement maze layout loading and tile metadata
- **TASK-005** [frontend/TypeScript, Canvas 2D] Implement maze rendering on Canvas
- **TASK-006** [frontend/TypeScript] Add maze completion state and dot counters
- **TASK-007** [frontend/TypeScript] Implement Pac-Man movement controller integration
- **TASK-008** [frontend/TypeScript, DOM events] Implement input normalization for keyboard, swipe, and touch controls
- **TASK-009** [frontend/TypeScript, HTML, CSS] Add on-screen directional controls and mobile-friendly input UI
- **TASK-010** [frontend/TypeScript] Implement ghost targeting and personality selection
- **TASK-011** [frontend/TypeScript] Implement chase/scatter timer and ghost house release sequencing
- **TASK-012** [frontend/TypeScript] Implement frightened state transitions and ghost reversal
- **TASK-013** [frontend/TypeScript] Implement eaten-ghost eyes return path and respawn
- **TASK-014** [frontend/TypeScript] Implement collision resolution for dots, pellets, ghosts, and fruit
- **TASK-015** [frontend/TypeScript] Implement scoring rules and ghost-eat escalation
- **TASK-016** [frontend/TypeScript] Implement lives tracking and extra-life award logic
- **TASK-017** [frontend/TypeScript, HTML, CSS] Render score, lives, and high score HUD
- **TASK-018** [frontend/TypeScript] Implement bonus fruit spawn timing and despawn behavior
- **TASK-019** [frontend/TypeScript] Implement level-based fruit table and scoring integration
- **TASK-020** [frontend/TypeScript] Implement level progression and difficulty scaling rules
- **TASK-021** [frontend/TypeScript, HTML, CSS] Add level complete overlay and next-level transition timing
- **TASK-022** [frontend/Web Audio API, TypeScript] Implement Web Audio sound effect playback
- **TASK-023** [frontend/Web Audio API, TypeScript] Implement siren loop and dynamic playback-rate scaling
- **TASK-024** [frontend/TypeScript] Implement persistent mute toggle and audio state sync
- **TASK-025** [frontend/TypeScript, HTML, CSS] Implement screen manager state machine and overlay views
- **TASK-026** [frontend/TypeScript] Implement countdown, pause, and restart flow hooks
- **TASK-027** [frontend/TypeScript, localStorage] Implement high score persistence and top-10 sorting
- **TASK-028** [frontend/TypeScript, HTML, CSS] Implement initials entry flow for qualifying game over
- **TASK-029** [frontend/HTML, CSS, TypeScript] Add keyboard accessibility and visible focus styles
- **TASK-030** [frontend/TypeScript] Add keyboard shortcut handling for pause and mute
- **TASK-031** [frontend/TypeScript, CSS] Implement colorblind-friendly ghost palette setting
- **TASK-032** [frontend/TypeScript, localStorage] Persist and restore settings from localStorage
- **TASK-033** [infra/Service Worker, Cache API, vite-plugin-pwa] Implement service worker registration and offline asset caching
- **TASK-034** [frontend/TypeScript, CSS] Optimize asset budget and responsive layout scaling
- **TASK-035** [testing/Playwright] Add cross-browser end-to-end performance and offline tests
- **TASK-036** [frontend/TypeScript] Compose the application bootstrap and root wiring
- **TASK-037** [frontend/TypeScript, requestAnimationFrame] Implement main game loop start/stop lifecycle
- **TASK-038** [testing/Playwright] Add end-to-end integration tests for full game flow
