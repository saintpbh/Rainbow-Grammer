import { ROLE_MAP, PRINCIPLES } from '../config.js';
import { isLightColor } from '../utils.js';
import { startGame } from './game.js';

export function updateScoreHUD(today, total) {
    const todayEl = document.getElementById('score-today');
    const totalEl = document.getElementById('score-total');
    if (todayEl) todayEl.textContent = today.toString().padStart(4, '0');
    if (totalEl) totalEl.textContent = total.toString().padStart(4, '0');
}

export function updatePhase(text) {
    // Phase display removed as per user request
}

export function showFloatingScore(points) {
    const container = document.getElementById('float-score-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'score-anim';
    el.textContent = `+${points}`;
    el.style.animation = 'floatingScore 0.8s forwards';
    container.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

export function updateProgressHUD(levelIndex, currentItemCount) {
    const currentDay = Math.floor(levelIndex / 10) + 1;
    const currentWeek = Math.ceil(currentDay / 7);
    const sentenceInDay = (levelIndex % 10) + 1;
    const progressPercent = (sentenceInDay / 10) * 100;

    const dayEl = document.getElementById('day-number');
    const weekEl = document.getElementById('week-badge');
    const sentEl = document.getElementById('sentence-counter');
    const fillEl = document.getElementById('progress-fill');
    const lvlBtn = document.getElementById('level-btn');

    if (dayEl) dayEl.textContent = `Day ${currentDay} of 28`;
    if (weekEl) weekEl.textContent = `Week ${currentWeek}`;
    if (sentEl) sentEl.textContent = `Sentence ${sentenceInDay} of 10`;
    if (fillEl) fillEl.style.width = `${progressPercent}%`;

    // Ensure Level Badge reflects Practice Day or Regular Level correctly
    if (lvlBtn && !lvlBtn.textContent.includes('Practice')) {
        lvlBtn.textContent = `LEVEL ${currentDay}`;
    }
}

export function createPill(chunk, idx, isSelected, onClick) {
    const pill = document.createElement('div');
    pill.className = `word-pill ${isSelected ? 'selected' : 'pool-item'}`;

    if (isSelected) {
        pill.style.backgroundColor = chunk.color;
        if (isLightColor(chunk.color)) pill.classList.add('dark-text');
    }

    pill.dataset.idx = idx;
    pill.onclick = () => onClick(idx, pill);

    const textDiv = document.createElement('div');
    textDiv.className = 'pill-text';
    textDiv.textContent = chunk.text;

    const tagDiv = document.createElement('div');
    tagDiv.className = 'pill-tag';
    tagDiv.textContent = ROLE_MAP[chunk.role] || chunk.role;
    tagDiv.style.backgroundColor = "rgba(0,0,0,0.1)";

    pill.appendChild(textDiv);
    pill.appendChild(tagDiv);
    return pill;
}

export function renderPool(chunks, usedIndices, onInput) {
    const pool = document.getElementById('pool-area');
    if (!pool) return;
    pool.innerHTML = '';

    const indices = chunks.map((_, i) => i);
    // Shuffle logic
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    indices.forEach(idx => {
        if (usedIndices.includes(idx)) return; // Skip used

        const chunk = chunks[idx];
        const pill = createPill(chunk, idx, false, onInput);
        pool.appendChild(pill);
    });
}

export function renderAnswerSlot(chunks, selectedIndices, onUndo) {
    const slot = document.getElementById('answer-slot');
    if (!slot) return;
    slot.innerHTML = '';
    slot.classList.remove('shake');

    if (selectedIndices.length === 0) {
        slot.innerHTML = '<div style="color: #CFD8DC; font-weight: 500; font-size: 0.9rem;">( Tap words to build )</div>';
        return;
    }

    selectedIndices.forEach(idx => {
        const chunk = chunks[idx];
        const pill = createPill(chunk, idx, true, onUndo);
        slot.appendChild(pill);
    });
}

export function showContext(context, onHide) {
    const bubble = document.getElementById('context-bubble');
    if (context && bubble) {
        document.getElementById('context-text').textContent = context;
        bubble.classList.add('active');
        setTimeout(() => {
            bubble.classList.remove('active');
            if (onHide) onHide();
        }, 6000);
    } else if (bubble) {
        bubble.classList.remove('active');
    }
}

export function hideContext() {
    const bubble = document.getElementById('context-bubble');
    if (bubble) bubble.classList.remove('active');
}

export function showGrammarTip(tip) {
    if (!tip) return;

    document.getElementById('grammar-title').textContent = tip.title || 'Grammar Pattern';
    document.getElementById('grammar-explanation').textContent = tip.explanation || '';

    const examplesList = document.getElementById('grammar-examples-list');
    examplesList.innerHTML = '';
    if (tip.examples) {
        tip.examples.forEach(ex => {
            const li = document.createElement('li');
            li.textContent = ex;
            examplesList.appendChild(li);
        });
    }

    document.getElementById('grammar-modal').classList.add('active');
}

export function closeGrammarModal() {
    document.getElementById('grammar-modal').classList.remove('active');
}

export function showErrorFeedback(feedback) {
    document.getElementById('feedback-message').textContent = feedback.message;
    document.getElementById('feedback-hint').textContent = feedback.hint;
    const el = document.getElementById('error-feedback');
    if (el) {
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 8000);
    }
}

export function hideErrorFeedback() {
    const el = document.getElementById('error-feedback');
    if (el) el.classList.remove('active');
}

const TITLE_MAP = {
    "Core Lesson": "오늘의 핵심 강의",
    "Review Time": "복습 시간",
    "News Headlines": "뉴스 헤드라인",
    "Famous Speeches": "유명 연설",
    "Literature & Wisdom": "문학의 지혜",
    "Mastery": "마스터리"
};

export function showDayTransition(completedSection, nextSection, guideData, onProceed) {
    const modal = document.createElement('div');
    modal.className = 'level-transition-modal';

    // Map English titles to Korean if possible
    const title = TITLE_MAP[guideData.title] || guideData.title;

    modal.innerHTML = `
        <div class="transition-content" style="background: white; padding: 2.5rem; border-radius: 24px; text-align: center; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.3); animation: popIn 0.3s ease-out;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🏁</div>
            <h2 style="color: #455A64; margin: 0; font-size: 1.2rem;">${completedSection} 완료!</h2>
            <div style="margin: 2rem 0; height: 1px; background: #ECEFF1;"></div>
            
            <h3 style="color: var(--primary); font-size: 1.8rem; margin-bottom: 0.5rem; font-weight: 800;">${nextSection}</h3>
            <p style="color: #78909C; margin-bottom: 2rem;">${title}</p>
            
            <!-- Color Coded Grammar Guide -->
            <div style="background: #F5F7FA; padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; align-items: center;">
                ${(guideData.structure || []).map((item, i) => `
                    ${i > 0 ? '<span style="color: #B0BEC5; font-weight: bold;">+</span>' : ''}
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <span style="background: ${item.color}; color: white; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${item.text}</span>
                        ${item.desc ? `<span style="margin-top: 4px; font-size: 0.75rem; color: #546E7A; font-weight: 600;">${item.desc}</span>` : ''}
                    </div>
                `).join('')}
            </div>

            <button onclick="document.querySelector('.level-transition-modal').remove(); proceedToNextLevel()" 
                style="background: linear-gradient(135deg, #6200EA 0%, #7C4DFF 100%); color: white; border: none; padding: 16px 40px; border-radius: 50px; font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 6px 20px rgba(98, 0, 234, 0.4); transition: transform 0.2s;">
                ${nextSection} 시작하기 🚀
            </button>
        </div>
    `;

    // Simple fade in style
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center;
        z-index: 5000; opacity: 0; transition: opacity 0.4s;
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.style.opacity = '1');
}

