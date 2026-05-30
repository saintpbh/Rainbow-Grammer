import { ROLE_MAP, PRINCIPLES } from '../config.js';
import { isLightColor } from '../utils.js';
import { startGame } from './game.js';
import { gameState } from '../state.js';

export function updateScoreHUD(today, total) {
    const todayEl = document.getElementById('score-today');
    const totalEl = document.getElementById('score-total');
    if (todayEl) todayEl.textContent = today.toString().padStart(4, '0');
    if (totalEl) totalEl.textContent = total.toString().padStart(4, '0');
}

export function updatePhase(text) {
    // Phase display removed as per user request
}

export function updateQuestionDisplay(koreanText, promptText) {
    const qEl = document.getElementById('question-text');
    if (qEl) qEl.textContent = koreanText || "";

    const qDisplay = document.getElementById('question-display');
    if (qDisplay) qDisplay.textContent = promptText || "";
}

export function updateLevelBadge(text, isPractice) {
    const badgeEl = document.getElementById('level-btn');
    if (badgeEl && !isPractice) { // Only update if not practice mode override
        badgeEl.textContent = text;
        badgeEl.style.background = '';
    }
}

const SPICY_THEME_COLORS = [
    { start: "#E0F7FA", end: "#E8E4F6", glow: "rgba(98, 0, 234, 0.2)", primary: "#6200EA" }, // Level 0
    { start: "#FFF3E0", end: "#FFE0B2", glow: "rgba(255, 145, 0, 0.25)", primary: "#FF9100" }, // Level 1
    { start: "#FFE0B2", end: "#FFCC80", glow: "rgba(255, 109, 0, 0.3)", primary: "#FF6D00" }, // Level 2
    { start: "#FFEBEE", end: "#FFCDD2", glow: "rgba(255, 23, 68, 0.35)", primary: "#FF1744" }, // Level 3
    { start: "#FFCDD2", end: "#EF9A9A", glow: "rgba(213, 0, 0, 0.4)", primary: "#D50000" }, // Level 4
    { start: "#EF9A9A", end: "#E57373", glow: "rgba(183, 28, 28, 0.45)", primary: "#B71C1C" }, // Level 5
    { start: "#263238", end: "#1A237E", glow: "rgba(229, 57, 53, 0.5)", primary: "#E53935" }  // Level 6
];

export function updateChiliCount(count) {
    const el = document.getElementById('chili-count');
    if (el) el.textContent = `x ${count}`;

    // Apply Dynamic Spicy Theme
    const themeIdx = Math.min(Math.max(0, count), SPICY_THEME_COLORS.length - 1);
    const theme = SPICY_THEME_COLORS[themeIdx];
    
    document.documentElement.style.setProperty('--bg-gradient-start', theme.start);
    document.documentElement.style.setProperty('--bg-gradient-end', theme.end);
    document.documentElement.style.setProperty('--theme-glow', theme.glow);
    document.documentElement.style.setProperty('--primary', theme.primary);
    
    console.log(`🔥 Dynamic theme transition applied for Spicy Level ${count}`);
}

export function indicateSuccess() {
    const slot = document.getElementById('answer-slot');
    if (slot) {
        slot.classList.add('correct');
        
        // Upgrade: Glow-Through Flow visual matching for Object & Complement
        const objPill = slot.querySelector('.word-pill.role-object');
        const compPill = slot.querySelector('.word-pill.role-complement');
        
        if (objPill && compPill) {
            objPill.classList.add('glow-object');
            compPill.classList.add('glow-complement');
            slot.classList.add('glow-flow-active');
        }
    }
}

