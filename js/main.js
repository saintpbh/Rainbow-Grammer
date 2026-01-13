
// Main Entry Point
import * as StructureGame from './structure_game/game.js';
import * as StructureUI from './structure_game/ui.js';
import { changeSpeed, testAudio } from './audio.js'; // Global audio remains

// --- Lobby Logic ---
function initLobby() {
    const lobby = document.getElementById('lobby-screen');
    const gameContainer = document.getElementById('game-container');

    if (lobby) lobby.style.display = 'block';
    if (gameContainer) gameContainer.style.display = 'none';
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
    alert("🚀 Rainbow Drop Game Coming Soon!");
}

// --- Global Exports for HTML ---
// Lobby
window.initLobby = initLobby;
window.launchStructureGame = launchStructureGame;
window.launchDropGame = launchDropGame;

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
window.closeGrammarModal = StructureUI.closeGrammarModal;
window.hideContext = StructureUI.hideContext;
window.resetAfterError = StructureUI.hideErrorFeedback;

// Start
document.addEventListener('DOMContentLoaded', () => {
    initLobby();
});
