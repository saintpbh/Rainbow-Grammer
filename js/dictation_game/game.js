import { gameState } from '../state.js';
import { GET_LEVEL_FILES, POINTS_PER_WIN } from '../config.js';
import * as storage from '../storage.js';
import { speakText, initAudio } from '../audio.js';
import * as ui from './ui.js';
import { createEmojiFireworks } from '../utils.js';

let currentLevelData = [];

export async function initGame() {
    console.log("🎮 Initializing Dictation Game...");
    initAudio();
    const saved = storage.loadProgress();
    gameState.currentLevel = saved ? (saved.currentLevel || 0) : 0;
    gameState.todayScore = saved ? (saved.todayScore || 0) : 0;
    gameState.currentLevelGlobalIndex = saved ? (saved.levelIndex || 0) : 0;

    console.log(`📊 Initial Level: ${gameState.currentLevel}, Index: ${gameState.currentLevelGlobalIndex}`);

    // Setup global keyboard hooks
    document.removeEventListener('keydown', handleGlobalKeydown); // safe removal
    document.addEventListener('keydown', handleGlobalKeydown);

    await loadLevelData();
    renderCurrentQuestion();
}

async function loadLevelData() {
    console.log(`📂 Loading curriculum for level ${gameState.currentLevel}...`);
    const files = GET_LEVEL_FILES(gameState.currentLevel);
    console.log("Files to load:", files);

    try {
        const dataChunks = await Promise.all(files.map(f => fetch(f).then(res => res.json())));

        currentLevelData = [];
        dataChunks.forEach(chunk => {
            if (chunk.curriculum) currentLevelData = currentLevelData.concat(chunk.curriculum);
        });
        console.log(`✅ Loaded ${currentLevelData.length} sentences`);
    } catch (e) {
        console.error("❌ Failed to fetch level data:", e);
    }
}

function renderCurrentQuestion() {
    console.log(`🎯 Rendering Question Index: ${gameState.currentLevelGlobalIndex}`);
    const item = currentLevelData[gameState.currentLevelGlobalIndex];
    if (!item) {
        console.warn("⚠️ No item found at this index. Curriculum ended?");
        alert("Level Complete!");
        window.initLobby();
        return;
    }

    gameState.currentItem = item;
    gameState.selectedIndices = [];

    console.log("📝 Current Item:", item.english);

    const container = document.getElementById('dictation-game-container');
    if (!container) {
        console.error("❌ Dictation container missing during render!");
        return;
    }

    // Ensure it's visible
    container.style.display = 'flex';

    ui.renderGameUI(container, gameState, {
        onSelectPill: handlePillSelection
    });

    // Update Progress Bar
    ui.updateProgressBar(gameState.currentLevelGlobalIndex + 1, currentLevelData.length);

    // Auto-play first time
    console.log("🔊 Auto-playing audio...");
    setTimeout(() => {
        replayDictation();
    }, 500);
}

// Global hook for exit button
window.exitDictationGame = function () {
    cleanupGame();
    window.initLobby();
};

function cleanupGame() {
    document.removeEventListener('keydown', handleGlobalKeydown);
}

function handleGlobalKeydown(e) {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        window.replayDictation();
    } else if (e.code === 'Escape') {
        window.exitDictationGame();
    }
}

window.replayDictation = function () {
    const speaker = document.getElementById('speaker-btn');
    if (speaker) speaker.classList.add('playing');

    speakText(gameState.currentItem.english, () => {
        if (speaker) speaker.classList.remove('playing');
    });
};

function handlePillSelection(idx, pillElement) {
    // In Dictation mode, they must select in order S -> V -> O...
    const nextRequiredIdx = gameState.selectedIndices.length;

    if (idx === nextRequiredIdx) {
        // Correct selection!
        // Animate first, then update state
        ui.flyPillToBasket(pillElement, nextRequiredIdx, () => {
            gameState.selectedIndices.push(idx);

            // Refresh UI
            const container = document.getElementById('dictation-game-container');
            ui.renderGameUI(container, gameState, {
                onSelectPill: handlePillSelection
            });

            // Update Progress Bar
            ui.updateProgressBar(gameState.currentLevelGlobalIndex + 1, currentLevelData.length);

            // Check completion
            if (gameState.selectedIndices.length === gameState.currentItem.chunks.length) {
                handleSuccess();
            }
        });

    } else {
        // Wrong order
        const basket = document.querySelectorAll('.dict-basket')[nextRequiredIdx];
        if (basket) {
            basket.style.animation = 'shake 0.5s';
            setTimeout(() => basket.style.animation = '', 500);

            // Visual feedback for wrong pill?
            if (pillElement) {
                pillElement.style.animation = 'shake 0.5s';
                setTimeout(() => pillElement.style.animation = '', 500);
            }
        }
    }
}

function handleSuccess() {
    gameState.todayScore += POINTS_PER_WIN;
    gameState.totalScore += POINTS_PER_WIN;
    ui.updateScore(gameState.todayScore);

    ui.showSuccess(gameState.currentItem.english, () => {
        gameState.currentLevelGlobalIndex++;

        if (gameState.currentLevelGlobalIndex >= currentLevelData.length) {
            // Level up logic
            // Check if next level data exists (simple check: max level is usually 6)
            if (gameState.currentLevel >= 6) { // Assuming 6 is max index (Level 7) or whatever config says
                alert("🎉 ALL LEVELS COMPLETED! You are a Grammar Master! 🌈");
                window.initLobby(); // Return to lobby
                return;
            }

            createEmojiFireworks();
            gameState.currentLevel++;
            gameState.currentLevelGlobalIndex = 0;
            storage.saveProgress();

            // Try to load next level
            loadLevelData().then(() => {
                if (currentLevelData.length === 0) {
                    alert("🎉 No more questions in this level yet! Great job!");
                    window.initLobby();
                } else {
                    alert("Level Up! Moving to next Spicy Level.");
                    renderCurrentQuestion();
                }
            });

        } else {
            storage.saveProgress();
            renderCurrentQuestion();
        }
    });
}
