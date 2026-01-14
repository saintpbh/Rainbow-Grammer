import { gameState } from '../state.js';
import { GET_LEVEL_FILES, POINTS_PER_WIN } from '../config.js';
import * as storage from '../storage.js';
import { speakText, initAudio } from '../audio.js';
import * as ui from './ui.js';
import { createEmojiFireworks } from '../utils.js';

let currentLevelData = [];

export async function initGame() {
    initAudio();
    const saved = storage.loadProgress();
    gameState.currentLevel = saved ? (saved.currentLevel || 0) : 0;
    gameState.todayScore = saved ? (saved.todayScore || 0) : 0;
    gameState.currentLevelGlobalIndex = saved ? (saved.levelIndex || 0) : 0;

    await loadLevelData();
    renderCurrentQuestion();
}

async function loadLevelData() {
    const files = GET_LEVEL_FILES(gameState.currentLevel);
    const dataChunks = await Promise.all(files.map(f => fetch(f).then(res => res.json())));

    currentLevelData = [];
    dataChunks.forEach(chunk => {
        if (chunk.curriculum) currentLevelData = currentLevelData.concat(chunk.curriculum);
    });
}

function renderCurrentQuestion() {
    const item = currentLevelData[gameState.currentLevelGlobalIndex];
    if (!item) {
        alert("Level Complete!");
        window.initLobby();
        return;
    }

    gameState.currentItem = item;
    gameState.selectedIndices = [];

    const container = document.getElementById('dictation-game-container');
    ui.renderGameUI(container, gameState, {
        onSelectPill: handlePillSelection
    });

    // Auto-play first time
    setTimeout(() => {
        replayDictation();
    }, 500);
}

window.replayDictation = function () {
    const speaker = document.getElementById('speaker-btn');
    if (speaker) speaker.classList.add('playing');

    speakText(gameState.currentItem.english, () => {
        if (speaker) speaker.classList.remove('playing');
    });
};

function handlePillSelection(idx) {
    // In Dictation mode, they must select in order S -> V -> O...
    const nextRequiredIdx = gameState.selectedIndices.length;

    if (idx === nextRequiredIdx) {
        gameState.selectedIndices.push(idx);

        // Refresh UI
        const container = document.getElementById('dictation-game-container');
        ui.renderGameUI(container, gameState, {
            onSelectPill: handlePillSelection
        });

        // Check completion
        if (gameState.selectedIndices.length === gameState.currentItem.chunks.length) {
            handleSuccess();
        }
    } else {
        // Wrong order
        const basket = document.querySelectorAll('.dict-basket')[nextRequiredIdx];
        if (basket) {
            basket.style.animation = 'shake 0.5s';
            setTimeout(() => basket.style.animation = '', 500);
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
            createEmojiFireworks();
            gameState.currentLevel++;
            gameState.currentLevelGlobalIndex = 0;
            storage.saveProgress();
            alert("Level Up! Moving to next Spicy Level.");
            initGame();
        } else {
            storage.saveProgress();
            renderCurrentQuestion();
        }
    });
}
