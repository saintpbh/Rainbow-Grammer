import { GameState, resetState } from './state.js';
import { Drop, Particle } from './entities.js';

let canvas, ctx;
let lastTime = 0;
let animationId;
let activeButtons = []; // State of current buttons

// --- Initialization ---
export async function initGame() {
    console.log("Initializing Rainbow Drop Game...");

    // Create UI Structure
    const container = document.getElementById('drop-game-container');
    if (!container) return; // Should handle error

    // Load Data
    try {
        const response = await fetch('data/drop_game/level1.json');
        GameState.levelData = await response.json();
    } catch (e) {
        console.error("Failed to load level data:", e);
        GameState.levelData = { pool: [], waves: [] }; // Fallback
    }

    container.innerHTML = `
        <button id="exit-game-btn" onclick="exitDropGame()">✕ Exit</button>
        <canvas id="game-canvas"></canvas>
        <div id="game-ui">
            <div class="hud-top">
                <div class="score-group">
                    <span class="label-mini">Score</span>
                    <span class="score-val" id="score-val">0</span>
                </div>
                
                <div class="center-hud">
                    <div class="wave-badge" id="wave-display">WAVE 1</div>
                    <div class="hearts-container" id="life-display">❤️❤️❤️</div>
                </div>

                <div class="combo-container">
                    <div class="label-mini">Combo</div>
                    <div class="combo-big" id="combo-display" style="opacity:0">x<span id="combo-val">0</span></div>
                </div>
            </div>
            
            <!-- Dynamic Controls Container (2x2 Grid) -->
            <div id="player-controls"></div>
        </div>
    `;

    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    resetState();

    // Show Briefing instead of starting loop immediately
    showBriefing();
}

function showBriefing() {
    GameState.isBriefing = true;
    const container = document.getElementById('drop-game-container');

    // Safety check for data
    const pool = GameState.levelData.pool || [];
    const targets = pool.slice(0, 8); // Show first 8 items as preview

    const overlay = document.createElement('div');
    overlay.className = 'briefing-overlay';
    overlay.id = 'briefing-screen';

    overlay.innerHTML = `
        <div class="briefing-card">
            <div class="briefing-title">MISSION START! 🚀</div>
            <div class="briefing-subtitle">Catch these words!</div>
            
            <div class="target-list">
                ${targets.map(t => `
                    <div class="target-item" style="border-bottom: 3px solid ${t.color}">
                        ${t.text} ${t.emoji}
                    </div>
                `).join('')}
            </div>
            
            <button class="start-btn" id="start-mission-btn">READY?</button>
        </div>
    `;

    container.appendChild(overlay);

    document.getElementById('start-mission-btn').onclick = () => {
        startCountdown();
    };
}

function startCountdown() {
    const overlay = document.getElementById('briefing-screen');
    overlay.innerHTML = `<div class="countdown-number" id="countdown">3</div>`;

    let count = 3;
    const interval = setInterval(() => {
        count--;
        const el = document.getElementById('countdown');
        if (count > 0) {
            el.innerText = count;
            // Reset animation
            el.style.animation = 'none';
            el.offsetHeight; /* trigger reflow */
            el.style.animation = 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        } else if (count === 0) {
            el.innerText = "GO!";
        } else {
            clearInterval(interval);
            overlay.remove();
            startGame();
        }
    }, 1000);
}

