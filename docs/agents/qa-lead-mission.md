# QA Lead — Test Plan

**Agent**: qa-lead  
**Generated**: 2026-08-16T21:00:47.731Z

---

## Test Plan

{
  "scope": "Comprehensive QA plan for the Pac-Man SPA/PWA using Vitest (unit/integration) and Playwright (E2E). Mandatory traceability rule: every test name must begin with [<storyId>#<acIndex>] (example: [US-005#0] dot collision adds 10 points). Place unit/integration specs under the repo test directories for Vitest (e.g., src/**/__tests__ or tests/unit, tests/integration per repo contract) and E2E specs under Playwright testDir (e.g., tests/e2e). This plan assumes no backend APIs; integration focuses on module wiring, event bus interactions, localStorage persistence, service worker/cache behavior, and browser runtime integration. No acceptance criteria are intentionally uncovered.",
  "unit": [
    {
      "target": "Maze Model & Renderer",
      "description": "[US-001#0] Validate tile map contains distinct wall/corridor types, ghost house coordinates, and at least one valid left-right tunnel linkage in model metadata.",
      "framework": "Vitest",
      "storyId": "US-001",
      "acIndex": 0,
      "moduleId": "maze-model"
    },
    {
      "target": "Maze Renderer (Canvas draw calls)",
      "description": "[US-001#1] Verify regular dots and exactly four power pellets are rendered at configured coordinates and removed from render list after consume events.",
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
      "target": "Input Manager",
      "description": "[US-002#0] Arrow/WASD/swipe/on-screen button inputs normalize to identical directional intent enum and dispatch through one API.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 0,
      "moduleId": "input-manager"
    },
    {
      "target": "Pac-Man Controller movement",
      "description": "[US-002#1] Pac-Man continues in last valid direction until wall collision and wraps correctly through tunnel exits.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 1,
      "moduleId": "pacman-controller"
    },
    {
      "target": "Pac-Man animation state",
      "description": "[US-002#2] Facing direction updates with movement vector and chomp animation toggles only while moving.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 2,
      "moduleId": "pacman-controller"
    },
    {
      "target": "Ghost AI targeting strategies",
      "description": "[US-003#0] Unit-test each ghost targeting function: direct chase, ambush ahead, flank/cutoff, chase-random hybrid outputs expected target tiles.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 0,
      "moduleId": "ghost-ai-controller"
    },
    {
      "target": "Ghost mode scheduler",
      "description": "[US-003#1] Chase/scatter timer transitions modes at configured intervals and target selector switches behavior by mode.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 1,
      "moduleId": "ghost-ai-controller"
    },
    {
      "target": "Ghost release controller",
      "description": "[US-003#2] Staggered ghost-house release order/timing at level start and after life loss reset.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 2,
      "moduleId": "ghost-ai-controller"
    },
    {
      "target": "Frightened mode state machine",
      "description": "[US-004#0] Power pellet event sets all ghosts frightened, reverses direction once, and applies speed reduction multiplier.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 0,
      "moduleId": "ghost-ai-controller"
    },
    {
      "target": "Frightened warning timer",
      "description": "[US-004#1] Final two seconds of frightened mode toggles flash/blink flag at configured cadence.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 1,
      "moduleId": "ghost-ai-controller"
    },
    {
      "target": "Ghost eaten/eyes return flow",
      "description": "[US-004#2] Frightened ghost collision transitions to eyes state, pathfinds to house, then respawns normal on arrival.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 2,
      "moduleId": "ghost-ai-controller"
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
      "target": "Frightened ghost combo scoring",
      "description": "[US-005#1] Consecutive frightened ghost eats within one pellet window score 200/400/800/1600 and reset after window ends.",
      "framework": "Vitest",
      "storyId": "US-005",
      "acIndex": 1,
      "moduleId": "score-manager"
    },
    {
      "target": "Death/life-loss reset logic",
      "description": "[US-005#2] Normal ghost collision decrements life, triggers death sequence, and resets actors without resetting consumed dots.",
      "framework": "Vitest",
      "storyId": "US-005",
      "acIndex": 2,
      "moduleId": "game-state"
    },
    {
      "target": "HUD score/lives presenter",
      "description": "[US-006#0] Score UI model updates immediately on score events and visibility flag remains true during gameplay state.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 0,
      "moduleId": "score-manager"
    },
    {
      "target": "Extra life threshold rule",
      "description": "[US-006#1] First crossing of 10,000 grants exactly one life and emits distinct extra-life audio event once only.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 1,
      "moduleId": "score-manager"
    },
    {
      "target": "Initial lives/game-over threshold",
      "description": "[US-006#2] New game starts with 3 lives and decrements to game-over at zero with no underflow.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 2,
      "moduleId": "score-manager"
    },
    {
      "target": "Bonus Fruit spawn scheduler",
      "description": "[US-007#0] Fruit spawn triggers near center at ~70 and ~170 dots eaten once each per level.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 0,
      "moduleId": "bonus-fruit-system"
    },
    {
      "target": "Fruit table mapping",
      "description": "[US-007#1] Fruit type and point value resolve by level according to configured table.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 1,
      "moduleId": "bonus-fruit-system"
    },
    {
      "target": "Fruit timeout behavior",
      "description": "[US-007#2] Uncollected fruit despawns after lifetime and subsequent collision checks do not award points.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 2,
      "moduleId": "bonus-fruit-system"
    },
    {
      "target": "Level progression trigger",
      "description": "[US-008#0] Last consumable event marks level complete and emits transition-to-next-level event.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 0,
      "moduleId": "level-manager"
    },
    {
      "target": "Difficulty curve calculator",
      "description": "[US-008#1] Per-level parameters increase ghost speed and reduce frightened/scatter durations per curve config.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 1,
      "moduleId": "level-manager"
    },
    {
      "target": "Difficulty cap repeater",
      "description": "[US-008#2] Levels >20 reuse capped hardest settings without further increase.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 2,
      "moduleId": "level-manager"
    },
    {
      "target": "Audio event routing",
      "description": "[US-009#0] Startup/dot/pellet/ghost/death/fruit/extra-life events map to distinct sound IDs.",
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
      "target": "Mute setting persistence",
      "description": "[US-009#2] Global mute immediately suppresses active/new sounds and persists/reloads from settings store.",
      "framework": "Vitest",
      "storyId": "US-009",
      "acIndex": 2,
      "moduleId": "settings-store"
    },
    {
      "target": "Screen state machine",
      "description": "[US-010#0] Start/Countdown/Pause/LevelComplete/GameOver overlay states expose accessible labels and focusable controls metadata.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 0,
      "moduleId": "screen-manager"
    },
    {
      "target": "Countdown/pause logic",
      "description": "[US-010#1] Start triggers 3-2-1-GO sequence timing; pause halts simulation ticks until resume.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 1,
      "moduleId": "screen-manager"
    },
    {
      "target": "Game over/level complete transitions",
      "description": "[US-010#2] Game over payload includes final score and restart action; level complete auto-advances after brief delay.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 2,
      "moduleId": "screen-manager"
    },
    {
      "target": "High score store CRUD",
      "description": "[US-011#0] localStorage read/write roundtrip persists top-10 list across reload simulation.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 0,
      "moduleId": "high-score-store"
    },
    {
      "target": "Initials validation",
      "description": "[US-011#1] Qualifying score prompts 3-letter initials; accepts valid input and saves on confirm.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 1,
      "moduleId": "high-score-store"
    },
    {
      "target": "Top-10 sorting/truncation",
      "description": "[US-011#2] Entries sorted descending by score and truncated to 10 records.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 2,
      "moduleId": "high-score-store"
    },
    {
      "target": "Keyboard navigation map",
      "description": "[US-012#0] All interactive controls are reachable/activatable via tab/enter/space key handling map.",
      "framework": "Vitest",
      "storyId": "US-012",
      "acIndex": 0,
      "moduleId": "screen-manager"
    },
    {
      "target": "Focus style state",
      "description": "[US-012#1] Focus-visible class/state applied for controls on Start/Pause/GameOver/Settings overlays.",
      "framework": "Vitest",
      "storyId": "US-012",
      "acIndex": 1,
      "moduleId": "ui-accessibility"
    },
    {
      "target": "Gameplay keyboard bindings",
      "description": "[US-012#2] Pause and mute keybindings dispatch during active gameplay without pointer events.",
      "framework": "Vitest",
      "storyId": "US-012",
      "acIndex": 2,
      "moduleId": "input-manager"
    },
    {
      "target": "Palette toggle setting",
      "description": "[US-013#0] Settings toggle flips default vs colorblind palette flag.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 0,
      "moduleId": "settings-store"
    },
    {
      "target": "Ghost palette resolver",
      "description": "[US-013#1] Ghost renderer applies selected palette immediately and on boot from persisted setting.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 1,
      "moduleId": "ghost-renderer"
    },
    {
      "target": "Settings isolation",
      "description": "[US-013#2] Persisting settings does not mutate/remove high score keys in localStorage.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 2,
      "moduleId": "settings-store"
    },
    {
      "target": "PWA manifest/cache config validator",
      "description": "[US-014#0] Workbox/vite-plugin-pwa config includes app shell and required static assets in precache manifest.",
      "framework": "Vitest",
      "storyId": "US-014",
      "acIndex": 0,
      "moduleId": "offline-cache"
    },
    {
      "target": "Build budget checker",
      "description": "[US-014#1] Build artifact size assertion enforces total shipped assets under 2MB and no backend endpoint dependency flags.",
      "framework": "Vitest",
      "storyId": "US-014",
      "acIndex": 1,
      "moduleId": "build-quality"
    },
    {
      "target": "Bootstrap wiring contract",
      "description": "[US-015#0] Main entry initializes screen/input/audio/score/game-loop modules in required order and subscribes event channels.",
      "framework": "Vitest",
      "storyId": "US-015",
      "acIndex": 0,
      "moduleId": "app-shell"
    }
  ],
  "integration": [
    {
      "target": "Game loop + maze + collision + score pipeline",
      "description": "[US-001#1] Consuming dot/pellet in simulation frame removes render entity and updates remaining count and score event chain.",
      "framework": "Vitest",
      "storyId": "US-001",
      "acIndex": 1,
      "moduleId": "engine-integration"
    },
    {
      "target": "Input manager + pacman controller + maze collision",
      "description": "[US-002#1] Direction intent from normalized input drives continuous movement until wall block and tunnel wrap in live tick loop.",
      "framework": "Vitest",
      "storyId": "US-002",
      "acIndex": 1,
      "moduleId": "movement-integration"
    },
    {
      "target": "Ghost AI + mode timer + release manager",
      "description": "[US-003#1] Integrated ghost update cycle switches chase/scatter targets and respects staggered release gates.",
      "framework": "Vitest",
      "storyId": "US-003",
      "acIndex": 1,
      "moduleId": "ghost-integration"
    },
    {
      "target": "Power pellet event bus integration",
      "description": "[US-004#0] Pellet collision broadcasts frightened event to all ghosts, applies reversal/speed change, and starts frightened timer.",
      "framework": "Vitest",
      "storyId": "US-004",
      "acIndex": 0,
      "moduleId": "frightened-integration"
    },
    {
      "target": "Collision + score manager + life reset",
      "description": "[US-005#2] Normal ghost collision decrements lives, runs death sequence, and restores actor positions while preserving maze consumables.",
      "framework": "Vitest",
      "storyId": "US-005",
      "acIndex": 2,
      "moduleId": "death-reset-integration"
    },
    {
      "target": "Score manager + HUD + audio manager",
      "description": "[US-006#1] Crossing 10,000 updates lives UI and triggers extra-life sound exactly once in integrated event flow.",
      "framework": "Vitest",
      "storyId": "US-006",
      "acIndex": 1,
      "moduleId": "score-audio-ui-integration"
    },
    {
      "target": "Dot counter + fruit system + collision",
      "description": "[US-007#0] Fruit spawns at two thresholds and can be collected for level-specific points through collision pipeline.",
      "framework": "Vitest",
      "storyId": "US-007",
      "acIndex": 0,
      "moduleId": "fruit-integration"
    },
    {
      "target": "Level complete + transition + difficulty apply",
      "description": "[US-008#0] Clearing last consumable triggers level-complete overlay then next-level init with updated difficulty params.",
      "framework": "Vitest",
      "storyId": "US-008",
      "acIndex": 0,
      "moduleId": "level-flow-integration"
    },
    {
      "target": "Audio manager + settings store",
      "description": "[US-009#2] Mute toggle updates runtime audio graph and persists to localStorage, restored on app re-init.",
      "framework": "Vitest",
      "storyId": "US-009",
      "acIndex": 2,
      "moduleId": "audio-settings-integration"
    },
    {
      "target": "Screen manager + game loop pause control",
      "description": "[US-010#1] Pause overlay activation halts engine updates and resume continues from same state.",
      "framework": "Vitest",
      "storyId": "US-010",
      "acIndex": 1,
      "moduleId": "screen-loop-integration"
    },
    {
      "target": "Game over + high score qualification flow",
      "description": "[US-011#1] Final score qualification opens initials entry, saves to store, and refreshes sorted top-10 list.",
      "framework": "Vitest",
      "storyId": "US-011",
      "acIndex": 1,
      "moduleId": "highscore-flow-integration"
    },
    {
      "target": "Keyboard controls across overlays + gameplay",
      "description": "[US-012#2] Keyboard-only pause/mute and menu activation work without mouse across state transitions.",
      "framework": "Vitest",
      "storyId": "US-012",
      "acIndex": 2,
      "moduleId": "a11y-input-integration"
    },
    {
      "target": "Settings store + ghost renderer + boot sequence",
      "description": "[US-013#1] Palette toggle applies immediately and remains after reload through persisted settings hydration.",
      "framework": "Vitest",
      "storyId": "US-013",
      "acIndex": 1,
      "moduleId": "palette-integration"
    },
    {
      "target": "Service worker registration + cache + app boot",
      "description": "[US-014#0] After first online load, cached shell/assets allow successful offline boot path in integration harness.",
      "framework": "Vitest",
      "storyId": "US-014",
      "acIndex": 0,
      "moduleId": "pwa-integration"
    },
    {
      "target": "App entrypoint full wiring smoke",
      "description": "[US-015#2] Single-page build bootstraps to interactive state with start->countdown->gameplay->pause->gameover->restart transitions.",
      "framework": "Vitest",
      "storyId": "US-015",
      "acIndex": 2,
      "moduleId": "app-shell-integration"
    }
  ],
  "e2e": [
    {
      "scenario": "Start screen to gameplay render verification",
      "description": "[US-001#0] Launch app, start game, assert maze walls/corridors/ghost house/tunnel are visibly rendered on canvas and overlay hidden during play.",
      "criticalPath": true,
      "storyId": "US-001",
      "acIndex": 0,
      "moduleId": "ui-canvas"
    },
    {
      "scenario": "Cross-input control journey",
      "description": "[US-002#0] Validate keyboard arrows/WASD, touch swipe (mobile emulation), and on-screen buttons all move Pac-Man via same behavior.",
      "criticalPath": true,
      "storyId": "US-002",
      "acIndex": 0,
      "moduleId": "input-e2e"
    },
    {
      "scenario": "Ghost behavior authenticity run",
      "description": "[US-003#0] During timed play, observe distinct ghost pursuit patterns and chase/scatter alternation with staggered release from house.",
      "criticalPath": true,
      "storyId": "US-003",
      "acIndex": 0,
      "moduleId": "ghost-e2e"
    },
    {
      "scenario": "Power pellet frightened cycle",
      "description": "[US-004#0] Eat pellet, verify all ghosts reverse/slow, flash near end, and eaten ghost returns as eyes then respawns normal.",
      "criticalPath": true,
      "storyId": "US-004",
      "acIndex": 0,
      "moduleId": "frightened-e2e"
    },
    {
      "scenario": "Scoring and life-loss rules session",
      "description": "[US-005#0] In one run verify dot/pellet/fruit points, frightened combo escalation, and normal ghost death life decrement/reset behavior.",
      "criticalPath": true,
      "storyId": "US-005",
      "acIndex": 0,
      "moduleId": "score-collision-e2e"
    },
    {
      "scenario": "HUD and extra-life milestone",
      "description": "[US-006#1] Reach 10,000 points, assert exactly one extra life granted, cue played, and score/lives always visible.",
      "criticalPath": true,
      "storyId": "US-006",
      "acIndex": 1,
      "moduleId": "hud-e2e"
    },
    {
      "scenario": "Fruit spawn/despawn timing",
      "description": "[US-007#0] Consume dots to thresholds ~70/~170, verify center fruit appears twice per level and disappears after timeout if ignored.",
      "criticalPath": false,
      "storyId": "US-007",
      "acIndex": 0,
      "moduleId": "fruit-e2e"
    },
    {
      "scenario": "Level progression and difficulty scaling",
      "description": "[US-008#0] Clear board, confirm level-complete overlay then next level with harder ghost/frightened/scatter settings; verify cap behavior after level 20 via seeded state.",
      "criticalPath": true,
      "storyId": "US-008",
      "acIndex": 0,
      "moduleId": "level-e2e"
    },
    {
      "scenario": "Audio and mute persistence",
      "description": "[US-009#2] Verify event sounds and siren playback-rate changes; toggle mute and confirm immediate silence and persistence after reload.",
      "criticalPath": true,
      "storyId": "US-009",
      "acIndex": 2,
      "moduleId": "audio-e2e"
    },
    {
      "scenario": "Overlay accessibility flow",
      "description": "[US-010#0] Validate Start/Countdown/Pause/Level Complete/Game Over overlays have readable text, focusable controls, and correct transitions.",
      "criticalPath": true,
      "storyId": "US-010",
      "acIndex": 0,
      "moduleId": "screen-e2e"
    },
    {
      "scenario": "High score qualification and persistence",
      "description": "[US-011#1] Finish qualifying game, enter 3-letter initials, save, reload browser context, and verify sorted top-10 retained.",
      "criticalPath": true,
      "storyId": "US-011",
      "acIndex": 1,
      "moduleId": "highscore-e2e"
    },
    {
      "scenario": "Keyboard-only accessibility journey",
      "description": "[US-012#0] Complete start->pause->resume->gameover->restart using only keyboard; assert visible focus indicators on each interactive screen.",
      "criticalPath": true,
      "storyId": "US-012",
      "acIndex": 0,
      "moduleId": "a11y-e2e"
    },
    {
      "scenario": "Colorblind palette persistence",
      "description": "[US-013#1] Toggle colorblind palette in settings, verify immediate ghost color change and persistence after reload without high score corruption.",
      "criticalPath": false,
      "storyId": "US-013",
      "acIndex": 1,
      "moduleId": "palette-e2e"
    },
    {
      "scenario": "Offline and performance/budget validation",
      "description": "[US-014#0] First load online then switch offline and reload successfully; run FPS/responsive checks across viewport sizes and verify static asset budget report under 2MB.",
      "criticalPath": true,
      "storyId": "US-014",
      "acIndex": 0,
      "moduleId": "pwa-perf-e2e"
    },
    {
      "scenario": "Full app wiring end-to-end smoke",
      "description": "[US-015#1] From root entry complete full playable session through start, countdown, gameplay, pause, level transition, game over, and restart without manual intervention.",
      "criticalPath": true,
      "storyId": "US-015",
      "acIndex": 1,
      "moduleId": "app-shell-e2e"
    }
  ],
  "coverageTargets": {
    "unit": 85,
    "integration": 65,
    "e2e": 100
  }
}
