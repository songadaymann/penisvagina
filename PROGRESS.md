# Penis vs Vagina - Development Progress

## Overview
A charmingly crude, hand-drawn multiplayer platformer built with Phaser 3 and PartyKit. Players control walking penis or vagina characters that shoot projectiles at flying MAGA and ICE hats. Supports both single-player and 2-player online multiplayer with CO-OP and COMPETE modes.

**Live URL:** https://penis-vagina.songadaymann.partykit.dev

## What We've Built

### Core Game Setup
- **Phaser 3** game engine with arcade physics
- **Full-screen responsive** canvas that scales with window size
- **Hand-drawn aesthetic** - wobbly ground line and platforms that look sketched
- **Pixel art mode** enabled for crisp scaling

### Character Select Screen
- Displays "PENIS VAGINA" title at top
- Shows both characters side by side with selection boxes
- "Choose Yer Fighter!" text at bottom
- Controls: LEFT/RIGHT arrows to select, ENTER/SPACE to start
- Click/tap on character to select and start
- Intro music plays during selection

### Player Characters
- **Penis** - 8-frame walk cycle animation from spritesheet
- **Vagina** - 8-frame walk cycle animation from individual frames
- Both have idle animations
- Physics-based movement and jumping
- **Double jump** - can jump once from ground, then again in mid-air
- **Controls:**
  - Arrow keys for movement (speed: 750)
  - Up arrow to jump (jumpSpeed: -750) - press again mid-air for double jump
  - Spacebar or tap/click to shoot
- Responsive scaling based on screen size (0.35 base scale at 1080p)
- Character-specific hitboxes and projectile origins

### Projectile System
- Hand-drawn droplet projectile
- Shoots from character-specific origin point
- Arc trajectory with gravity:
  - Horizontal speed: 700
  - Vertical speed: -1000 (shoots up)
  - Gravity: 600 (arcs down)
- Destroys hats on collision
- **Spurt effect** - 4 smaller visual droplets spray both directions on shoot
- Screen shake feedback on shooting

### Ammo/Cooldown System
- **Vertical ammo bar** displayed under score (upper right)
- Hand-drawn wobbly style with black outline, white fill
- Bar fills from bottom to top as ammo regenerates
- **Settings:**
  - `ammoCost = 0.20` - each shot uses 20% (about 5 shots max)
  - `ammoRegenRate = 0.5` - regenerates 50% per second
  - `minAmmoToShoot = 0.18` - need 18% to fire
- **Depletion penalty:** When bar empties, 1 second delay before regeneration starts
- Gray threshold line shows minimum ammo needed to shoot
- Red outline flash when ammo is too low

### Enemy Hats
- **MAGA hats** (hat1.png, hat2.png) - flapping wing animation
- **ICE hats** (icehat1.png, icehat2.png) - flapping wing animation
- 50/50 random spawn of either type
- Spawn every 3 seconds from right side of screen
- Float across screen with bobbing motion
- Scale: 0.15 - 0.25 (random)

### Lives & Scoring System
- **3 lives** displayed as character icons in upper left corner
- **Score counter** in upper right - increments when killing hats
- Getting hit by a hat:
  - Lose a life
  - Flash red and blink (1.5 seconds invincibility)
  - Screen shake
- **Game Over screen** when all lives gone:
  - Shows "GAME OVER" and final score
  - Click or ENTER to restart

### Hit Effects
- **Explosion animations** - alternates between big and small
- **Smoke animations** - follows explosion with slight delay
- Screen shake on hit

### Platforms
- Hand-drawn wobbly rectangular platforms
- Spawn randomly ahead of player
- Random widths (100-250px) and heights (15-60% up from ground)
- Random gaps between platforms (400-800px)
- **One-way collision** - can jump through from below, land on top
- Player renders in front of platforms
- Clean up when behind camera

### Camera & World
- Camera follows player horizontally only (not vertically)
- Camera offset to show more of what's ahead
- Ground line draws itself as player moves (extends dynamically in BOTH directions)
- Can walk left and ground will extend behind you
- Very wide ground collision (100000 px) for endless scrolling

