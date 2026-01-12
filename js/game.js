import { WEEK_FILES, POINTS_PER_WIN, PRINCIPLES } from './config.js';
import { gameState } from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import * as storage from './storage.js';
import * as utils from './utils.js';
import * as analytics from './analytics.js';

// --- Initialization ---

export async function loadGame() {
    try {
        const weekPromises = WEEK_FILES.map(file =>
            fetch(file)
                .then(res => res.ok ? res.json() : { curriculum: [] })
                .catch(() => ({ curriculum: [] }))
        );

        const weeks = await Promise.all(weekPromises);

        gameState.curriculum = [];
        weeks.forEach(week => {
            if (week.curriculum && week.curriculum.length > 0) {
                gameState.curriculum = gameState.curriculum.concat(week.curriculum);
            }
        });

        console.log(`✓ Loaded ${gameState.curriculum.length} sentences`);

        if (gameState.curriculum.length === 0) {
            throw new Error('No curriculum data loaded');
        }

        initApp();
    } catch (e) {
        console.error("Failed to load curriculum:", e);
        alert('Failed to load curriculum data. Please refresh.');
    }
}

function initApp() {
    const saved = storage.loadProgress();

    // Load persisted state if exists (and valid)
    if (saved && saved.hasStarted) {
        // Daily reset logic could go here, but basic load is fine
        // Check date?
        const todayStr = new Date().toDateString();
        if (saved.lastPlayedDate !== todayStr) {
            saved.todayScore = 0;
        }

        gameState.totalScore = saved.totalScore || 0;
        gameState.todayScore = saved.todayScore || 0;
        gameState.currentLevelGlobalIndex = saved.levelIndex || 0;

        // Show welcome with stats
        ui.showWelcomeModal(true, saved);
    } else {
        ui.showWelcomeModal(false, {});
    }

    // Load audio preference
    gameState.speechRate = storage.loadAudioPreference();
}

export function startGame() {
    ui.closeWelcomeModal();
    audio.initAudio();

    // Init voices
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
    }

    ui.updateScoreHUD(gameState.todayScore, gameState.totalScore);
    loadLevel();
    analytics.loadAnalytics();
}

// --- Game Logic ---

export function loadLevel() {
    if (gameState.currentLevelGlobalIndex >= gameState.curriculum.length) {
        alert("Course Complete!");
        return;
    }

    const item = gameState.curriculum[gameState.currentLevelGlobalIndex];
    gameState.currentItem = item;
    gameState.currentChunks = item.chunks;
    gameState.selectedIndices = [];

    // Update UI
    ui.updatePhase(PRINCIPLES.ACTIVE);

    // Text setup (Korean)
    const qEl = document.getElementById('question-text');
    if (qEl) qEl.textContent = item.korean;

    // Badges
    const badgeEl = document.getElementById('level-btn');
    if (badgeEl) {
        // If practice mode
        if (gameState.isPracticeMode) {
            // Managed by practice logic, but if basic loadLevel call...
            // Keep badge text if in practice mode?
            if (badgeEl.textContent.includes('Practice')) {
                // Keep it
            } else {
                badgeEl.textContent = item.section.split(':')[0] || "LEVEL";
            }
        } else {
            badgeEl.textContent = item.section.split(':')[0] || "LEVEL";
            badgeEl.style.background = ''; // Reset color
        }
    }

    // Progress HUD
    ui.updateProgressHUD(gameState.currentLevelGlobalIndex, gameState.curriculum.length);

    // Show context
    ui.showContext(item.context);

    // Show Grammar Tip (if first sentence of day)
    const sentenceInDay = gameState.currentLevelGlobalIndex % 10;
    if (sentenceInDay === 0 && item.grammarTip) {
        ui.showGrammarTip(item.grammarTip);
    }

    // Reset Slots
    ui.renderAnswerSlot(gameState.currentChunks, gameState.selectedIndices, undoSelection);

    // Render Pool
    ui.renderPool(gameState.currentChunks, [], handleInput); // Empty usedIndices at start
    ui.updateScoreHUD(gameState.todayScore, gameState.totalScore);
}

function handleInput(idx, element) {
    if (element.classList.contains('used')) return;

    // Add to selection
    gameState.selectedIndices.push(idx);

    // Mark as used visually (or re-render?)
    // Re-rendering pool reshuffles, which is annoying.
    // Better to validly manipulate DOM or re-render without shuffle.
    // ui.renderPool checks 'usedIndices'.
    // Calling ui.renderPool(..., gameState.selectedIndices, ...) reshuffles every click.
    // The original code ADDED 'used' class manually.
    element.classList.add('used');

    // Update Answer Slot
    ui.renderAnswerSlot(gameState.currentChunks, gameState.selectedIndices, undoSelection);

    checkCompletion();
}

