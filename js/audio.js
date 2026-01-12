import { gameState } from './state.js';
import { saveAudioPreference } from './storage.js';

export function initAudio() {
    if (gameState.audioContext && gameState.audioContext.state === 'suspended') {
        gameState.audioContext.resume();
    }
}

export function playSuccessSound() {
    initAudio();
    const ctx = gameState.audioContext;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}

export function playFailureSound() {
    initAudio();
    const ctx = gameState.audioContext;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
}

export function speakText(text) {
    return new Promise((resolve) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to use a better voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;

        utterance.rate = gameState.speechRate || 1.0;
        utterance.onend = resolve;
        utterance.onerror = resolve;
        window.speechSynthesis.speak(utterance);
    });
}

export async function speakSequence(text) {
    // Repeat 3 times for sensory loop
    for (let i = 0; i < 3; i++) {
        await speakText(text);
        if (i < 2) await new Promise(r => setTimeout(r, 300));
    }
}

export async function speak3x(text) {
    // Quick 3x loop
    for (let i = 0; i < 3; i++) {
        await speakText(text);
        await new Promise(r => setTimeout(r, 400));
    }
}

export function changeSpeed(rate) {
    gameState.speechRate = rate;

    // Update active button UI
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnRate = parseFloat(btn.textContent.replace('×', ''));
        if (Math.abs(btnRate - rate) < 0.01) {
            btn.classList.add('active');
        }
    });

    saveAudioPreference(rate);
    console.log(`✓ Audio speed set to ${rate}x`);
}

export function testAudio() {
    playSuccessSound();
    speakText("Ready");
}