### Parallax Backgrounds
- **Sky** - fixed, doesn't move (scroll factor: 0)
- **Background clouds** - very slow (scroll factor: 0.1)
- **Glacial mountains** - slow (scroll factor: 0.2)
- **Mid-ground clouds 3** - medium slow (scroll factor: 0.3)
- **Mid-ground clouds 2** - medium (scroll factor: 0.4)
- **Mid-ground clouds 1** - medium fast (scroll factor: 0.5)
- **Lonely cloud** - drifts across occasionally between mid-ground layers
- All layers scaled to fit screen height and tiled horizontally

### Audio
- **Intro music** - plays on character select screen (loops)
- **Game music** - plays during gameplay (loops)
- Music stops appropriately on scene transitions and game over

### Debug Tools Created
- `hitbox-test.html` - Slider tool for adjusting hat hitbox
- `hitbox-penis.html` - Slider tool for adjusting penis hitbox
- `hitbox-vagina.html` - Slider tool for adjusting vagina hitbox and projectile origin
- `ground-test.html` - Slider tool for adjusting ground height

## Current Settings

### Movement
- Walk speed: 750
- Jump speed: -750
- World gravity: 800

### Projectile (Charge-Based)
- **Quick tap** (0% charge): Horizontal 350, Vertical -500
- **Full charge** (100%): Horizontal 900, Vertical -1200
- Charge time: 600ms to reach full charge
- Projectile gravity: 600
- Scale: 1.0x character scale

### Character Hitboxes (Dual Hitbox System)
Each character has TWO hitboxes:
1. **Foot Hitbox** (circle) - for terrain collision, allows smooth traversal
2. **Body Hitbox** (rectangle) - for enemy/hat collision, covers the character body

**Penis:**
- Foot: `setCircle(294)`, `setOffset(134, 1106)`
- Body: 1061x1201, offsetX: 0, offsetY: -347
- projOffset: {x: 498, y: -814}

**Vagina:**
- Foot: `setCircle(303)`, `setOffset(135, 1083)`
- Body: 517x1012, offsetX: -184, offsetY: -281
- projOffset: {x: -26, y: -157}

### Ground
- Position: `height - (height * 0.04)` (4% from bottom)
- Drawn as wobbly hand-drawn line

### Hats
- Spawn Y: 100 to 40% of screen height
- Scale: 0.15 - 0.25
- Speed: 100-250 (moving left)
- Bob amplitude: 20px

## File Structure
```
/
├── index.html              # Main game page (clean, no debug)
├── package.json            # NPM config with partykit scripts
├── partykit.json           # PartyKit configuration
├── js/
│   └── game.js             # Main game code (7 scenes, ~2000 lines)
├── party/
│   └── server.ts           # PartyKit multiplayer server (TypeScript)
├── assets/
│   ├── penis/              # Penis spritesheet + individual frames
│   ├── vagina/             # Vagina animation frames (1-8)
│   ├── hat/                # MAGA hat frames (hat1, hat2)
│   │   ├── icehat1.png     # ICE hat frames
│   │   └── icehat2.png
│   ├── parallax/           # Background layers
│   │   ├── sky.png
│   │   ├── clouds_bg.png
│   │   ├── glacial_mountains.png
│   │   ├── clouds_mg_1.png
│   │   ├── clouds_mg_2.png
│   │   ├── clouds_mg_3.png
│   │   └── cloud_lonely.png
│   ├── Explosion/          # Explosion animations (Big/Small 1-4)
│   ├── GreySmoke/          # Smoke animations (Big/Small 1-4)
│   ├── projectile.png      # Projectile sprite
│   ├── intro-screen.png    # "PENIS VAGINA" title
│   ├── chooseFighterText.png # "Choose Yer Fighter!" text
│   ├── intromusic.mp3      # Character select music
│   └── gameMusic.mp3       # Gameplay music
├── hitbox-test.html        # Hat hitbox adjuster
├── hitbox-penis.html       # Penis hitbox adjuster
├── hitbox-vagina.html      # Vagina hitbox adjuster
└── ground-test.html        # Ground height adjuster
```

## Multiplayer (NEW!)

### PartyKit Integration
- **Server:** `party/server.ts` - TypeScript server deployed to PartyKit
- **URL:** `https://penis-vagina.songadaymann.partykit.dev`
- **Real-time WebSocket** communication for position sync, shooting, hits