export function indicateFailure() {
    const slot = document.getElementById('answer-slot');
    if (slot) slot.classList.add('shake');
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
    
    // Add role class
    const roleClass = chunk.role ? chunk.role.toLowerCase() : '';
    if (roleClass) pill.classList.add(`role-${roleClass}`);

    // Highlight core 5-form native verbs inside the pool
    if (chunk.role === 'Verb' && !isSelected) {
        const text = chunk.text.toLowerCase();
        if (['keep', 'leave', 'have', 'want', 'kept', 'left', 'had', 'wanted', 'make', 'made', 'find', 'found'].includes(text)) {
            pill.classList.add('core-native-verb');
        }
    }

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
    
    // Map English roles to Korean
    let tagText = ROLE_MAP[chunk.role] || chunk.role;
    
    // Upgrade: Semantic Sub-Tags for Complement cards
    if (chunk.role === 'Complement') {
        const text = chunk.text.toLowerCase();
        if (text.includes('to ')) {
            tagText += ' [미래]';
        } else if (text.endsWith('ing') || text.endsWith('ed')) {
            tagText += ' [동작]';
        } else {
            tagText += ' [상태]';
        }
    }
    
    tagDiv.textContent = tagText;
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
    slot.classList.remove('correct');
    slot.classList.remove('glow-flow-active');

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
        const ctxEl = document.getElementById('context-text');
        if (ctxEl) ctxEl.textContent = context;
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
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                     <button class="start-btn" style="background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); width: auto; padding: 12px 20px; font-size: 0.9rem;" onclick="openPracticeMode()">📚 Practice Mode</button>
                     <button class="start-btn" style="background:#546E7A; width: auto; padding: 12px 20px; font-size: 0.9rem;" onclick="location.reload()">← Lobby</button>
                </div>
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
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                     <button class="start-btn" style="background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); width: auto; padding: 12px 20px; font-size: 0.9rem;" onclick="openPracticeMode()">📚 Practice Mode</button>
                     <button class="start-btn" style="background:#546E7A; width: auto; padding: 12px 20px; font-size: 0.9rem;" onclick="location.reload()">← Lobby</button>
                </div>
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
        position: fixed; top: 20px; right: 20px;
        background: #424242; color: white;
        border: none; padding: 10px 20px;
        border-radius: 20px; cursor: pointer;
        z-index: 1000; font-weight: 700;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    `;
    btn.onclick = onExit;
    document.body.appendChild(btn);

    const saveExitBtn = document.querySelector('.save-exit-btn');
    if (saveExitBtn) saveExitBtn.style.display = 'none';

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

    const saveExitBtn = document.querySelector('.save-exit-btn');
    if (saveExitBtn) saveExitBtn.style.display = '';

    const lvlBtn = document.getElementById('level-btn');
    if (lvlBtn) {
        lvlBtn.style.background = '';
    }
}

// --- Next-Gen SLA Dialogue Engine ---
const DIALOGUE_TEMPLATES = [
    {
        trigger: (eng) => eng.includes("rises") || eng.includes("sets") || eng.includes("shine") || eng.includes("night") || eng.includes("star") || eng.includes("sky"),
        dialogue: (eng, kor) => ({
            speakerA: "Look at the beautiful sky!",
            speakerB: `Indeed. ${eng} It's absolute peace.`,
            korA: "아름다운 하늘을 좀 봐!",
            korB: `정말 그래. ${kor} 완벽한 평화야.`
        })
    },
    {
        trigger: (eng) => eng.includes("teacher") || eng.includes("doctor") || eng.includes("chef") || eng.includes("student") || eng.includes("friend") || eng.includes("profession"),
        dialogue: (eng, kor) => ({
            speakerA: "What do you know about that person?",
            speakerB: `Well, ${eng.replace(".", "")} in our town.`,
            korA: "그 사람에 대해 아는 게 있니?",
            korB: `음, 내가 알기로는 우리 마을에서 ${kor}`
        })
    },
    {
        trigger: (eng) => eng.includes("cry") || eng.includes("laugh") || eng.includes("happy") || eng.includes("sad") || eng.includes("smile"),
        dialogue: (eng, kor) => ({
            speakerA: "Why are they showing such emotions?",
            speakerB: `Ah, ${eng} That explains it.`,
            korA: "그들은 왜 저런 감정을 보이는 걸까?",
            korB: `아, ${kor} 그걸 보니 이해가 되네.`
        })
    },
    {
        trigger: (eng) => eng.includes("because") || eng.includes("since") || eng.includes("why"),
        dialogue: (eng, kor) => ({
            speakerA: "What is the reason behind this?",
            speakerB: `Honestly, it is because ${eng.replace("because", "")}`,
            korA: "이것의 배후에 있는 이유는 무엇인가요?",
            korB: `솔직히 말해서, ${kor} 때문이야.`
        })
    },
    {
        trigger: (eng) => eng.includes("where") || eng.includes("park") || eng.includes("school") || eng.includes("home") || eng.includes("beach") || eng.includes("in the"),
        dialogue: (eng, kor) => ({
            speakerA: "Where did this beautiful story happen?",
            speakerB: `Actually, ${eng}`,
            korA: "이 아름다운 이야기가 어디서 일어났나요?",
            korB: `사실, ${kor}`
        })
    }
];