export function showLevelUpCelebration(prev, next, onC) { }


export function showTransitionModal(nextSectionText) {
    const modal = document.getElementById('transition-modal');
    if (modal) {
        document.getElementById('next-level-title').textContent = nextSectionText || 'Next Level';
        modal.classList.add('active');
    }
}

export function closeTransitionModal() {
    const modal = document.getElementById('transition-modal');
    if (modal) modal.classList.remove('active');
}

export function showWelcomeModal(hasStarted, data) {
    const modal = document.getElementById('welcome-modal');
    if (!modal) return;

    let html = '';
    if (hasStarted) {
        html = `
            <div class="welcome-content">
                <h1>Welcome Back! 👋</h1>
                <p>Detailed status report for your session:</p>
                <div class="principles-grid" style="grid-template-columns:1fr 1fr; max-width:400px; margin: 0 auto 2rem;">
                    <div class="p-card" style="text-align:center;">
                        <span>Total Score</span>
                        <strong style="font-size:1.4rem; color:#FFEA00;">${data.totalScore}</strong>
                    </div>
                     <div class="p-card" style="text-align:center;">
                        <span>Today's Score</span>
                        <strong style="font-size:1.4rem; color:#00E676;">${data.todayScore}</strong>
                    </div>
                </div>
                 <div style="margin-bottom: 20px; font-weight:bold; color: #555;">Current Level: ${data.levelIndex + 1}</div>
                <button class="start-btn" onclick="startGame()">Resume Journey ▶</button>
                <button class="start-btn" style="background:#546E7A; margin-top:10px" onclick="location.reload()">← Back to Lobby</button>
            </div>
        `;
    } else {
        html = `
            <div class="welcome-content">
                <h1>Rainbow Grammar 🌈</h1>
                <p>Master English grammar through <strong>Colors</strong>, <strong>Patterns</strong>, and <strong>Active Recall</strong>.</p>
                
                <div class="color-legend">
                    <div class="legend-dot"><span class="dot" style="background:#FF1744"></span> Subject</div>
                    <div class="legend-dot"><span class="dot" style="background:#FF9100"></span> Verb</div>
                    <div class="legend-dot"><span class="dot" style="background:#00E676"></span> Object</div>
                </div>

                <div class="principles-grid">
                    <div class="p-card">
                        <strong>Active Recall</strong>
                        <span>Build sentences yourself.</span>
                    </div>
                    <div class="p-card">
                        <strong>Sensory Loop</strong>
                        <span>Listen 3x to reinforce.</span>
                    </div>
                </div>
                
                <button class="start-btn" onclick="startGame()">Start Learning 🚀</button>
                <button class="start-btn" style="background:#546E7A; margin-top:10px" onclick="location.reload()">← Back to Lobby</button>
            </div>
        `;
    }
    modal.innerHTML = html;
    modal.classList.remove('hidden');
}

