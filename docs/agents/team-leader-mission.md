# Team Leader Mission Report

**Agent**: team-leader  
**Generated**: 2026-08-16T16:00:48.236Z

---

## Assignments (22)

### ASSIGN-001 -> principal-frontend [principal]
- Priority: critical | Complexity: very-complex
- Create and modify the Vite PWA scaffold on the shared chore branch. Update root package.json, Vite/PWA config, tsconfig/bundler config, and service worker registration wiring. Add the offline caching setup with Workbox/vite-plugin-pwa, ensure the app shell is precached, and keep the build purely static. Follow existing repo conventions and read any generated config files first before editing. Own the scaffolded root files and offline-cache integration files only; avoid overlapping with feature modules.
### ASSIGN-002 -> senior-frontend [senior]
- Priority: high | Complexity: moderate
- Set up Vitest and Playwright scaffolding plus GitHub Actions CI. Modify the test config files, add baseline unit/e2e test structure, and create CI workflows for build, unit tests, and cross-browser Playwright runs. Read the generated Vite/test config first to match conventions. Own the testing and CI files only; do not touch gameplay modules.
### ASSIGN-003 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Implement maze layout loading, tile metadata, Canvas rendering, and completion tracking. Modify src/maze/Maze.ts and any related maze data files to load the tile grid, expose remaining dot/pellet counts, and render walls, corridors, ghost house, tunnels, dots, and pellets. Read the existing maze contract first and follow the established Canvas drawing patterns. Own only the maze model/rendering files to minimize overlap.
### ASSIGN-004 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Implement Pac-Man movement integration, input normalization, and on-screen directional controls. Modify src/entities/PacMan.ts, src/input/InputManager.ts, and the UI control files for swipe/buttons so keyboard, touch, and button input all map to one direction-intent API. Read the existing entity/input patterns first. Own the Pac-Man controller and input UI files only; keep overlap with other gameplay systems minimal.
### ASSIGN-005 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Implement ghost targeting, personality selection, chase/scatter timing, and ghost-house release sequencing. Modify src/entities/Ghost.ts and src/entities/ghostAI.ts to support the four personalities and mode-driven target selection. Read the existing ghost model first and follow the current naming and state conventions. Own the ghost AI and timing files only.
### ASSIGN-006 -> junior-python [junior]
- Priority: high | Complexity: moderate
- Implement frightened-state transitions, ghost reversal, eyes-return path, and respawn behavior in the ghost-related gameplay files. Modify the ghost state handling code and any helper logic needed to switch between frightened, eyes, and normal modes. Read the existing ghost and AI files first to match the current state machine conventions. Own only the frightened/eyes behavior files; do not change targeting logic.
### ASSIGN-007 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Implement collision resolution for dots, pellets, ghosts, and fruit, plus scoring rules, ghost-eat escalation, lives tracking, and extra-life award logic. Modify src/collision/CollisionSystem.ts, src/scoring/ScoreManager.ts, and any small glue code needed to emit score/life events. Read the existing collision and scoring files first to preserve event semantics. Own the collision and scoring modules only.
### ASSIGN-008 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement bonus fruit spawn timing, despawn behavior, and level-based fruit table scoring integration. Modify src/fruit/BonusFruit.ts and the small integration points that read FRUIT_TABLE. Read the existing fruit module first and keep the implementation aligned with current constants and event flow. Own only the fruit module files.
### ASSIGN-009 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Implement level progression, difficulty scaling, and the level-complete overlay/transition timing. Modify src/scoring/ScoreManager.ts or src/game/GameState.ts for level rules, and the UI overlay files for the transition screen. Read the existing state and overlay code first to match the app’s flow. Own the level progression and level-complete UI files only.
### ASSIGN-010 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Implement Web Audio sound effect playback, the looping siren with dynamic playback-rate scaling, and the persistent mute toggle/audio state sync. Modify src/audio/AudioManager.ts and the small settings/audio integration points. Read the existing audio code first to preserve timing and mute semantics. Own the audio module and its direct integration files only.
### ASSIGN-011 -> senior-frontend [senior]
- Priority: high | Complexity: complex
- Implement the screen manager state machine and overlay views for Start, Countdown, Pause, Level Complete, and Game Over, plus the countdown/pause/restart hooks. Modify src/ui/ScreenManager.ts and the overlay HTML/CSS/TypeScript files. Read the existing UI structure first and keep the overlays accessible and keyboard-friendly. Own the screen manager and overlay files only.
### ASSIGN-012 -> junior-python [junior]
- Priority: medium | Complexity: moderate
- Implement high score persistence, top-10 sorting, and the initials-entry flow for qualifying game over states. Modify src/persistence/HighScoreStore.ts and the Game Over overlay files. Read the existing persistence and overlay code first to match localStorage keys and UI conventions. Own only the high-score persistence and initials-entry files.
### ASSIGN-013 -> senior-frontend [senior]
- Priority: high | Complexity: moderate
- Add keyboard accessibility, visible focus styles, and keyboard shortcut handling for pause and mute. Modify the shared HTML/CSS and the input handling files so all menus are operable without a mouse. Read the existing UI and input code first to preserve focus behavior and avoid regressions. Own the accessibility styling and shortcut handling files only.
### ASSIGN-014 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement the colorblind-friendly ghost palette setting and persist/restore settings from localStorage. Modify src/persistence/SettingsStore.ts and the ghost palette styling/rendering integration points. Read the existing settings code first to keep the stored object shape stable. Own only the settings persistence and palette toggle files.
### ASSIGN-015 -> principal-frontend [principal]
- Priority: critical | Complexity: very-complex
- Compose the application bootstrap and root wiring, and implement the main game loop start/stop lifecycle. Modify the entry composition files and src/game/GameLoop.ts so the app boots into the start screen, wires input/audio/state/loop systems together, and remains interactive end-to-end. Read the existing entry and loop code first, then wire all created components into the application entry point. This assignment must own the composition root and loop orchestration files only.
### ASSIGN-016 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Render the score, lives, and high-score HUD in the gameplay overlay. Modify the HUD HTML/CSS/TypeScript files to reflect live score and lives updates and keep the display visible during play. Read the existing overlay structure first and follow the current accessible UI patterns. Own only the HUD files.
### ASSIGN-017 -> senior-frontend [senior]
- Priority: medium | Complexity: moderate
- Optimize asset budget and responsive layout scaling. Modify the shared CSS and any layout helpers so the canvas and overlays scale cleanly from 375px to 2560px while staying within the size budget. Read the existing styles first and preserve the current responsive conventions. Own only the layout/CSS files.
### ASSIGN-018 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Implement the gameplay HUD and score/lives visibility for the shared overlay branch, ensuring the display stays readable during Start, Countdown, Pause, and gameplay states. Modify the HUD and overlay files only, and keep the markup accessible with visible focus states. This branch also supports the score/lives visibility portion of the gameplay experience. Read the existing screen manager files first to match the overlay structure.
### ASSIGN-019 -> junior-react [junior]
- Priority: medium | Complexity: simple
- Add cross-browser end-to-end performance and offline tests in Playwright. Modify the e2e test files to verify offline loading, responsive layout, and basic gameplay smoke coverage across supported browsers. Read the existing Playwright scaffold first and follow the repo’s test naming conventions. Own only the e2e test files.
### ASSIGN-020 -> junior-python [junior]
- Priority: medium | Complexity: simple
- Implement the bonus fruit system for both spawn timing and level-based scoring integration on the shared fruit branch. Modify src/fruit/BonusFruit.ts and the fruit table integration points so fruit appears near the maze center, times out, and awards the correct level-scaled points. Read the existing fruit module first and keep the spawn/despawn behavior consistent with the collision system. Own only the fruit module files.
### ASSIGN-021 -> principal-frontend [principal]
- Priority: high | Complexity: very-complex
- Take ownership of the full ghost behavior stack on a single branch: targeting, chase/scatter timing, frightened transitions, reversal, eyes-return path, respawn, and ghost-house release sequencing. Modify src/entities/Ghost.ts and src/entities/ghostAI.ts, and coordinate any shared state hooks needed for frightened/eyes behavior. Read the existing ghost files first and preserve the current state machine conventions. This assignment owns the ghost AI and ghost state files end-to-end.
### ASSIGN-023 -> principal-frontend [principal]
- Priority: high | Complexity: complex
- Add end-to-end integration tests for the full game flow. Create or modify the existing test harness and any E2E spec files under the frontend test directory. Read the current app/game bootstrap and existing test conventions first, then implement a full-path test that covers startup, core interaction loop, and expected UI/game state transitions. Ensure the test runs against the real wired application entry point and follows the repo's existing testing patterns.
