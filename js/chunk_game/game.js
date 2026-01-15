import { GameState, resetState } from './state.js';
import { Drop, Particle } from './entities.js';
import * as UI from './ui.js';
import { speakText, playSuccessSound, playFailureSound } from '../audio.js';

let canvas, ctx;
let lastTime = 0;
let animationId;

// --- Initialization ---
export async function initGame() {
    console.log("Initializing Rainbow Drop Game...");

    const container = document.getElementById('drop-game-container');
    if (!container) return;

    // Initialize UI
    const uiData = UI.initGameUI(container, exitDropGame);
    canvas = uiData.canvas;
    ctx = uiData.ctx;

    // Load Data
    try {
        const response = await fetch('data/drop_game/level1.json');
        GameState.levelData = await response.json();
    } catch (e) {
        console.error("Failed to load level data:", e);
        GameState.levelData = { pool: [], waves: [] }; // Fallback
    }

    resetState();

    // Show Briefing
    UI.showBriefing(GameState.levelData, startGame);
}

function startGame() {
    GameState.isBriefing = false;
    lastTime = performance.now();
    refreshButtonState(); // Initial button setup
    animationId = requestAnimationFrame(gameLoop);
}

// --- Game Loop ---
function gameLoop(timestamp) {
    if (GameState.isPaused) return;

    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);

    // Render Frame
    UI.renderGame(ctx, canvas, GameState);
    UI.updateHUD(GameState);

    if (!GameState.isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update(dt) {
    GameState.gameTime += dt;
    GameState.spawnTimer += dt;
    GameState.waveTimer += dt / 1000; // Seconds

    // Wave Logic
    const currentWaveConfig = GameState.levelData.waves ? GameState.levelData.waves[GameState.currentWave] : null;

    if (currentWaveConfig) {
        // Next Wave Check
        if (GameState.waveTimer > currentWaveConfig.duration) {
            GameState.currentWave++;
            GameState.waveTimer = 0;

            // Check if Level Complete
            if (!GameState.levelData.waves[GameState.currentWave]) {
                handleGameOver(true); // Victory
                return;
            }
        }

        // Spawn Logic
        if (GameState.spawnTimer > currentWaveConfig.spawnRate) {
            spawnDrop(currentWaveConfig);
            GameState.spawnTimer = 0;
        }
    }

    // Update Entities
    GameState.activeDrops.forEach(drop => drop.update(dt));
    GameState.particles.forEach(p => p.update(dt));

    // Cleanup & Miss Logic
    GameState.activeDrops = GameState.activeDrops.filter(d => {
        if (d.markedForDeletion) return false;
        if (d.y > canvas.height + 50) {
            // Missed!
            handleMiss(d.correctAnswer);
            return false;
        }
        return true;
    });

    // Cleanup Particles
    GameState.particles = GameState.particles.filter(p => !p.markedForDeletion);

    // Game Over Check
    if (GameState.lives <= 0) {
        handleGameOver(false);
    }
}

// --- Gameplay Logic ---
function spawnDrop(waveConfig) {
    if (!GameState.levelData.pool || GameState.levelData.pool.length === 0) return;

    // Filter pool by Wave Types (if specified) or just pick random
    const pool = GameState.levelData.pool;
    const item = pool[Math.floor(Math.random() * pool.length)];

    // Prevent spawning if screen is too full (simple cap)
    if (GameState.activeDrops.length >= 4) return;

    const x = Math.random() * (canvas.width - 100) + 50;

    const drop = new Drop(x, item.emoji, 'image');
    drop.correctAnswer = item.text;
    drop.color = item.color; // Use Data Color
    drop.vy = waveConfig.speed * (1 + Math.random() * 0.5); // Add variance

    GameState.activeDrops.push(drop);
    refreshButtonState();
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        GameState.particles.push(new Particle(x, y, color));
    }
}

function handleInput(text) {
    // Find matching drops
    const matches = GameState.activeDrops.filter(d => d.correctAnswer === text);

    if (matches.length > 0) {
        // Hit logic
        matches.sort((a, b) => b.y - a.y); // Target lowest
        const target = matches[0];
        target.markedForDeletion = true;

        createExplosion(target.x, target.y + 50, target.color);

        // FEVER LOGIC
        const isFever = GameState.combo >= 10;
        const multiplier = isFever ? 2 : 1;

        GameState.score += 10 * multiplier;
        GameState.combo++;

        // Fever Trigger Check
        if (GameState.combo === 10 && !GameState.isFever) {
            GameState.isFever = true;
            document.getElementById('drop-game-container').classList.add('fever-mode');
        }

        playSuccessSound();
        speakText(text); // Read the word!
    } else {
        handleMiss(text);
    }

    refreshButtonState();
}

function handleMiss(missedText) {
    GameState.combo = 0;
    GameState.lives--; // Penalty

    if (missedText && !GameState.mistakes.includes(missedText)) {
        GameState.mistakes.push(missedText);
    }

    // Reset Fever
    if (GameState.isFever) {
        GameState.isFever = false;
        document.getElementById('drop-game-container').classList.remove('fever-mode');
    }

    playFailureSound();
    UI.triggerShake('drop-game-container');
}

function handleGameOver(isVictory) {
    GameState.isGameOver = true;
    UI.showGameOver(isVictory, GameState.score, GameState.mistakes, restartDropGame, exitDropGame);
}

function refreshButtonState() {
    // Call UI to update buttons based on active drops
    UI.updateButtons('player-controls', GameState.activeDrops, GameState.levelData.pool, handleInput);
}

// --- Global Navigation Helpers ---
window.exitDropGame = exitDropGame;
window.restartDropGame = restartDropGame;

function exitDropGame() {
    cancelAnimationFrame(animationId);
    GameState.isPaused = true;
    if (window.initLobby) {
        window.initLobby();
    } else {
        location.reload(); // Fallback
    }
}

function restartDropGame() {
    cancelAnimationFrame(animationId);
    initGame();
}
