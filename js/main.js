
// Main Entry Point
import * as StructureGame from './structure_game/game.js';
import * as StructureUI from './structure_game/ui.js';
import { changeSpeed, testAudio, speakText, playSuccessSound, playFailureSound } from './audio.js'; // Global audio remains


import * as DropGame from './chunk_game/game.js';
import * as TowerGame from './tower_game/game.js';

// --- Lobby Logic ---
function initLobby() {
    const lobby = document.getElementById('lobby-screen');
    const gameContainer = document.getElementById('game-container');
    const dropContainer = document.getElementById('drop-game-container');
    const towerContainer = document.getElementById('tower-game-container');
    const dictContainer = document.getElementById('dictation-game-container');

    if (lobby) lobby.style.display = 'block';
    if (gameContainer) gameContainer.style.display = 'none';
    if (dropContainer) dropContainer.style.display = 'none';
    if (towerContainer) towerContainer.style.display = 'none';
    if (dictContainer) dictContainer.style.display = 'none';
}

function launchStructureGame() {
    const lobby = document.getElementById('lobby-screen');
    const gameContainer = document.getElementById('game-container');

    lobby.style.display = 'none';
    gameContainer.style.display = 'block';

    // Load the structure game
    StructureGame.loadGame();
}

function launchDropGame() {
    const lobby = document.getElementById('lobby-screen');

    // Create container if not exists
    let dropContainer = document.getElementById('drop-game-container');
    if (!dropContainer) {
        dropContainer = document.createElement('div');
        dropContainer.id = 'drop-game-container';
        document.body.appendChild(dropContainer);

        // Load CSS Dynamically with cache busting
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/drop_game.css?v=${new Date().getTime()}`;
        document.head.appendChild(link);
    }

    lobby.style.display = 'none';
    dropContainer.style.display = 'block';

    DropGame.initGame();
}

function launchTowerGame() {
    const lobby = document.getElementById('lobby-screen');

    let towerContainer = document.getElementById('tower-game-container');
    if (!towerContainer) {
        towerContainer = document.createElement('div');
        towerContainer.id = 'tower-game-container';
        document.body.appendChild(towerContainer);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/tower_game.css?v=${new Date().getTime()}`;
        document.head.appendChild(link);
    }

    lobby.style.display = 'none';
    towerContainer.style.display = 'block';

    TowerGame.initTowerGame();
}

function launchDictationGame() {
    console.log("🚀 Launching Dictation Game...");
    const lobby = document.getElementById('lobby-screen');
    const dictContainer = document.getElementById('dictation-game-container');

    if (!dictContainer) {
        console.error("❌ Dictation container not found!");
        return;
    }

    if (!dictContainer.innerHTML.trim()) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `css/dictation_game.css?v=${new Date().getTime()}`;
        document.head.appendChild(link);
    }

    lobby.style.display = 'none';
    dictContainer.style.display = 'flex';

    import('./dictation_game/game.js')
        .then(module => {
            console.log("✅ Dictation module loaded");
            module.initGame();
        })
        .catch(err => {
            console.error("❌ Failed to load Dictation module:", err);
            alert("Failed to load game module. Please check internet connection.");
            initLobby();
        });
}

// --- Fullscreen Functionality ---
function toggleFullscreen() {
    const elem = document.documentElement;
    const icon = document.getElementById('fullscreen-icon');

    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
        if (icon) icon.textContent = '⛶'; // Exit fullscreen icon
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        if (icon) icon.textContent = '⛶'; // Enter fullscreen icon
    }
}

// Listen for fullscreen changes to update icon
document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
document.addEventListener('msfullscreenchange', updateFullscreenIcon);

function updateFullscreenIcon() {
    const icon = document.getElementById('fullscreen-icon');
    if (icon) {
        icon.textContent = document.fullscreenElement ? '⛶' : '⛶';
    }
}

// --- Global Exports for HTML ---
// Lobby
window.initLobby = initLobby;
window.launchStructureGame = launchStructureGame;
window.launchDropGame = launchDropGame;
window.launchTowerGame = launchTowerGame;
window.launchDictationGame = launchDictationGame;
window.toggleFullscreen = toggleFullscreen;

// Structure Game Bindings (legacy bindings for HTML buttons)
window.startGame = StructureGame.startGame;
window.proceedToNextLevel = StructureGame.proceedToNextLevel;
window.openPracticeMode = StructureGame.openPracticeMode;
window.closePracticeMode = StructureGame.closePracticeMode;
window.startPracticeDay = StructureGame.startPracticeDay;
window.exitPracticeMode = StructureGame.exitPracticeMode;
window.showExitModal = StructureGame.showExitModal;
window.closeExitModal = StructureGame.closeExitModal;
window.confirmExit = StructureGame.confirmExit;
window.testSpicyLevel = StructureGame.testSpicyLevel;
window.changeSpeed = changeSpeed;
window.testAudio = testAudio;
window.speakText = speakText;
window.playSuccessSound = playSuccessSound;
window.playFailureSound = playFailureSound;
window.closeGrammarModal = StructureUI.closeGrammarModal;
window.hideContext = StructureUI.hideContext;
window.resetAfterError = StructureUI.hideErrorFeedback;

// Start
document.addEventListener('DOMContentLoaded', () => {
    initLobby();
});
