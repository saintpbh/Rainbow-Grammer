# Rainbow Drop Game Design Document & Development Plan

## 1. Game Concept: "Rainbow Drop Defense" 🚀
**Genre**: Educational Arcade Shooter / Rhythm Game  
**Core Loop**: "Image-Chunk Association" + "Grammar Color Reinforcement"

### Mechanics
1.  **The Enemies (Falling Drops)**:
    *   Balloons or Drops fall from the top of the screen.
    *   Each Drop carries an **Emoji/Image** (e.g., 🍎, 🏃, 🏠).
    *   The Drop is colored according to its Grammatical Role (Subject=Red, Verb=Green, Object=Blue).
2.  **The Player (The Prism Cannon)**:
    *   Located at the bottom center.
    *   The Player has an "Ammo Belt" of **English Chunks** (text).
    *   *Example*: If a 🏃 (Green) falls, the player must select the "Run" or "Is Running" chunk to shoot a green laser.
3.  **The Goal**: 
    *   Clear waves of vocabulary without letting them hit the "Base".
    *   Build "Rainbow Energy" to unleash "Fever Mode" (Double Points, Fast Music).

### Educational Value
*   **Meaning Mapping**: Instant translation of Image -> English Chunk.
*   **Speed/Automaticity**: Gamification forces rapid processing, moving from "studying" to "acquiring".
*   **Color Reinforcement**: Subconsciously links "Action" (🏃) with "Green" (Verb).

---

## 2. Technical Architecture (Modular)
Everything resides in `js/chunk_game/` to keep it isolated from the Structure Game.

*   `game.js`: Main entry point, state manager.
*   `engine.js`: The Game Loop (Update, Draw, RequestAnimationFrame).
*   `entities.js`: Classes for `Drop` (Enemy), `Projectile` (Laser), `Player`.
*   `level_manager.js`: Handles wave progression and difficulty.
*   `assets.js`: Manages sounds and sprite generation.

---

## 3. Development Roadmap (Step-by-Step)

### Phase 1: The Engine & Prototype (Current Goal)
*   [ ] **Step 1**: Set up file structure and basic Game Loop (Canvas or DOM).
*   [ ] **Step 2**: Implement "Falling Drops" (Basic Physics).
*   [ ] **Step 3**: Implement "Player Input" (Clicking a button shoots a projectile).
*   [ ] **Step 4**: Basic Collision Detection (Laser hits Drop = Disappear).

### Phase 2: Data & Curriculum Integration
*   [ ] **Step 5**: Create `data/drop_game/level1.json` (Mapping Curated Emojis to Syllabus Chunks).
*   [ ] **Step 6**: Load real Level Data into the Spawner.

### Phase 3: "Juice" & Formatting (Fun Factor)
*   [ ] **Step 7**: Add Particle Effects (Explosions).
*   [ ] **Step 8**: Add Sound Effects (Pew Pew, Pop, Error).
*   [ ] **Step 9**: Implement Scoring & Combo System.
*   [ ] **Step 10**: "Fever Mode" visual overhaul.

### Phase 4: Polish & Launch
*   [ ] **Step 11**: Game Over / Victory Screens.
*   [ ] **Step 12**: Mobile Responsiveness Tweaks.
*   [ ] **Step 13**: Final Code Cleanup & Integration with Lobby.

---

## 4. UI/UX Style Goals
*   **Vibe**: Cyber-Educational. Dark background, Neon Grammar Colors.
*   **Feedback**: Huge, bouncy text for combos. Screen shake on hits.
