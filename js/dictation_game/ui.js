import { speakText, speak3x } from '../audio.js';
import { ROLE_MAP } from '../config.js';

let isAnimating = false;

// Initial full render
export function renderGameUI(container, state, handlers) {
    // Only rebuild the frame if it doesn't exist (preserve animation states)
    if (!container.querySelector('.dict-header')) {
        container.innerHTML = `
            <div class="dict-header">
                <button class="dict-exit-btn" onclick="window.exitDictationGame()">← Lobby</button>
                <div class="dict-progress-track">
                    <div class="dict-progress-fill" id="dict-progress-fill" style="width: 0%"></div>
                </div>
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
    
                <div class="basket-area" id="basket-area"></div>
                <div class="dict-pool" id="dict-pool"></div>
            </div>
        `;
    }

    // Always update these
    updateScore(state.todayScore);
    updateProgressBar(state.currentLevelGlobalIndex + 1, 10); // Approximation, updated properly in game.js
    updateSituation(state);

    // Render contents
    renderBaskets(state);
    renderPool(state, handlers.onSelectPill);
}

function renderBaskets(state) {
    const area = document.getElementById('basket-area');
    if (!area) return;

    // We want to preserve DOM elements if possible to avoid flickering, 
    // but for simplicity in this version, we will re-render intelligently.
    // However, since we are doing animations, let's clear and rebuild for now OR match by index.
    // For safer state sync, we clear. Animation happens BEFORE state update in game.js.
    area.innerHTML = '';

    state.currentItem.chunks.forEach((chunk, idx) => {
        const isFilled = state.selectedIndices.includes(idx);
        const basket = document.createElement('div');
        basket.className = `dict-basket ${isFilled ? 'filled' : ''}`;
        basket.dataset.index = idx; // Important for targeting

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
    // We need to keep stable IDs or dataset for animation source?
    // Actually, we just render what's available.

    const available = state.currentItem.chunks
        .map((c, i) => ({ ...c, originalIndex: i }))
        .filter(c => !state.selectedIndices.includes(c.originalIndex));

    // Shuffle is good, but maybe we should shuffle ONCE per question?
    // For now, simple shuffle every render is okay BUT it messes up "flying from specific spot".
    // NOTE: To make flying work nicely, we should find the clicked element in the DOM before re-rendering.
    // This is handled in `flyPillToBasket`. Here we just render the remaining ones.

    // We utilize a deterministic sort or just random. Random is existing behavior.
    // To prevent "jumping" pills, maybe we shouldn't shuffle on every single pill selection?
    // Let's rely on the calling code (game.js) to manage the list order if needed, 
    // but the previous code shuffled inside render. We'll keep it for now.
    available.sort((a, b) => a.text.localeCompare(b.text)); // Alphabetical for stability during interaction? Or random?
    // Let's stick to random but maybe seed it? 
    // Actually, simple random is fine. The user clicks, it flies, THEN we re-render.
    // So the Flying pill is "gone" from the new render, which is correct.
    available.sort(() => Math.random() - 0.5);

    available.forEach(chunk => {
        const pill = document.createElement('div');
        pill.className = 'dict-pill';
        pill.textContent = chunk.text;
        pill.dataset.originalIndex = chunk.originalIndex; // Important for targeting
        pill.onclick = (e) => {
            if (isAnimating) return;
            onSelect(chunk.originalIndex, e.target); // Pass the element!
        };
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

export function updateProgressBar(current, total) {
    const fill = document.getElementById('dict-progress-fill');
    if (fill && total > 0) {
        const percent = Math.min(100, Math.round((current / total) * 100));
        fill.style.width = `${percent}%`;
    }
}

// Animation function
export function flyPillToBasket(pillElement, basketIndex, onComplete) {
    // Find the target basket
    const baskets = document.querySelectorAll('.dict-basket');
    const targetBasket = baskets[basketIndex];

    if (!pillElement || !targetBasket) {
        if (onComplete) onComplete();
        return;
    }

    isAnimating = true;

    // Create a clone for animation
    const rect = pillElement.getBoundingClientRect();
    const clone = pillElement.cloneNode(true);

    clone.style.position = 'fixed';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.zIndex = '9999';
    clone.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    clone.style.pointerEvents = 'none';

    document.body.appendChild(clone);

    // Hide original to prevent double vision (but keep layout)
    pillElement.style.visibility = 'hidden';

    // Calculate target position
    const targetRect = targetBasket.getBoundingClientRect();
    // Center it in the basket
    const targetX = targetRect.left + (targetRect.width - rect.width) / 2;
    const targetY = targetRect.top + (targetRect.height - rect.height) / 2;

    // Force reflow
    clone.getBoundingClientRect();

    // Animate
    requestAnimationFrame(() => {
        clone.style.left = `${targetX}px`;
        clone.style.top = `${targetY}px`;
        // Match basket background color if possible? 
        // For now just fly.
    });

    // Cleanup after animation
    setTimeout(() => {
        clone.remove();
        isAnimating = false;
        if (onComplete) onComplete();
    }, 500);
}
