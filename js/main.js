
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

    if (lobby) lobby.style.display = 'block';
    if (gameContainer) gameContainer.style.display = 'none';
    if (dropContainer) dropContainer.style.display = 'none';
    if (towerContainer) towerContainer.style.display = 'none';
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

// --- Global Exports for HTML ---
// Lobby
window.initLobby = initLobby;
window.launchStructureGame = launchStructureGame;
window.launchDropGame = launchDropGame;
window.launchTowerGame = launchTowerGame;

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
