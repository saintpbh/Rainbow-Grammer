import { speakText } from '../audio.js';

export function initGameUI(container, onExit) {
    container.innerHTML = `
        <button id="exit-game-btn">✕ Exit</button>
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

    document.getElementById('exit-game-btn').onclick = onExit;

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // Initial Resize
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));

    return { canvas, ctx };
}

export function resizeCanvas(canvas) {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

export function renderGame(ctx, canvas, state) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.activeDrops.forEach(drop => drop.draw(ctx));
    state.particles.forEach(p => p.draw(ctx));
}

export function updateHUD(state) {
    const scoreEl = document.getElementById('score-val');
    if (scoreEl) scoreEl.innerText = state.score;

    const lifeEl = document.getElementById('life-display');
    if (lifeEl) {
        const hearts = "❤️".repeat(Math.max(0, state.lives));
        lifeEl.innerText = hearts;
    }

    const comboEl = document.getElementById('combo-display');
    const comboVal = document.getElementById('combo-val');
    if (comboVal) comboVal.innerText = state.combo;
    if (comboEl) comboEl.style.opacity = state.combo > 1 ? 1 : 0;

    // Update wave display if needed inside loop, or separate function
    const waveEl = document.getElementById('wave-display');
    if (waveEl && state.levelData && state.levelData.waves) {
        const currentWaveConfig = state.levelData.waves[state.currentWave];
        if (currentWaveConfig) {
            waveEl.innerText = `${currentWaveConfig.name || 'WAVE ' + (state.currentWave + 1)}`;
        }
    }
}

export function updateButtons(containerId, activeDrops, pool, onInput) {
    const controlsContainer = document.getElementById(containerId);
    if (!controlsContainer) return;

    const neededAnswers = [...new Set(activeDrops.map(d => d.correctAnswer))];

    // Fill up to 4 options with randoms from pool
    let options = [...neededAnswers];

    // Attempt to add distractors to reach 4 buttons
    if (pool && pool.length > 0) {
        const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
        for (const item of shuffledPool) {
            if (options.length >= 4) break;
            if (!options.includes(item.text)) {
                options.push(item.text);
            }
        }
    }

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

        const itemData = pool.find(i => i.text === ans);
        if (itemData) {
            btn.style.setProperty('--btn-color', itemData.color);
        }

        btn.onclick = () => onInput(ans);
        controlsContainer.appendChild(btn);
    });
}

export function showBriefing(levelData, onStart) {
    const container = document.getElementById('drop-game-container');
    const pool = levelData.pool || [];
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
        startCountdown(onStart);
    };
}

function startCountdown(onComplete) {
    const overlay = document.getElementById('briefing-screen');
    overlay.innerHTML = `<div class="countdown-number" id="countdown">3</div>`;

    let count = 3;
    const interval = setInterval(() => {
        count--;
        const el = document.getElementById('countdown');
        if (count > 0) {
            el.innerText = count;
            el.style.animation = 'none';
            el.offsetHeight; /* trigger reflow */
            el.style.animation = 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        } else if (count === 0) {
            el.innerText = "GO!";
        } else {
            clearInterval(interval);
            overlay.remove();
            onComplete();
        }
    }, 1000);
}

export function showGameOver(isVictory, score, mistakes, onRestart, onExit) {
    const container = document.getElementById('game-ui');
    if (!container) return;

    const title = isVictory ? "LEVEL COMPLETE! 🌈" : "GAME OVER";
    const color = isVictory ? "#00E676" : "#FF5252";

    let mistakesHtml = '';
    if (mistakes.length > 0) {
        mistakesHtml = `
            <div style="margin-top: 20px; text-align: center;">
                <h3 style="color: #ECEFF1; font-size: 1.2rem; margin-bottom: 10px;">Review Needed:</h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-width: 400px;">
                    ${mistakes.slice(0, 5).map(word => `
                        <button class="review-word-btn" data-word="${word}">
                            ${word} 🔊
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 100;
    `;

    overlay.innerHTML = `
        <h1 style="font-size: 4rem; color: ${color}; margin-bottom: 10px;">${title}</h1>
        <div style="font-size: 2rem; margin-bottom: 20px; color: #37474F;">Final Score: <span style="font-weight:900">${score}</span></div>
        
        ${mistakesHtml}

        <div style="display: flex; gap: 20px; margin-top: 30px;">
            <button id="restart-btn" class="start-btn" style="padding: 15px 40px; font-size: 1.3rem;">
                ${isVictory ? 'Play Again' : 'Try Again'}
            </button>
            <button id="lobby-btn" style="padding: 15px 30px; font-size: 1.3rem; background: transparent; border: 2px solid #546E7A; color: #546E7A; border-radius: 50px; cursor: pointer; font-weight: 700;">
                Lobby
            </button>
        </div>
    `;

    container.appendChild(overlay);

    // Bind events
    document.getElementById('restart-btn').onclick = onRestart;
    document.getElementById('lobby-btn').onclick = onExit;

    // Bind speak buttons
    overlay.querySelectorAll('.review-word-btn').forEach(btn => {
        btn.onclick = () => speakText(btn.dataset.word);
        btn.style.cssText = "padding: 5px 15px; border-radius: 20px; border: 1px solid white; background: rgba(255,255,255,0.2); color: white; cursor: pointer; display: flex; align-items: center; gap: 5px;";
    });
}

export function triggerShake(containerId) {
    const wrapper = document.getElementById(containerId);
    if (wrapper) {
        wrapper.style.animation = 'none';
        wrapper.offsetHeight;
        wrapper.style.animation = 'shake 0.3s';

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