### New Game Flow
```
START
  ↓
[1 PLAYER] or [2 PLAYER]
  ↓              ↓
  ↓         [CREATE] or [JOIN]
  ↓              ↓           ↓
  ↓         (get 4-char code) (enter code)
  ↓              ↓           ↓
  ↓         [CO-OP] or [COMPETE]
  ↓              ↓
[CHOOSE FIGHTER]  (random assigned)
  ↓              ↓
      GAME START
```

### Multiplayer Modes
- **CO-OP:** 6 shared lives, combined team score, play until dead
- **COMPETE:** 90-second timer, individual scores, most kills wins

### New Scenes
- `ModeSelectScene` - 1 Player / 2 Player choice
- `LobbyChoiceScene` - Create Room / Join Room
- `CreateRoomScene` - Displays room code, mode selection, start game
- `JoinRoomScene` - Enter 4-character code to join
- `WaitingScene` - Non-host waits for game start

### Multiplayer Features
- Room codes (4 characters, e.g., "AB3K")
- Random character assignment (opposite of other player)
- Remote player rendered with blue tint + slight transparency
- Position sync at 20 updates/second
- Server-authoritative hat spawning (both players see same hats)
- Projectile sync (see other player's shots)
- Shared lives display for co-op
- Timer display for compete mode
- Game over with winner announcement

### Running Locally
```bash
npm run dev    # Starts PartyKit dev server on localhost:1999
```

### Deploying
```bash
npm run deploy  # Deploys to PartyKit cloud
```

## Difficulty Progression System

The game features exponential difficulty scaling over ~10 minutes, building from a calm start to total chaos.

### Full Timeline

| Time | Phase | Spawn Rate | Hat Speed | Hat Size | Flight Patterns | Terrain | Hats/Spawn |
|------|-------|------------|-----------|----------|-----------------|---------|------------|
| **0-2 min** | CALM | 4 sec | 100-200 | Large (0.15-0.25) | Straight only | Flat | 1 |
| **2-4 min** | RISING | ~3 sec | 150-280 | Medium-large | + Small sine waves | Gentle hills (30px) | 1 |
| **4-6 min** | INTENSE | ~2 sec | 220-380 | Medium | + Large sine waves | Steep hills (80px) | 1 |
| **6-8 min** | CHAOS | ~1 sec | 300-450 | Medium-small | + Diagonal bouncing | Blocky/pyramid (100px) | 1-2 |
| **8-10 min** | PANDEMONIUM | 0.3 sec | 400-600 | Small (0.10-0.15) | + Homing (tracks player) | Chaotic mix (150px) | 2-3 |

### DifficultyManager Class
- Tracks elapsed time and calculates difficulty multiplier (exponential curve: `t^1.5`)
- 10-minute progression (`maxTime = 600` seconds)
- All scaling values derived from single difficulty multiplier (0 to 1)

### Flight Patterns (unlock progressively)
- **`straight`** (0 min) - horizontal movement only, no vertical motion
- **`sineSmall`** (2 min) - small sine wave bobbing, 20px amplitude
- **`sineLarge`** (4 min) - large sine waves, 60-100px amplitude, faster oscillation
- **`diagonal`** (6 min) - bounces diagonally across screen, reverses at top/bottom
- **`homing`** (8 min) - tracks toward player position, accelerates when close (<400px)

### Dynamic Terrain
- **`flat`** (0-2 min) - standard flat ground, uses single physics body
- **`gentleHills`** (2-4 min) - smooth sine wave hills, 30px amplitude
- **`steepHills`** (4-6 min) - steeper hills with secondary wave overlay, 80px amplitude
- **`blocky`** (6-8 min) - step/pyramid terrain, quantized to 30px steps, 100px max
- **`chaotic`** (8-10 min) - combination of waves + deterministic pseudo-random blocks, 150px amplitude
- Terrain uses segmented physics bodies (50px wide) that spawn in both directions
- Ground line extends left AND right as player moves

### UI Elements
- **Time display** (center top) - shows elapsed game time (MM:SS format)
- **Difficulty indicator** (below time) - text label with color coding:
  - CALM (grey) → RISING (green) → INTENSE (orange) → CHAOS (red) → PANDEMONIUM (bright red)

## Recent Session Changes (Jan 21, 2025 - Session 5)

### Charge-Based Projectile System
Added hold-to-charge mechanic for projectiles:
- **Quick tap**: Projectile travels shorter distance (horiz: 350, vert: -500)
- **Hold for ~0.6 seconds**: Projectile travels maximum distance (horiz: 900, vert: -1200)
- Velocity interpolates linearly between min and max based on charge time
- **Visual feedback**: Droplet particles spawn and intensify while charging
  - Low charge: 1 small droplet every ~150ms
  - Full charge: 4 larger droplets every ~30ms, moving faster
  - Droplets spray in all directions, biased upward (like bubbling)
  - Player shakes with increasing intensity as charge builds
  - Spawn radius grows so droplets spread further apart at higher charge

### Simplified Difficulty System
Removed terrain variation (was causing physics sync issues), kept all other difficulty features:
- **Terrain**: Always flat now (removed gentleHills, steepHills, blocky, chaotic)
- **Hat spawn rate**: Smooth ramp from 4 seconds to 0.3 seconds over 10 minutes
- **Hats per spawn**: Probability-based system
  - Start: 90% 1-hat, 7% 2-hat, 2% 3-hat, 1% 4-hat
  - End: 10% 1-hat, 25% 2-hat, 30% 3-hat, 35% 4-hat
- **Flight patterns**: Probability-based selection
  - Start: 90% straight, 10% complex patterns
  - End: 10% straight, 90% complex (sine, diagonal, homing)
  - Homing only appears after ~30% difficulty
- **Hat sizes**: Smooth ramp from 0.18-0.28 to 0.10-0.15 scale
- **UI phases**: CALM (0-20%) → RISING (20-40%) → INTENSE (40-60%) → CHAOS (60-80%) → PANDEMONIUM (80-100%)

### Camera Fix
- Disabled vertical camera follow (was causing ground to appear in middle of screen)
- Camera now only follows player horizontally since terrain is flat

### Visual Improvements
- Explosions scaled up 50% (from 4x to 6x multiplier)
- Debug hitboxes disabled

### Multiplayer Character Selection
Players can now choose their character in 2-player mode (both can be same character):
- **CreateRoomScene**: Pick character before room is created, see player 2's choice when they join
- **JoinRoomScene**: Pick character before entering room code
- **Server**: Updated to accept `character` field in join message
- Both players can be penises or both can be vaginas

---

## Previous Session Changes (Jan 21, 2025 - Session 4)

### Matter.js Alternate Version Created
Created a complete rewrite of the game in `/alternate/` folder using Matter.js physics instead of Arcade Physics, specifically to solve the terrain sync problem.

**New Files:**
- `/alternate/index.html` - HTML shell for Matter.js version
- `/alternate/game.js` - Complete rewrite (~800 lines) with Matter.js physics
- `/alternate/hitbox-test.html` - Interactive hitbox tuning tool for Matter.js compound bodies

**Key Changes in Alternate Version:**
- **Matter.js physics** instead of Arcade Physics for proper polygon terrain
- **TerrainManager class** - Creates polygon terrain chunks that exactly match the heightfield
- **Heightfield-based terrain** - Single source of truth for both visual and physics
- **Compound hitboxes** - Each character has feet circle (for terrain) + body rectangle (for collisions)

### Heightfield Terrain System (Original Game)
Added heightfield approach to the original `js/game.js` as first attempt to fix terrain sync:
- `this.heightfield = new Map()` - stores Y positions at grid points
- `this.heightfieldResolution = 20` - pixels between samples
- Functions: `initializeHeightfield()`, `computeAndStoreHeight()`, `getHeightAtX()`, `extendHeightfield()`, `rebuildHeightfield()`
- Physics segments now read from heightfield instead of recalculating

### Hitbox Test Tool (Matter.js)
Created comprehensive slider-based hitbox testing tool at `/alternate/hitbox-test.html`:
- **Shape types:** Single Circle, Compound (Feet + Body), Rectangle
- **Compound mode controls:**
  - Feet Circle: radius (50-1500), offset X (-1000 to 1000), offset Y (0-2000)
  - Body Rectangle: width (50-2000), height (50-2500), offset X (-1000 to 1000), offset Y (-1500 to 800)
- **Physics properties:** friction, restitution, scale
- **Features:** Live preview with Matter.js debug, copy config button, per-character defaults
- Arrow keys to walk/jump and test hitbox behavior

### Character Hitbox Configs (Tuned)
Added `HITBOX_CONFIGS` object to `/alternate/game.js` with tuned values:

**Penis:**
```javascript
{
    shapeType: 'compound',
    feetRadius: 300, feetOffsetX: 436, feetOffsetY: 1380,
    bodyWidth: 584, bodyHeight: 1128, bodyOffsetX: 789, bodyOffsetY: 573,
    scale: 0.25, friction: 0.3, restitution: 0
}
```

**Vagina:**
```javascript
{
    shapeType: 'compound',
    feetRadius: 373, feetOffsetX: 479, feetOffsetY: 1299,
    bodyWidth: 452, bodyHeight: 883, bodyOffsetX: 292, bodyOffsetY: 514,
    scale: 0.25, friction: 0.3, restitution: 0
}
```

### Debug Visualization
- Enabled `DEBUG.showPhysics = true` in alternate version to show Matter.js wireframes
- Enabled `DEBUG.showHitboxes = true` to show player compound bodies

### Asset Path Fixes
Fixed multiple 404 errors in alternate version:
- Penis uses atlas format (`penis.png` + `penis.json`), not spritesheet
- Vagina frame 1 has typo: `vainga1.png` (not `vagina1.png`)
- Explosion files: `ExplosionBig1.png`, `ExplostionSmall1.png` (typo in "Small")
- Smoke files: `smokeBig1.png`, `smokeSmall1.png` (flat structure, not subdirectories)

### File Structure Update
```
/alternate/
├── index.html          # Matter.js version HTML shell
├── game.js             # Complete Matter.js rewrite
└── hitbox-test.html    # Compound hitbox tuning tool
```

---

## Previous Session Changes (Jan 21, 2025 - Session 3)

### mann.cool Virtual Controller Integration
Added support for playing the game embedded in mann.cool with virtual controller overlay.

**postMessage API Support:**
- Added `window.touchControls` global object to track virtual controller state
- Listens for `message` events from parent window (mann.cool iframe)
- Handles `keyEvent` type for arrow keys, WASD, and space
- Handles `clickEvent` type for shoot button
- Auto-resumes audio context when it gets suspended (browser policy)

**Phaser Configuration:**
- Added `pauseOnBlur: false` to prevent game pausing when clicking virtual controller outside iframe

**Menu Navigation (Keyboard + Touch):**
- `ModeSelectScene`: Up/Down to navigate 1P/2P options, action to select
- `SelectScene`: Left/Right to choose character, action to confirm
- `LobbyChoiceScene`: Up/Down to navigate Create/Join/Back, action to select
- All menus now highlight selected option with thicker border

**Gameplay Controls (Touch):**
- Movement: virtual D-pad left/right
- Jump: virtual D-pad up (supports double-jump with state tracking)
- Shoot: action button (with "just pressed" detection to prevent rapid-fire)

**State Tracking for "Just Pressed" Detection:**
Virtual controller sends continuous keydown/keyup, so we track previous frame state:
- `this.touchLeftPressed`, `this.touchRightPressed`
- `this.touchUpPressed`, `this.touchDownPressed`
- `this.touchActionPressed`, `this.touchJumpPressed`

---

## Previous Session Changes (Jan 21, 2025 - Session 2)

### Terrain Physics Sync Attempts
Attempted to fix terrain physics segments getting out of sync with drawn ground line:

**Changes made:**
- Added `getGroundLineYAtX()` - interpolates Y from actual drawn ground line points instead of recalculating from terrain formula
- Physics segments now sample the drawn line at left/center/right edges, use highest point (min Y)
- Reduced segment width from 80px to 40px for more accurate terrain following
- Added 20px overlap between segments to prevent gaps
- Reduced terrain amplitudes to keep slopes walkable (~30° max):
  - gentleHills: 180px, steepHills: 200px, blocky: 220px, chaotic: 200px
- Added `rebuildGroundLine()` that clears and rebuilds all ground points when terrain type changes
- Track `lastTerrainType` to detect terrain transitions

**Still broken:** Ground line and physics segments still drift out of sync over time. The fundamental issue is that the visual ground line (drawn incrementally as player moves) and physics segments (created/destroyed dynamically) use different timing and can diverge.

**Root cause analysis:**
- Ground line points are created once with wobble and stored
- Physics segments are created later and may sample different X positions
- The interpolation between ground points doesn't perfectly match segment positions
- Over time, small mismatches accumulate

**Potential future solutions:**
1. **Matter.js** - Use polygon bodies that exactly trace the ground line
2. **Single source of truth** - Store terrain as height field, both visual and physics read from it
3. **Continuous rebuild** - Rebuild physics every frame to match current ground points (expensive)
4. **Simpler terrain** - Keep terrain flat or very gentle, avoid the sync problem entirely

---

## Previous Session Changes (Jan 21, 2025 - Session 1)

### Parallax Background Fix
- Fixed parallax backgrounds ending when scrolling far right
- Added `updateParallaxBackgrounds()` function that dynamically creates new tiles as player moves
- Tiles are also cleaned up when they scroll far off-screen (memory management)
- Called every frame in `update()` loop

### Difficulty & Terrain Improvements
- Increased terrain hill amplitudes for more dramatic hills:
  - gentleHills: 250px, steepHills: 400px, blocky: 500px, chaotic: 600px
- Widened wavelengths for gradual slopes (not too steep to climb):
  - gentleHills: 4000px, steepHills: 3500px, blocky: 3000px, chaotic: 2500px
- Max offset clamp increased to 70% of screen height
- Reduced wobble during hilly terrain (30% vs 100% on flat) for smoother curves
- Fixed step size to 20px for consistent terrain drawing

### Camera
- Camera now follows player vertically (Y lerp: 0.1) in addition to horizontally
- Allows player to see up/down as terrain changes elevation

### Player Hitbox
- Changed player collision from rectangle to circle (radius 200)
- Positioned at feet for smoother terrain traversal
- Circle rolls over terrain segment edges instead of catching on corners

### Terrain Physics
- Terrain segments now fill entire visible area when switching from flat to hilly
- Flat ground body moved further down (height + 1000) when terrain is active
- Wider segments (80px) to reduce seams

### Debug Tools Updated
- `hitbox-penis.html` and `hitbox-vagina.html` now support dual hitbox tuning:
  - **Foot Hitbox** section (green): radius, offsetX, offsetY for terrain collision
  - **Body Hitbox** section (orange): width, height, offsetX, offsetY for enemy collision
  - Both hitboxes visualized simultaneously with color-coded outlines
  - Output shows exact code to paste into game.js

### Git Setup
- Created `.gitignore` excluding:
  - node_modules, .partykit, .claude, .DS_Store
  - human-materials-ignore/ (source PSDs)
  - Debug HTML files (hitbox-*.html, ground-test.html)
  - Symlinks to external projects
  - Empty folders

### Dual Hitbox System (IMPLEMENTED)
- **Problem solved:** Previously, a single hitbox couldn't work for both terrain (needs small circle at feet) and enemy collision (needs larger body coverage)
- **Solution:** Two separate physics objects per player:
  1. **Foot hitbox** - Circle on the player sprite, used for ground/platform collision
  2. **Body hitbox** - Invisible Phaser Zone with physics, used for hat/enemy collision
- Body hitbox follows player position every frame in `update()` loop
- Hat collision now uses `this.playerBodySensor` instead of `this.player`
- Each hitbox can be tuned independently via the debug HTML tools

## Known Issues / TODO
- **Alternate version abandoned** - Matter.js version in `/alternate/` was created to solve terrain sync but we simplified by keeping terrain flat instead

## Next Steps / Ideas
- Add sound effects (shoot, hit, death)
- ~~Mobile touch controls for movement~~ (DONE - mann.cool virtual controller)
- High score tracking
- Add more enemy types
- Power-ups
- Improve multiplayer interpolation/smoothing
- Add player names/labels
- Sync difficulty state in multiplayer mode
- Add keyboard/touch nav to multiplayer room scenes (CreateRoomScene, JoinRoomScene)