function undoSelection(chunkIdx) {
    const pos = gameState.selectedIndices.indexOf(chunkIdx);
    if (pos === -1) return;

    gameState.selectedIndices.splice(pos, 1);

    // Re-render Answer
    ui.renderAnswerSlot(gameState.currentChunks, gameState.selectedIndices, undoSelection);

    // Un-use from pool
    const pool = document.getElementById('pool-area');
    if (pool) {
        const pill = pool.querySelector(`.word-pill[data-idx="${chunkIdx}"]`);
        if (pill) pill.classList.remove('used');
    }
}

async function checkCompletion() {
    if (gameState.selectedIndices.length !== gameState.currentChunks.length) return;

    // Validate Order
    let isCorrect = true;
    for (let i = 0; i < gameState.selectedIndices.length; i++) {
        if (gameState.selectedIndices[i] !== i) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        // Success
        gameState.totalScore += POINTS_PER_WIN;
        gameState.todayScore += POINTS_PER_WIN;

        const slot = document.getElementById('answer-slot');
        if (slot) slot.classList.add('correct');

        audio.playSuccessSound();
        ui.updateScoreHUD(gameState.todayScore, gameState.totalScore);
        ui.showFloatingScore(POINTS_PER_WIN);
        utils.createConfetti(window.innerWidth / 2, window.innerHeight / 2);

        // Update Analytics
        analytics.trackAttempt(true, gameState.currentItem.section);
        analytics.trackVocabularyExposure(gameState.currentChunks, gameState.currentItem.section);

        // Save
        if (!gameState.isPracticeMode) {
            gameState.currentLevelGlobalIndex++;
            storage.saveProgress();
            gameState.currentLevelGlobalIndex--; // revert for logic flow
        }

        // Speak
        if (gameState.currentItem.english) {
            await audio.speak3x(gameState.currentItem.english);
        } else {
            await new Promise(r => setTimeout(r, 1500));
        }

        // Logic for Next
        if (gameState.isPracticeMode) {
            // Simple next
            gameState.currentLevelGlobalIndex++;
            // Check boundary for practice (usually 10 sentences)
            const sentenceInDay = gameState.currentLevelGlobalIndex % 10;
            if (sentenceInDay === 0) {
                // End of practice day
                alert("Practice Day Complete! Good job.");
                exitPracticeMode();
                return;
            }
            loadLevel();
        } else {
            // Normal Flow
            const currentSection = gameState.currentItem.section;
            gameState.currentLevelGlobalIndex++;
            const nextItem = gameState.curriculum[gameState.currentLevelGlobalIndex];

            if (nextItem && nextItem.section !== currentSection) {
                // Level Up
                ui.showLevelUpCelebration(currentSection, nextItem.section, () => {
                    // Proceed handled by user clicking button in modal (proceedToNextLevel)
                });
            } else {
                loadLevel();
            }
        }

    } else {
        // Error
        const slot = document.getElementById('answer-slot');
        if (slot) slot.classList.add('shake');
        audio.playFailureSound();

        analytics.trackAttempt(false, gameState.currentItem.section);

        // Analyze Error
        // We could call analytics.analyzeError(...) and show feedback
        // But for now just shake as requested by strict stability.
    }
}

export function proceedToNextLevel() {
    ui.closeTransitionModal();
    loadLevel();
}

// --- Practice Mode ---

// Store original index when entering practice
let savedBeforePracticeIndex = 0;

export function openPracticeMode() {
    // Show modal with selector
    // Current unlocked day calculation
    const currentDay = Math.floor(gameState.currentLevelGlobalIndex / 10) + 1;

    ui.openPracticeModal(currentDay, (selectedDay) => {
        startPracticeDay(selectedDay);
    });
}

export function closePracticeMode() {
    ui.closePracticeModal();
}

export function startPracticeDay(day) {
    savedBeforePracticeIndex = gameState.currentLevelGlobalIndex;
    gameState.isPracticeMode = true;

    // Jump to start of that day
    gameState.currentLevelGlobalIndex = (day - 1) * 10;

    ui.closePracticeModal();
    loadLevel();

    ui.showPracticeExitButton(day, () => {
        exitPracticeMode();
    });
}

export function exitPracticeMode() {
    gameState.isPracticeMode = false;
    gameState.currentLevelGlobalIndex = savedBeforePracticeIndex;

    ui.removePracticeExitButton();
    loadLevel();
}

// --- Exit Logic ---

export function showExitModal() {
    // Calculate display data
    const idx = gameState.currentLevelGlobalIndex;
    const day = Math.floor(idx / 10) + 1;
    const week = Math.ceil(day / 7);
    const sent = (idx % 10) + 1;

    ui.showExitModal({
        day, week, sentence: sent, totalScore: gameState.totalScore
    });
}

export function closeExitModal() {
    ui.closeExitModal();
}

export function confirmExit() {
    storage.saveProgress();
    ui.closeExitModal();

    const idx = gameState.currentLevelGlobalIndex;
    const day = Math.floor(idx / 10) + 1;
    const sent = (idx % 10) + 1;

    ui.showSaveConfirmation({ day, sentence: sent });
}