function startGame() {
    GameState.isBriefing = false;
    lastTime = performance.now();
    animationId = requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- Game Loop ---
function gameLoop(timestamp) {
    if (GameState.isPaused) return;

    const dt = timestamp - lastTime;
    lastTime = timestamp;

    update(dt);
    draw();
    updateUI(); // Check if buttons need refresh

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
        // Display Wave Name
        const waveEl = document.getElementById('wave-display');
        if (waveEl) waveEl.innerText = `${currentWaveConfig.name || 'WAVE ' + (GameState.currentWave + 1)}`;

        // Next Wave Check
        if (GameState.waveTimer > currentWaveConfig.duration) {
            GameState.currentWave++;
            GameState.waveTimer = 0;

            // Check if Level Complete
            if (!GameState.levelData.waves[GameState.currentWave]) {
                triggerGameOver(true); // Victory
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
        triggerGameOver(false);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    GameState.activeDrops.forEach(drop => drop.draw(ctx));
    GameState.particles.forEach(p => p.draw(ctx));
}

// --- Gameplay Logic ---
function spawnDrop(waveConfig) {
    if (!GameState.levelData.pool || GameState.levelData.pool.length === 0) return;

    // Filter pool by Wave Types (if specified) or just pick random
    // For now, pick totally random from pool
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
    refreshButtons(); // Update buttons immediately on spawn
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

        triggerSFX('hit');
        speakText(text); // Read the word!
    } else {
        // Miss logic (Wrong click)
        // We record the clicked text as a "confusion" mistake? 
        // Or should we penalize based on what was ON SCREEN?
        // Let's just record the clicked text primarily if it WAS in the pool.
        handleMiss(text);
    }

    refreshButtons(); // Re-shuffle or remove used button
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

    triggerSFX('miss');

    // Screen shake
    const wrapper = document.getElementById('drop-game-container');
    if (wrapper) {
        wrapper.style.animation = 'none';
        wrapper.offsetHeight; /* trigger reflow */
        wrapper.style.animation = 'shake 0.3s';

        // Red flash overlay?
        const flash = document.createElement('div');
        flash.style.position = 'absolute';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = 'rgba(255,0,0,0.3)';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '5';
        wrapper.appendChild(flash);
        setTimeout(() => flash.remove(), 200);
    }
}

function triggerGameOver(isVictory) {
    GameState.isGameOver = true;

    const container = document.getElementById('game-ui');
    if (!container) return;

    const title = isVictory ? "LEVEL COMPLETE! 🌈" : "GAME OVER";
    const color = isVictory ? "#00E676" : "#FF5252";

    // Generate Mistakes List
    let mistakesHtml = '';
    if (GameState.mistakes.length > 0) {
        mistakesHtml = `
            <div style="margin-top: 20px; text-align: center;">
                <h3 style="color: #ECEFF1; font-size: 1.2rem; margin-bottom: 10px;">Review Needed:</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-width: 400px;">
                    ${GameState.mistakes.slice(0, 5).map(word => `
                        <button onclick="window.speakText('${word}')" 
                                style="padding: 5px 15px; border-radius: 20px; border: 1px solid white; background: rgba(255,255,255,0.2); color: white; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                            ${word} 🔊
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    // Style applied in CSS
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '100';

    overlay.innerHTML = `
        <h1 style="font-size: 4rem; color: ${color}; margin-bottom: 10px;">${title}</h1>
        <div style="font-size: 2rem; margin-bottom: 20px; color: #37474F;">Final Score: <span style="font-weight:900">${GameState.score}</span></div>
        
        ${mistakesHtml}

        <div style="display: flex; gap: 20px; margin-top: 30px;">
            <button onclick="restartDropGame()" class="start-btn" style="padding: 15px 40px; font-size: 1.3rem;">
                ${isVictory ? 'Play Again' : 'Try Again'}
            </button>
            <button onclick="exitDropGame()" style="padding: 15px 30px; font-size: 1.3rem; background: transparent; border: 2px solid #546E7A; color: #546E7A; border-radius: 50px; cursor: pointer; font-weight: 700;">
                Lobby
            </button>
        </div>
    `;

    container.appendChild(overlay);

    // Expose speak helper globally for the generated buttons
    // --- Global Navigation Helpers ---
    window.exitDropGame = function () {
        cancelAnimationFrame(animationId);
        GameState.isPaused = true;
        // Maybe clear canvas?
        if (window.initLobby) {
            window.initLobby();
        } else {
            location.reload(); // Fallback
        }
    };

    window.restartDropGame = function () {
        cancelAnimationFrame(animationId);
        initGame();
    };

    window.speakText = speakText;
}

// --- Dynamic UI ---
function refreshButtons() {
    const controlsContainer = document.getElementById('player-controls');
    if (!controlsContainer) return;

    const neededAnswers = [...new Set(GameState.activeDrops.map(d => d.correctAnswer))];

    // Fill up to 4 options with randoms from pool
    let options = [...neededAnswers];
    const pool = GameState.levelData.pool || [];

    // Attempt to add distractors to reach 4 buttons
    if (pool.length > 0) {
        const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
        for (const item of shuffledPool) {
            if (options.length >= 4) break;
            if (!options.includes(item.text)) {
                options.push(item.text);
            }
        }
    }

    // Sort logic to keep stable for comparison
    options.sort();

    const currentBtnTexts = Array.from(controlsContainer.children).map(b => b.dataset.answer).sort().join(',');
    const newBtnTexts = options.join(',');

    if (currentBtnTexts === newBtnTexts) return; // No change needed

    controlsContainer.innerHTML = '';

    // Shuffle for display
    const displayOptions = [...options].sort(() => Math.random() - 0.5);

    displayOptions.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.dataset.answer = ans;
        btn.innerText = ans;

        const itemData = GameState.levelData.pool.find(i => i.text === ans);
        if (itemData) {
            // Using CSS Variable for cleaner pseudo-element styling
            btn.style.setProperty('--btn-color', itemData.color);
        }

        btn.onclick = () => handleInput(ans);
        controlsContainer.appendChild(btn);
    });
}

function updateUI() {
    document.getElementById('score-val').innerText = GameState.score;

    // Update Lives
    const lifeEl = document.getElementById('life-display');
    if (lifeEl) {
        const hearts = "❤️".repeat(Math.max(0, GameState.lives));
        // console.log(`Lives: ${GameState.lives}, Hearts: ${hearts}`); // Debug
        lifeEl.innerText = hearts;
    }

    const comboEl = document.getElementById('combo-display');
    document.getElementById('combo-val').innerText = GameState.combo;
    comboEl.style.opacity = GameState.combo > 1 ? 1 : 0;
}

// --- Audio Logic ---
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Set Language
        utterance.rate = 1.0;     // Normal Speed
        utterance.pitch = 1.2;    // Slightly higher pitch for "Cute" vibe

        window.speechSynthesis.speak(utterance);
    }
}

function triggerSFX(type) {
    const audioMap = {
        'hit': 'sfx-pop',
        'miss': 'sfx-wrong'
    };

    const id = audioMap[type];
    if (id) {
        const el = document.getElementById(id);
        if (el) {
            el.currentTime = 0;
            // Lower volume for SFX so voice can be heard
            el.volume = 0.4;
            el.play().catch(e => console.log("Audio play failed", e));
        }
    }
}