export function showMiniDialogueBubble(english, korean) {
    const bubble = document.getElementById('context-bubble');
    if (!bubble) return;
    
    // Find matching template or fallback
    const matched = DIALOGUE_TEMPLATES.find(t => t.trigger(english.lower ? english.lower() : english.toLowerCase()));
    let diag;
    if (matched) {
        diag = matched.dialogue(english, korean);
    } else {
        // Intelligent generic fallback
        diag = {
            speakerA: `Tell me, what is going on here?`,
            speakerB: `Look: ${english}`,
            korA: `나에게 말해줘, 여기서 무슨 일이 일어나고 있니?`,
            korB: `봐봐: ${korean}`
        };
    }
    
    // Check if current sentence is a 5-form sentence
    let is5Form = false;
    let nuanceHtml = '';
    
    if (gameState && gameState.currentItem && gameState.currentItem.chunks) {
        const roles = gameState.currentItem.chunks.map(c => c.role);
        is5Form = roles.includes('Object') && roles.includes('Complement');
        
        if (is5Form) {
            const lowerEng = english.toLowerCase();
            let verbTip = "주어 + 동사 + 목적어 + 목적격 보어 구조는 접속사 없이 대상의 상태나 결과를 콤팩트하게 전달하는 원어민 치트키 표현입니다!";
            
            if (lowerEng.includes('keep') || lowerEng.includes('kept')) {
                verbTip = "keep + 목적어 + 보어는 목적어가 계속 특정 상태를 유지하도록 제어하는 원어민의 매우 빈번한 화법입니다.";
            } else if (lowerEng.includes('leave') || lowerEng.includes('left')) {
                verbTip = "leave + 목적어 + 보어는 목적어를 특정한 상태로 내버려두거나 방치하는 원어민식 뉘앙스를 대변합니다.";
            } else if (lowerEng.includes('want') || lowerEng.includes('wanted')) {
                verbTip = "want + 목적어 + 보어는 소유를 넘어 목적어가 그 특정 상태이기를 바라는 결합적인 원어민적 표현입니다.";
            } else if (lowerEng.includes('have') || lowerEng.includes('had')) {
                verbTip = "have + 목적어 + 보어는 목적어의 상태를 나타내거나 그런 일이 벌어지게 조치했음을 세련되게 전달합니다.";
            } else if (lowerEng.includes('make') || lowerEng.includes('made')) {
                verbTip = "make + 목적어 + 보어는 목적어를 강제로 혹은 확실히 그 상태로 변화시키는 강한 원인-결과 표현입니다.";
            }
            
            nuanceHtml = `
                <div style="border-top: 2px dashed rgba(255, 213, 79, 0.4); padding-top: 8px; margin-top: 8px; text-align: left;">
                    <div style="color: #FFD54F; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; margin-bottom: 2px;">💡 NATIVE NUANCE (원어민 5형식 팁)</div>
                    <div style="font-size: 0.75rem; line-height: 1.3; color: #FFFDE7; font-weight: 600;">${verbTip}</div>
                </div>
            `;
            bubble.classList.add('gold-edition');
        } else {
            bubble.classList.remove('gold-edition');
        }
    }
    
    // Inject dynamic HTML with a stunning glassmorphism style
    bubble.innerHTML = `
        <div class="context-icon" style="font-size: 1.4rem; padding: 4px; border-radius: 50%; background: ${is5Form ? 'rgba(255,213,79,0.2)' : 'rgba(0,229,255,0.2)'};">${is5Form ? '⭐' : '💬'}</div>
        <div class="context-content" style="text-align: left; width: 100%; display: flex; flex-direction: column; gap: 4px;">
            <div class="context-title" style="color: ${is5Form ? '#FFD54F' : '#00E676'}; font-size: 0.75rem; letter-spacing: 1px; font-weight: 800; margin-bottom: 2px;">
                ${is5Form ? 'GOLDEN 5-FORM DIALOGUE' : 'PRACTICAL DIALOGUE (실생활 회화)'}
            </div>
            <div style="font-size: 0.8rem; line-height: 1.3; color: #ECEFF1;">
                <strong style="color: #FFEA00; font-weight: 800;">A:</strong> ${diag.speakerA} <br><span style="font-size: 0.7rem; color: #CFD8DC; font-style: italic;">(${diag.korA})</span>
            </div>
            <div style="font-size: 0.8rem; line-height: 1.3; color: #ECEFF1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; margin-top: 2px;">
                <strong style="color: #00E5FF; font-weight: 800;">B:</strong> ${diag.speakerB} <br><span style="font-size: 0.7rem; color: #CFD8DC; font-style: italic;">(${diag.korB})</span>
            </div>
            ${nuanceHtml}
        </div>
        <div class="context-close" onclick="hideContext()" style="cursor: pointer; font-size: 1.1rem; align-self: flex-start;">×</div>
    `;
    
    bubble.classList.add('active');
    
    // Keep visible for a comfortable reading period (10 seconds for gold)
    setTimeout(() => {
        bubble.classList.remove('active');
        bubble.classList.remove('gold-edition');
    }, is5Form ? 12000 : 8500);
}
