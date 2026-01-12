import { SAVE_KEY } from './config.js';
import { gameState } from './state.js';

export function saveProgress() {
    const stateToSave = {
        levelIndex: gameState.currentLevelGlobalIndex,
        totalScore: gameState.totalScore,
        todayScore: gameState.todayScore,
        lastPlayedDate: new Date().toDateString(),
        hasStarted: true
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
}

export function loadProgress() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
}

export function saveAudioPreference(rate) {
    localStorage.setItem('audio_speed', rate);
}

export function loadAudioPreference() {
    const saved = localStorage.getItem('audio_speed');
    if (saved) {
        return parseFloat(saved);
    }
    return 1.0;
}
