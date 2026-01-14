# Rainbow Drop: Master Development Plan 🌈🚀

## 1. Vision & Philosophy
**"Arcade Reflex Learning"**
Combining the addictive flow of rhythm games/shooters with rapid-fire language acquisition. The goal is to move knowledge from "Slow Declarative Memory" (thinking about grammar) to "Fast Procedural Memory" (instinctive reaction).

*   **Vibe:** Cyber-Educational, Neon, High Energy.
*   **Target:** English Learners who want to build sentence structure intuition.

---

## 2. UX/UI Design System

### A. Visual Identity
*   **Color Palette:**
    *   **Background:** Deep Space Gradient (`#0f0c29` -> `#302b63`).
    *   **Subject (Red):** `#FF5252` (Neon Glow).
    *   **Verb (Orange/Yellow):** `#FFAB40` (Electric).
    *   **Object (Green/Blue):** `#69F0AE` / `#448AFF`.
    *   **UI:** Glassmorphism (Translucent white panels, blurred backgrounds).
*   **Typography:** 'Outfit' or 'Fredoka' (Rounded, friendly but modern).

### B. Core Screens
1.  **Lobby (The Hangar)**:
    *   Select Level (represented as "Planets" or "Discs").
    *   Show High Score & "mastery stars" (⭐⭐⭐) per level.
2.  **Briefing (Pre-Game)**:
    *   "Mission Target": Briefly show the target vocabulary/chunks for this session.
    *   "Ready... Set... Go!" Animation.
3.  **The Drop Zone (In-Game)**:
    *   **Top HUD:** Wave Progress Bar, Life Hearts, Score (Big & Bouncy).
    *   **Center:** The Canvas play area. Clean, uncluttered.
    *   **Bottom:** The "Control Deck". 4 Buttons. Large hit areas for mobile.
4.  **Debrief (Post-Game)**:
    *   **Victory:** "Level Cleared!", Score, Max Combo.
    *   **Mistake Review:** List the items missed with a "Play Audio" button.
    *   **XP Bar:** Animate progress towards next rank.

---

## 3. Detailed Features & Mechanics

### A. Gameplay Mechanics
*   **Dynamic Distractors:**
    *   The game ensures 4 options are always visible.
    *   Distractors are pulled from the *current* level's pool to stay relevant.
*   **Combo System:**
    *   Consecutive hits increase score multiplier (1x -> 1.5x -> 2x -> 4x FEVER).
    *   **Fever Mode:** When Combo > 10, background shifts colors, catchy loop speed up, chunks fall faster but worth double.
*   **HP System:**
    *   3 Hearts.
    *   Recover 1 Heart after clearing a Boss/Wave? (Optional).

### B. Educational Mechanics
*   **Audio Reinforcement (TTS)**:
    *   **On Spawn:** (Optional) Soft whisper of the word?
    *   **On Hit:** Clear pronunciation of the chunk.
    *   **On Miss:** "Correction" audio.
*   **Pattern Coding:**
    *   Buttons have subtle color borders corresponding to grammar roles (Subject vs Verb).
    *   Helps subconscious association.

---

## 4. Development Roadmap

### Phase 2.1: The "Premium" UI Update (Next Step)
*   **Task:** Overhaul `drop_game.css` and `game.js` rendering.
    *   Implement "Glassmorphism" for HUD.
    *   Add a "Wave Progress Bar" at the top.
    *   Improve Button aesthetics (Press animation, Glow).
*   **Task:** Add Audio (TTS) hook.

### Phase 2.2: Game Flow & Polish
*   **Task:** Implement "Briefing" Screen (Start Overlay).
*   **Task:** Implement "Flow/Fever" visual effects (Background shift).
*   **Task:** refined "Game Over" with **Mistake Review**.

### Phase 2.3: Content Expansion
*   **Task:** Create Level 2 (Verbs focusing on Tense), Level 3 (Objects).
*   **Task:** Add "Pause" functionality.

### Phase 3: Mobile & Pwa
*   **Task:** Touch event optimization (remove delay).
*   **Task:** Fullscreen request on mobile.

---

## 5. Technical Requirements
*   **Audio:** Use `speechSynthesis` API for dynamic TTS (zero asset cost) or pre-loaded MP3s for higher quality.
*   **Storage:** Save High Scores and Unlocked Levels in `localStorage`.
