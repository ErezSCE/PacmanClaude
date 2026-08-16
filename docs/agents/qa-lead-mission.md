# QA Lead — Test Plan

**Agent**: qa-lead  
**Generated**: 2026-08-16T16:56:28.987Z

---

## Test Plan

{
  "scope": "Comprehensive QA plan for the client-only Pac-Man SPA/PWA using existing stack: Vitest for unit/integration-style browser-module tests and Playwright for E2E cross-browser flows. Mandatory traceability rule for all test implementations: every test name must start with [<storyId>#<acIndex>] (example: [US-005#0] eating dot awards 10 points). Place tests in repo-declared test directories (if provided by repo contract); otherwise use conventional structure: tests/unit, tests/integration, tests/e2e. This plan maps every acceptance criterion to at least one test item. No uncovered acceptance criteria.",
  "unit": [
    {
      "target": "Maze Model & Renderer",
      "description": "[US-001#0] Validate tile map contains distinct wall/corridor types, ghost house coordinates, and at least one horizontal tunnel pair linking left/right exits.",
      "framework": "Vitest",
      "storyId": "US-001",
      "acIndex": 0,
      "moduleId": "maze-model"
    },
    {
      "target": "Maze Renderer (Canvas draw commands)",
      "description": "[US-001#1] Verify regular dots and exactly four power pellets are drawn at configured coordinates and removed from render list after consume events.",
      "framework": "Vitest",
      "storyId": "US-001",
      "acIndex": 1,
      "moduleId": "maze-renderer"
    },
    {
      "target": "Maze Model consumable tracker",
      "description": "[US-001#2] Remaining consumables counter decrements on dot/pellet consumption and emits completion=true when count reaches zero.",
      "framework": "Vitest",
      "storyId": "US-001",
      "acIndex": 2,
      "moduleId": "maze-model"
    },
    {
      "target": "Input Manager normalization",
      "description": "[US-002#0] Arrow keys, WASD, swipe directions, and on-screen button presses all map to the same DirectionIntent enum/API.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 0,
      "moduleId": "input-manager"
    },
    {
      "target": "Pac-Man Controller movement",
      "description": "[US-002#1] Pac-Man continues in last valid direction until wall collision; queued turn applies at next legal tile; tunnel wrap teleports to opposite side preserving direction.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 1,
      "moduleId": "pacman-controller"
    },
    {
      "target": "Pac-Man animation state",
      "description": "[US-002#2] Facing sprite orientation follows movement vector and chomp animation advances only while moving.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 2,
      "moduleId": "pacman-controller"
    },
    {
      "target": "Ghost AI targeting strategies",
      "description": "[US-003#0] Unit-test each ghost target function: direct chase, ambush ahead tiles, flank/cutoff vector logic, and chase/random hybrid branch behavior.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 0,
      "moduleId": "ghost-ai"
    },
    {
      "target": "Ghost mode scheduler",
      "description": "[US-003#1] Chase/scatter timer alternates modes per configured schedule and target-selection function switches by current mode.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 1,
      "moduleId": "ghost-ai"
    },
    {
      "target": "Ghost release controller",
      "description": "[US-003#2] Staggered ghost-house release order/timing at level start and after life loss reset.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 2,
      "moduleId": "ghost-ai"
    },
    {
      "target": "Frightened mode state transition",
      "description": "[US-004#0] Power pellet event sets all ghosts frightened, reverses direction, and applies speed multiplier reduction.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 0,
      "moduleId": "ghost-ai"
    },
    {
      "target": "Frightened warning flasher",
      "description": "[US-004#1] Final two seconds of frightened timer toggles flash/blink state at configured cadence.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 1,
      "moduleId": "ghost-ai"
    },
    {
      "target": "Ghost eaten/eyes lifecycle",
      "description": "[US-004#2] Frightened ghost collision transitions to eyes state, path target becomes ghost house, and normal state restored on arrival.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 2,
      "moduleId": "ghost-ai"
    },
    {
      "target": "Collision scoring rules",
      "description": "[US-005#0] Dot=10, pellet=50, fruit=level-table points emitted to score manager on collision events.",
      "framework": "Vitest",
      "storyId": "US-005",
      "acIndex": 0,
      "moduleId": "collision-system"
    },
    {
      "target": "Frightened combo scorer",
      "description": "[US-005#1] Sequential frightened ghost eats within one pellet window award 200/400/800/1600 then reset on window end.",
      "framework": "Vitest",
      "storyId": "US-005",
      "acIndex": 1,
      "moduleId": "score-manager"
    },
    {
      "target": "Death/life-loss reset logic",
      "description": "[US-005#2] Normal ghost collision decrements life, triggers death sequence event, and resets actors without restoring consumed dots.",
      "framework": "Vitest",
      "storyId": "US-005",
      "acIndex": 2,
      "moduleId": "game-state"
    },
    {
      "target": "Score HUD model binding",
      "description": "[US-006#0] Score observable updates immediately after scoring events and remains available during active gameplay state.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 0,
      "moduleId": "score-manager"
    },
    {
      "target": "Extra life threshold guard",
      "description": "[US-006#1] Crossing 10,000 points grants exactly one extra life once per game and emits extra-life audio event.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 1,
      "moduleId": "score-manager"
    },
    {
      "target": "Lives initialization/decrement",
      "description": "[US-006#2] New game starts with 3 lives and decrements by one per death until zero/game-over flag.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 2,
      "moduleId": "score-manager"
    },
    {
      "target": "Fruit spawn trigger counters",
      "description": "[US-007#0] Fruit spawn events fire near center at ~70 and ~170 dots eaten once each per level.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 0,
      "moduleId": "fruit-system"
    },
    {
      "target": "Fruit table resolver",
      "description": "[US-007#1] Fruit type and point value resolve by level according to configured progression table.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 1,
      "moduleId": "fruit-system"
    },
    {
      "target": "Fruit lifetime timeout",
      "description": "[US-007#2] Uncollected fruit despawns after lifetime and subsequent collision checks do not award points.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 2,
      "moduleId": "fruit-system"
    },
    {
      "target": "Level completion detector",
      "description": "[US-008#0] Last consumable triggers level-complete state and schedules next-level transition event.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 0,
      "moduleId": "game-state"
    },
    {
      "target": "Difficulty curve calculator",
      "description": "[US-008#1] Per-level parameters increase challenge: ghost speed up, frightened duration down, scatter duration down.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 1,
      "moduleId": "difficulty-config"
    },
    {
      "target": "Difficulty cap repeater",
      "description": "[US-008#2] Levels >20 reuse capped hardest settings without further increase.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 2,
      "moduleId": "difficulty-config"
    },
    {
      "target": "Audio event map",
      "description": "[US-009#0] Startup/dot/pellet/ghost/death/fruit/extra-life events map to distinct audio buffers/IDs.",
      "framework": "Vitest",
      "storyId": "US-009",
      "acIndex": 0,
      "moduleId": "audio-manager"
    },
    {
      "target": "Siren rate controller",
      "description": "[US-009#1] Siren loop playback-rate function increases with dot depletion and level progression.",
      "framework": "Vitest",
      "storyId": "US-009",
      "acIndex": 1,
      "moduleId": "audio-manager"
    },
    {
      "target": "Mute persistence store",
      "description": "[US-009#2] Global mute toggles immediate master gain to silent and persists/reloads from settings storage.",
      "framework": "Vitest",
      "storyId": "US-009",
      "acIndex": 2,
      "moduleId": "settings-store"
    },
    {
      "target": "Screen state machine",
      "description": "[US-010#0] Overlay states (Start/Countdown/Pause/LevelComplete/GameOver) expose accessible metadata and focusable controls where required.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 0,
      "moduleId": "screen-manager"
    },
    {
      "target": "Countdown/pause timing control",
      "description": "[US-010#1] Start triggers 3-2-1-GO sequence before run state; pause halts simulation ticks until resume.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 1,
      "moduleId": "game-loop"
    },
    {
      "target": "Game over/level complete transitions",
      "description": "[US-010#2] Game over payload includes final score and restart action; level-complete state auto-advances after brief delay.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 2,
      "moduleId": "screen-manager"
    },
    {
      "target": "High score repository",
      "description": "[US-011#0] localStorage adapter saves/loads top-10 list across reload simulation with schema validation.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 0,
      "moduleId": "high-score-store"
    },
    {
      "target": "Initials validation",
      "description": "[US-011#1] Qualifying score flow accepts exactly 3-letter initials and persists entry on confirm.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 1,
      "moduleId": "high-score-store"
    },
    {
      "target": "Top-10 sorter/trimmer",
      "description": "[US-011#2] Entries sorted descending by score and truncated to 10 records.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 2,
      "moduleId": "high-score-store"
    },
    {
      "target": "Keyboard navigation map",
      "description": "[US-012#0] All menu actions expose keyboard handlers (Tab/Shift+Tab/Enter/Space/Escape as applicable).",
      "framework": "Vitest",
      "storyId": "US-012",
      "acIndex": 0,
      "moduleId": "screen-manager"
    },
    {
      "target": "Focus style contract",
      "description": "[US-012#1] Interactive controls include focus-visible class/state token on all required screens.",
      "framework": "Vitest",
      "storyId": "US-012",
      "acIndex": 1,
      "moduleId": "ui-components"
    },
    {
      "target": "Gameplay hotkeys",
      "description": "[US-012#2] Pause and mute key bindings dispatch during active gameplay without pointer events.",
      "framework": "Vitest",
      "storyId": "US-012",
      "acIndex": 2,
      "moduleId": "input-manager"
    },
    {
      "target": "Palette toggle reducer",
      "description": "[US-013#0] Settings action toggles default vs colorblind ghost palette flag.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 0,
      "moduleId": "settings-store"
    },
    {
      "target": "Ghost render palette binding",
      "description": "[US-013#1] Ghost renderer applies selected palette immediately and rehydrates same palette on app init.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 1,
      "moduleId": "ghost-renderer"
    },
    {
      "target": "Settings storage isolation",
      "description": "[US-013#2] Persisting settings does not overwrite or corrupt high score keys/data.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 2,
      "moduleId": "settings-store"
    },
    {
      "target": "App bootstrap wiring",
      "description": "[US-015#0] Root entry initializes screen/input/audio/score/game-loop modules and registers event bus subscriptions.",
      "framework": "Vitest",
      "storyId": "US-015",
      "acIndex": 0,
      "moduleId": "app-shell"
    },
    {
      "target": "Boot-to-play session orchestrator",
      "description": "[US-015#1] Root start action transitions Start->Countdown->Gameplay with no manual hooks.",
      "framework": "Vitest",
      "storyId": "US-015",
      "acIndex": 1,
      "moduleId": "app-shell"
    },
    {
      "target": "Client-only launch contract",
      "description": "[US-015#2] Build-time config and runtime guards ensure SPA remains client-only and supports pause/level/game-over restart transitions.",
      "framework": "Vitest",
      "storyId": "US-015",
      "acIndex": 2,
      "moduleId": "app-shell"
    }
  ],
  "integration": [
    {
      "target": "Collision System + Score Manager + Maze Model",
      "description": "[US-001#1] Consuming dot/pellet updates maze consumables, removes render entity, and emits score event in one frame transaction.",
      "framework": "Vitest",
      "storyId": "US-001",
      "acIndex": 1,
      "moduleId": "collision-score-integration"
    },
    {
      "target": "Maze completion -> Level state",
      "description": "[US-001#2] When remaining consumables hits zero, level-complete event propagates to screen/game-state managers.",
      "framework": "Vitest",
      "storyId": "US-001",
      "acIndex": 2,
      "moduleId": "level-flow"
    },
    {
      "target": "Input Manager + Pac-Man Controller",
      "description": "[US-002#0] Keyboard/swipe/button inputs produce identical movement outcomes through shared direction API.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 0,
      "moduleId": "input-pacman-integration"
    },
    {
      "target": "Ghost AI + Mode Scheduler",
      "description": "[US-003#1] Mode timer transitions alter active target provider and resulting path target coordinates.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 1,
      "moduleId": "ghost-mode-integration"
    },
    {
      "target": "Power pellet pipeline",
      "description": "[US-004#0] Pellet collision event fans out to all ghosts for frightened state, reversal, and speed update.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 0,
      "moduleId": "pellet-ghost-integration"
    },
    {
      "target": "Ghost eaten pipeline",
      "description": "[US-004#2] Frightened ghost collision updates score combo, ghost eyes state, and house-return/respawn sequence.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 2,
      "moduleId": "ghost-respawn-integration"
    },
    {
      "target": "Death reset pipeline",
      "description": "[US-005#2] Normal ghost collision triggers life decrement, death animation state, actor reset, and preserved maze consumables.",
      "framework": "Vitest",
      "storyId": "US-005",
      "acIndex": 2,
      "moduleId": "death-flow"
    },
    {
      "target": "Score->HUD->Audio extra life",
      "description": "[US-006#1] Threshold crossing updates lives, HUD, and plays extra-life cue exactly once.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 1,
      "moduleId": "score-hud-audio"
    },
    {
      "target": "Fruit lifecycle integration",
      "description": "[US-007#0] Dot counter milestones spawn fruit entity near center and register collision scoring hook.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 0,
      "moduleId": "fruit-flow"
    },
    {
      "target": "Difficulty application integration",
      "description": "[US-008#1] On level increment, difficulty config propagates to ghost speed, frightened timer, and scatter scheduler.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 1,
      "moduleId": "difficulty-application"
    },
    {
      "target": "Audio mute + settings persistence",
      "description": "[US-009#2] Mute toggle updates audio graph immediately and persists/reloads via settings store on app restart.",
      "framework": "Vitest",
      "storyId": "US-009",
      "acIndex": 2,
      "moduleId": "audio-settings-integration"
    },
    {
      "target": "Screen Manager + Game Loop",
      "description": "[US-010#1] Pause overlay activation freezes update ticks and resume restores deterministic progression.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 1,
      "moduleId": "screen-loop-integration"
    },
    {
      "target": "Game over initials + high score store",
      "description": "[US-011#1] Qualifying game-over flow opens initials entry, validates 3 chars, saves, and refreshes leaderboard view.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 1,
      "moduleId": "gameover-highscore-integration"
    },
    {
      "target": "Settings + Ghost Renderer + Storage",
      "description": "[US-013#1] Palette toggle in settings updates live ghost colors and persists across simulated reload.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 1,
      "moduleId": "palette-settings-integration"
    },
    {
      "target": "Service Worker precache manifest",
      "description": "[US-014#0] Build output includes SW and precache entries for app shell, sprites, audio, and core bundles.",
      "framework": "Vitest",
      "storyId": "US-014",
      "acIndex": 0,
      "moduleId": "pwa-build"
    },
    {
      "target": "Asset budget gate",
      "description": "[US-014#1] CI integration test computes total shipped static assets and fails if >2MB threshold.",
      "framework": "Vitest",
      "storyId": "US-014",
      "acIndex": 1,
      "moduleId": "build-budget"
    },
    {
      "target": "Root composition integration",
      "description": "[US-015#0] App entry composes managers/services and reaches ready state without missing dependency wiring.",
      "framework": "Vitest",
      "storyId": "US-015",
      "acIndex": 0,
      "moduleId": "bootstrap-integration"
    }
  ],
  "e2e": [
    {
      "scenario": "Maze renders with walls/corridors/ghost house/tunnel on first playable frame",
      "description": "[US-001#0] Launch app, start game, assert canvas snapshot/semantic markers indicate full maze features including tunnel and ghost house.",
      "criticalPath": true,
      "storyId": "US-001",
      "acIndex": 0,
      "moduleId": "maze-ui"
    },
    {
      "scenario": "Dots/pellets visible then removed when eaten",
      "description": "[US-001#1] Navigate Pac-Man to dot and pellet, verify visual removal and count reduction in HUD/debug overlay.",
      "criticalPath": true,
      "storyId": "US-001",
      "acIndex": 1,
      "moduleId": "maze-ui"
    },
    {
      "scenario": "Keyboard, swipe, and on-screen controls all move Pac-Man",
      "description": "[US-002#0] In desktop/mobile emulation, send arrow/WASD, swipe, and button taps; assert equivalent direction changes.",
      "criticalPath": true,
      "storyId": "US-002",
      "acIndex": 0,
      "moduleId": "controls"
    },
    {
      "scenario": "Continuous movement and tunnel wrap behavior",
      "description": "[US-002#1] Set direction once, verify continuous travel until wall and successful left-right tunnel wrap.",
      "criticalPath": true,
      "storyId": "US-002",
      "acIndex": 1,
      "moduleId": "controls"
    },
    {
      "scenario": "Distinct ghost behaviors observable in chase/scatter windows",
      "description": "[US-003#0] During controlled run, capture ghost target tendencies and confirm mode shifts alter pursuit patterns.",
      "criticalPath": false,
      "storyId": "US-003",
      "acIndex": 0,
      "moduleId": "ghosts"
    },
    {
      "scenario": "Power pellet triggers frightened mode with reversal and slowdown",
      "description": "[US-004#0] Eat pellet, assert all ghosts reverse, turn frightened visuals, and move slower.",
      "criticalPath": true,
      "storyId": "US-004",
      "acIndex": 0,
      "moduleId": "ghosts"
    },
    {
      "scenario": "Frightened ghost eaten returns as eyes then respawns",
      "description": "[US-004#2] Eat frightened ghost, verify eyes travel to house and ghost respawns normal after arrival.",
      "criticalPath": true,
      "storyId": "US-004",
      "acIndex": 2,
      "moduleId": "ghosts"
    },
    {
      "scenario": "Scoring and life-loss rules in live play",
      "description": "[US-005#0] Validate dot/pellet/fruit score increments and [US-005#2] normal ghost collision decrements life with reset preserving eaten dots.",
      "criticalPath": true,
      "storyId": "US-005",
      "acIndex": -1,
      "moduleId": "scoring-lives"
    },
    {
      "scenario": "Extra life at 10,000 with HUD/audio feedback",
      "description": "[US-006#1] Reach threshold via scripted play, assert +1 life exactly once and extra-life sound event.",
      "criticalPath": true,
      "storyId": "US-006",
      "acIndex": 1,
      "moduleId": "hud-audio"
    },
    {
      "scenario": "Fruit spawns twice and expires if ignored",
      "description": "[US-007#0] Trigger ~70 and ~170 dot milestones for spawn; [US-007#2] wait out timer and confirm despawn/non-collectable.",
      "criticalPath": false,
      "storyId": "US-007",
      "acIndex": -1,
      "moduleId": "fruit"
    },
    {
      "scenario": "Level completion and progression difficulty",
      "description": "[US-008#0] Clear board to transition screen then next level; [US-008#1] verify increased challenge parameters reflected in gameplay pace.",
      "criticalPath": true,
      "storyId": "US-008",
      "acIndex": -1,
      "moduleId": "leveling"
    },
    {
      "scenario": "Audio set and mute persistence",
      "description": "[US-009#0] Trigger key game events to confirm distinct sounds; [US-009#2] toggle mute, reload, verify persisted silence state.",
      "criticalPath": true,
      "storyId": "US-009",
      "acIndex": -1,
      "moduleId": "audio"
    },
    {
      "scenario": "Overlay screens flow and pause freeze",
      "description": "[US-010#1] Start->3-2-1-GO->play, pause/resume freeze check, level-complete and game-over overlays with restart path.",
      "criticalPath": true,
      "storyId": "US-010",
      "acIndex": -1,
      "moduleId": "screens"
    },
    {
      "scenario": "High score qualification and top-10 persistence",
      "description": "[US-011#1] Finish with qualifying score, enter 3 initials, save, reload, verify sorted top-10 retained.",
      "criticalPath": true,
      "storyId": "US-011",
      "acIndex": -1,
      "moduleId": "highscores"
    },
    {
      "scenario": "Keyboard-only accessibility across menus",
      "description": "[US-012#0] Navigate Start/Pause/GameOver/settings via keyboard only; verify visible focus indicators and pause/mute hotkeys in gameplay.",
      "criticalPath": true,
      "storyId": "US-012",
      "acIndex": -1,
      "moduleId": "a11y"
    },
    {
      "scenario": "Colorblind palette toggle persists and does not affect highscores",
      "description": "[US-013#2] Toggle palette, verify immediate ghost color change, reload persistence, and unchanged high score data.",
      "criticalPath": false,
      "storyId": "US-013",
      "acIndex": 2,
      "moduleId": "settings"
    },
    {
      "scenario": "Offline play after first load",
      "description": "[US-014#0] Visit online once, then run browser offline and confirm app boots and playable session starts from cache.",
      "criticalPath": true,
      "storyId": "US-014",
      "acIndex": 0,
      "moduleId": "pwa-offline"
    },
    {
      "scenario": "Responsive and smooth gameplay smoke across browsers",
      "description": "[US-014#2] Run Chromium/Firefox/WebKit at 375px and 2560px viewports; verify layout scaling and frame-time budget smoke thresholds.",
      "criticalPath": true,
      "storyId": "US-014",
      "acIndex": 2,
      "moduleId": "cross-browser"
    },
    {
      "scenario": "End-to-end boot wiring from root entry",
      "description": "[US-015#2] Launch production build from root, complete full session including pause, level transition, game over, and restart without manual intervention.",
      "criticalPath": true,
      "storyId": "US-015",
      "acIndex": 2,
      "moduleId": "app-e2e"
    }
  ],
  "coverageTargets": {
    "unit": 85,
    "integration": 65,
    "e2e": 100
  }
}
