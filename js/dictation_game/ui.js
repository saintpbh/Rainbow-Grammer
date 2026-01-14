import { speakText, speak3x } from '../audio.js';
import { ROLE_MAP } from '../config.js';

export function renderGameUI(container, state, handlers) {
    container.innerHTML = `
        <div class="dict-header">
            <button class="dict-exit-btn" onclick="window.initLobby()">← Lobby</button>
            <div class="dict-level-badge">🌶️ Level ${state.currentLevel + 1}</div>
            <div class="dict-score" id="dict-score">Score: ${state.todayScore.toString().padStart(4, '0')}</div>
        </div>

        <div class="dict-main">
            <div class="speaker-area">
                <div class="pulse-speaker" id="speaker-btn" onclick="window.replayDictation()">
                    🎧
                </div>
                <div class="situation-hint" id="situation-hint">Situation: Prepare to listen...</div>
                <div id="sentence-guide" style="margin-top: 10px; font-weight: bold; color: #FFF; font-size: 0.9rem;"></div>
            </div>

            <div class="basket-area" id="basket-area">
                <!-- Baskets go here -->
            </div>

            <div class="dict-pool" id="dict-pool">
                <!-- Chunks go here -->
            </div>
        </div>
    `;

    renderBaskets(state);
    renderPool(state, handlers.onSelectPill);
    updateSituation(state);
}

function renderBaskets(state) {
    const area = document.getElementById('basket-area');
    if (!area) return;
    area.innerHTML = '';

    state.currentItem.chunks.forEach((chunk, idx) => {
        const isFilled = state.selectedIndices.includes(idx);
        const basket = document.createElement('div');
        basket.className = `dict-basket ${isFilled ? 'filled' : ''}`;

        if (isFilled) {
            basket.style.backgroundColor = chunk.color;
            basket.style.borderColor = 'transparent';
            basket.innerHTML = `<div class="dict-pill placed">${chunk.text}</div>`;
        } else {
            basket.innerHTML = `<div class="basket-label">${ROLE_MAP[chunk.role] || chunk.role}</div>`;
        }
        area.appendChild(basket);
    });
}

function renderPool(state, onSelect) {
    const pool = document.getElementById('dict-pool');
    if (!pool) return;
    pool.innerHTML = '';

    // Only show unselected chunks
    const available = state.currentItem.chunks
        .map((c, i) => ({ ...c, originalIndex: i }))
        .filter(c => !state.selectedIndices.includes(c.originalIndex));

    // Shuffle for dictation challenge
    available.sort(() => Math.random() - 0.5);

    available.forEach(chunk => {
        const pill = document.createElement('div');
        pill.className = 'dict-pill';
        pill.textContent = chunk.text;
        pill.onclick = () => onSelect(chunk.originalIndex);
        pool.appendChild(pill);
    });
}

function updateSituation(state) {
    const hint = document.getElementById('situation-hint');
    if (hint) {
        hint.textContent = state.currentItem.situation || state.currentItem.section || "Listen carefully!";
    }
}

export function showSuccess(sentence, onComplete) {
    const overlay = document.createElement('div');
    overlay.className = 'dict-success-overlay';
    overlay.innerHTML = `
        <div style="font-size: 5rem;">🌈</div>
        <div class="correct-text">${sentence}</div>
        <div style="margin-top: 20px; color: #4CAF50; font-weight: 800;">PERFECT!</div>
    `;
    document.body.appendChild(overlay);

    speak3x(sentence);

    setTimeout(() => {
        overlay.remove();
        onComplete();
    }, 4500);
}

export function updateScore(score) {
    const el = document.getElementById('dict-score');
    if (el) el.textContent = `Score: ${score.toString().padStart(4, '0')}`;
}
