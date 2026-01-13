import { GET_LEVEL_FILES, POINTS_PER_WIN, PRINCIPLES } from './config.js';
import { gameState } from './state.js';
import * as ui from './ui.js';
import * as audio from './audio.js';
import * as storage from './storage.js';
import * as utils from './utils.js';
import * as analytics from './analytics.js';

// --- Initialization ---

export async function loadGame() {
    try {
        // Determine level (default 0 or loaded from state?) 
        // We need to initApp first to get saved state, THEN load data.
        // But original logic loaded data THEN initApp. 
        // Let's modify: load saved state lightly first to get level.
        const saved = storage.loadProgress();
        const level = saved ? (saved.currentLevel || 0) : 0;
        gameState.currentLevel = level;

        const files = GET_LEVEL_FILES(level);
        const filePromises = files.map(file =>
            fetch(file)
                .then(res => {
                    if (!res.ok) {
                        console.warn(`Failed to load ${file}: ${res.statusText}`);
                        return { curriculum: [] };
                    }
                    return res.json();
                })
                .catch(err => {
                    console.error(`Error loading ${file}:`, err);
                    return { curriculum: [] };
                })
        );

        const dataChunks = await Promise.all(filePromises);

        gameState.curriculum = [];
        dataChunks.forEach(chunk => {
            if (chunk.curriculum && chunk.curriculum.length > 0) {
                gameState.curriculum = gameState.curriculum.concat(chunk.curriculum);
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
        gameState.currentLevel = saved.currentLevel || 0;
        gameState.chiliCount = saved.chiliCount || 0;

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
    if (qEl) qEl.textContent = item.korean || "";

    // Question Display (English)
    const qDisplay = document.getElementById('question-display');
    if (qDisplay) {
        qDisplay.textContent = item.question || "";
        // Optional: Add visual cue for "Listen!"
    }

    // Play Question Audio
    if (item.question) {
        // slight delay to allow transition
        setTimeout(() => {
            audio.speakText(item.question);
        }, 600);
    }

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


    // Update Chili Display
    const chiliCountEl = document.getElementById('chili-count');
    if (chiliCountEl) {
        // Display current Level as Chili Count (or actual completed cycles?)
        // User requested "Level Up" feeling, so showing Current Level makes sense.
        // Level 0 -> x 0, Level 1 -> x 1
        chiliCountEl.textContent = `x ${gameState.currentLevel}`;
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

            // Check if we reached the end of the loaded curriculum
            if (gameState.currentLevelGlobalIndex >= gameState.curriculum.length) {
                // CYCLE COMPLETE!
                utils.createEmojiFireworks();

                // Slight delay for alert so fireworks can be seen
                setTimeout(() => {
                    alert("🎉 LEVEL UP! 🎉\nYou earned a Chili!");

                    gameState.chiliCount++;
                    gameState.currentLevel++;

                    // Safety cap
                    if (gameState.currentLevel > 6) gameState.currentLevel = 6;

                    gameState.currentLevelGlobalIndex = 0; // Reset for next cycle

                    // Save updated level/chili
                    storage.saveProgress();

                    location.reload(); // Reload to fetch new Level data
                }, 1500);
                return;
            }

            const nextItem = gameState.curriculum[gameState.currentLevelGlobalIndex];

            if (nextItem && nextItem.section !== currentSection) {
                // Day/Section Change
                // Use the next item's grammar guide if available
                ui.showDayTransition(
                    currentSection,
                    nextItem.section,
                    nextItem.grammarGuide || { title: nextItem.description || "Next Step", structure: [] },
                    () => { } // Callback is handled by the button in modal calling proceedToNextLevel
                );
            } else {
                // Same section, next sentence
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

// --- Dev / Test Functions ---
export function testSpicyLevel() {
    const input = prompt("🌶️ Enter Spicy Level (0-6) to test:", gameState.currentLevel);
    if (input === null) return;

    const targetLevel = parseInt(input, 10);
    if (isNaN(targetLevel) || targetLevel < 0 || targetLevel > 6) {
        alert("Please enter a number between 0 and 6.");
        return;
    }

    const confirmTest = confirm(`🌶️ Switch to Spicy Level ${targetLevel}?\nCurrent progress will be saved.`);
    if (!confirmTest) return;

    // Save current
    storage.saveProgress();

    // Reset to start of that level
    const progress = {
        levelIndex: 0,
        totalScore: gameState.totalScore,
        todayScore: 0,
        lastPlayedDate: new Date().toDateString(),
        hasStarted: true,
        currentLevel: targetLevel,
        chiliCount: gameState.chiliCount
    };
    storage.saveProgressExplicit(progress);
    location.reload();
}
