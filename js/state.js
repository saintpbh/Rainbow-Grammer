export const gameState = {
    curriculum: [],
    totalScore: 0,
    todayScore: 0,
    currentItem: null,
    currentChunks: [],
    selectedIndices: [],
    currentLevelGlobalIndex: 0,
    isPracticeMode: false,
    speechRate: 1.0,
    voices: [],
    audioContext: null
};

// Initialize Audio Context lazily or here
try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    gameState.audioContext = new AudioContext();
} catch (e) {
    console.warn("Web Audio API not supported");
}
