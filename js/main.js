import { startGame, proceedToNextLevel, openPracticeMode, closePracticeMode, startPracticeDay, exitPracticeMode, showExitModal, closeExitModal, confirmExit, loadGame } from './game.js';
import { changeSpeed, testAudio } from './audio.js';
import { closeGrammarModal, hideContext, hideErrorFeedback } from './ui.js';

// Expose to window for HTML onclick handlers
window.startGame = startGame;
window.proceedToNextLevel = proceedToNextLevel;
window.openPracticeMode = openPracticeMode;
window.closePracticeMode = closePracticeMode;
window.startPracticeDay = startPracticeDay;
window.exitPracticeMode = exitPracticeMode;
window.showExitModal = showExitModal;
window.closeExitModal = closeExitModal;
window.confirmExit = confirmExit;
window.changeSpeed = changeSpeed;
window.testAudio = testAudio;
window.closeGrammarModal = closeGrammarModal;
window.hideContext = hideContext;
window.resetAfterError = hideErrorFeedback;

// Start the game initialization
// Not using window.onload because module scripts defer automatically, 
// but explicit call is safer for timing.
loadGame();