export function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.add('hidden');
}

export function showExitModal(data) {
    const modal = document.getElementById('exit-modal');
    document.getElementById('exit-progress').innerHTML = `
        Day ${data.day} of 28 (Week ${data.week})<br>
        Sentence ${data.sentence} of 10<br>
        <span style="color: #00BFA5;">Total Score: ${data.totalScore}</span>
    `;
    modal.classList.add('active');
}

export function closeExitModal() {
    const modal = document.getElementById('exit-modal');
    if (modal) modal.classList.remove('active');
}

export function showSaveConfirmation(data) {
    const container = document.getElementById('game-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <h1 style="font-size: 3rem; margin-bottom: 1rem;">🎉</h1>
            <h2 style="color: var(--primary); margin-bottom: 1rem;">학습이 저장되었습니다!</h2>
            <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">
                다음에 접속하시면<br>
                <strong style="color: var(--accent);">Day ${data.day}, Sentence ${data.sentence}</strong>부터<br>
                이어서 학습하실 수 있습니다.
            </p>
            <button onclick="location.reload()" style="
                background: var(--primary);
                color: white;
                border: none;
                padding: 16px 32px;
                border-radius: 30px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
            ">다시 시작하기</button>
        </div>
    `;
}

export function openPracticeModal(currentDay, onSelect) {
    const selector = document.getElementById('day-selector');
    if (!selector) return;
    selector.innerHTML = '';

    for (let day = 1; day <= 28; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-option';

        if (day <= currentDay) {
            dayDiv.classList.add('completed');
            dayDiv.innerHTML = `
                <div class="day-number">Day ${day}</div>
                <div class="day-status">${day === currentDay ? 'Current' : '✓ Review'}</div>
            `;
            dayDiv.onclick = () => onSelect(day);
        } else {
            dayDiv.classList.add('locked');
            dayDiv.innerHTML = `
                <div class="day-number">Day ${day}</div>
                <div class="day-status">🔒 Locked</div>
            `;
        }
        selector.appendChild(dayDiv);
    }
    document.getElementById('practice-modal').classList.add('active');
}

export function closePracticeModal() {
    const modal = document.getElementById('practice-modal');
    if (modal) modal.classList.remove('active');
}

export function showPracticeExitButton(day, onExit) {
    const btn = document.createElement('button');
    btn.id = 'exit-practice-btn';
    btn.textContent = '← Return to Main';
    btn.style.cssText = `
        position: fixed; top: 80px; right: 20px;
        background: #424242; color: white;
        border: none; padding: 10px 20px;
        border-radius: 20px; cursor: pointer;
        z-index: 1000; font-weight: 700;
    `;
    btn.onclick = onExit;
    document.body.appendChild(btn);

    // Update Level Badge Style
    const lvlBtn = document.getElementById('level-btn');
    if (lvlBtn) {
        lvlBtn.textContent = `📚 Practice: Day ${day}`;
        lvlBtn.style.background = 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)';
    }
}

export function removePracticeExitButton() {
    const btn = document.getElementById('exit-practice-btn');
    if (btn) btn.remove();

    const lvlBtn = document.getElementById('level-btn');
    if (lvlBtn) {
        lvlBtn.style.background = '';
    }
}
