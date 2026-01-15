import { GET_LEVEL_FILES, POINTS_PER_WIN, PRINCIPLES } from '../config.js';
import { gameState } from '../state.js';
import * as ui from './ui.js';
import { speakText, playSuccessSound, playFailureSound, speak3x, initAudio } from '../audio.js';
import * as storage from '../storage.js';
import * as utils from '../utils.js';
import * as analytics from '../analytics.js';

// --- Initialization ---

export async function loadGame() {
    try {
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

    if (saved && saved.hasStarted) {
        const todayStr = new Date().toDateString();
        if (saved.lastPlayedDate !== todayStr) {
            saved.todayScore = 0;
        }

        gameState.totalScore = saved.totalScore || 0;
        gameState.todayScore = saved.todayScore || 0;
        gameState.currentLevelGlobalIndex = saved.levelIndex || 0;
        gameState.currentLevel = saved.currentLevel || 0;
        gameState.chiliCount = saved.chiliCount || 0;

        ui.showWelcomeModal(true, saved);
    } else {
        ui.showWelcomeModal(false, {});
    }

    gameState.speechRate = storage.loadAudioPreference();
}

export function startGame() {
    ui.closeWelcomeModal();
    initAudio();

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
    gameState.mistakeCount = 0;

    ui.updatePhase(PRINCIPLES.ACTIVE);

    // Text Display
    let qText = item.question || "";
    if (!qText || qText === "Translate" || qText === "Review") {
        qText = item.description ? `Construct: ${item.description}` : "Translate the sentence";
    }
    ui.updateQuestionDisplay(item.korean, qText);

    // Play Question Audio
    if (item.question) {
        setTimeout(() => {
            speakText(item.question);
        }, 600);
    }

    // Badges
    const badgeText = item.section.split(':')[0] || "LEVEL";
    ui.updateLevelBadge(badgeText, gameState.isPracticeMode);

    // Update Chili Display
    ui.updateChiliCount(gameState.currentLevel);

    // Progress HUD
    ui.updateProgressHUD(gameState.currentLevelGlobalIndex, gameState.curriculum.length);

    // Show context
    ui.showContext(item.context);

    // Show Grammar Tip
    const sentenceInDay = gameState.currentLevelGlobalIndex % 10;
    if (sentenceInDay === 0 && item.grammarTip) {
        ui.showGrammarTip(item.grammarTip);
    }

    // Reset Slots
    ui.renderAnswerSlot(gameState.currentChunks, gameState.selectedIndices, undoSelection);

    // Render Pool
    ui.renderPool(gameState.currentChunks, [], handleInput);
    ui.updateScoreHUD(gameState.todayScore, gameState.totalScore);
}

function handleInput(idx, element) {
    if (element.classList.contains('used')) return;

    const chunk = gameState.currentChunks[idx];
    speakText(chunk.text);

    gameState.selectedIndices.push(idx);

    element.classList.add('used');

    ui.renderAnswerSlot(gameState.currentChunks, gameState.selectedIndices, undoSelection);

    checkCompletion();
}

function undoSelection(chunkIdx) {
    const pos = gameState.selectedIndices.indexOf(chunkIdx);
    if (pos === -1) return;

    const chunk = gameState.currentChunks[chunkIdx];
    speakText(chunk.text);

    gameState.selectedIndices.splice(pos, 1);

    ui.renderAnswerSlot(gameState.currentChunks, gameState.selectedIndices, undoSelection);

    const pool = document.getElementById('pool-area');
    if (pool) {
        const pill = pool.querySelector(`.word-pill[data-idx="${chunkIdx}"]`);
        if (pill) pill.classList.remove('used');
    }
}

async function checkCompletion() {
    if (gameState.selectedIndices.length !== gameState.currentChunks.length) return;

    let isCorrect = true;
    for (let i = 0; i < gameState.selectedIndices.length; i++) {
        if (gameState.selectedIndices[i] !== i) {
            isCorrect = false;
            break;
        }
    }

    if (isCorrect) {
        gameState.totalScore += POINTS_PER_WIN;
        gameState.todayScore += POINTS_PER_WIN;

        ui.indicateSuccess();

        playSuccessSound();
        ui.updateScoreHUD(gameState.todayScore, gameState.totalScore);
        ui.showFloatingScore(POINTS_PER_WIN);
        utils.createConfetti(window.innerWidth / 2, window.innerHeight / 2);

        analytics.trackAttempt(true, gameState.currentItem.section);
        analytics.trackVocabularyExposure(gameState.currentChunks, gameState.currentItem.section);

        if (!gameState.isPracticeMode) {
            gameState.currentLevelGlobalIndex++;
            storage.saveProgress();
            gameState.currentLevelGlobalIndex--;
        }

        // Speak (3x playback) - DISABLED per user request
        // if (gameState.currentItem.english) {
        //     speak3x(gameState.currentItem.english);
        // }

        await new Promise(r => setTimeout(r, 800));

        proceedToNextItemLogic();

    } else {
        gameState.mistakeCount++;

        ui.indicateFailure();
        playFailureSound();

        analytics.trackAttempt(false, gameState.currentItem.section);

        if (gameState.mistakeCount >= 3) {
            playFailureSound();

            // Show correct answer
            const correctIndices = gameState.currentChunks.map((_, i) => i);
            ui.renderAnswerSlot(gameState.currentChunks, correctIndices, () => { });
            ui.indicateSuccess(); // Style as correct

            if (!gameState.isPracticeMode) {
                gameState.currentLevelGlobalIndex++;
                storage.saveProgress();
                gameState.currentLevelGlobalIndex--;
            }

            if (gameState.currentItem.english) {
                speak3x(gameState.currentItem.english);
            }

            setTimeout(() => {
                proceedToNextItemLogic();
            }, 2000);

            return;
        }
    }
}

function proceedToNextItemLogic() {
    if (gameState.isPracticeMode) {
        gameState.currentLevelGlobalIndex++;
        const sentenceInDay = gameState.currentLevelGlobalIndex % 10;
        if (sentenceInDay === 0) {
            alert("Practice Day Complete! Good job.");
            exitPracticeMode();
            return;
        }
        loadLevel();
    } else {
        const currentSection = gameState.currentItem.section;
        gameState.currentLevelGlobalIndex++;

        if (gameState.currentLevelGlobalIndex >= gameState.curriculum.length) {
            utils.createEmojiFireworks();

            gameState.currentLevel++;
            gameState.chiliCount++;
            if (gameState.currentLevel > 6) gameState.currentLevel = 6;

            storage.saveProgress();

            setTimeout(() => {
                alert(`🎉 GREAT JOB! 🎉\nYou completed Spicy Level ${gameState.currentLevel - 1}!\nYou earned a Chili 🌶️ and unlocked Spicy Level ${gameState.currentLevel}.\nLet's start the new level!`);

                gameState.currentLevelGlobalIndex = 0;
                storage.saveProgress();
                location.reload();
            }, 1000);
            return;
        }

        const nextItem = gameState.curriculum[gameState.currentLevelGlobalIndex];
        if (nextItem && nextItem.section !== currentSection) {
            ui.showDayTransition(
                currentSection,
                nextItem.section,
                nextItem.grammarGuide || { title: nextItem.description || "Next Step", structure: [] }
            );
        } else {
            loadLevel();
        }
    }
}

export function proceedToNextLevel() {
    ui.closeTransitionModal();
    loadLevel();
}

// --- Practice Mode ---

let savedBeforePracticeIndex = 0;

export function openPracticeMode() {
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

    storage.saveProgress();

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
