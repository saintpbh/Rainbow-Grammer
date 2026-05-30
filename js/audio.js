import { gameState } from './state.js';
import { saveAudioPreference, saveVoicePreference, loadVoicePreference } from './storage.js';

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

export function speakText(text, cancelCurrent = true) {
    if (!text) return Promise.resolve();

    return new Promise((resolve) => {
        // Fallback timeout in case TTS fails or hangs
        const timeout = setTimeout(() => {
            resolve();
        }, 5000);

        try {
            // Chrome bug fix: sometimes the speech engine gets stuck/paused
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }

            // Only cancel if requested (usually for new user clicks)
            if (cancelCurrent) {
                window.speechSynthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);

            // Try to use selected voice or fallback to default English voice
            const voices = window.speechSynthesis.getVoices();
            let chosenVoice = voices.find(v => v.voiceURI === gameState.selectedVoiceURI);
            if (!chosenVoice) {
                chosenVoice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
            }
            if (chosenVoice) {
                utterance.voice = chosenVoice;
            }

            utterance.rate = gameState.speechRate || 1.0;

            utterance.onstart = () => {
                console.log('🔊 Speaking:', text);
            };

            utterance.onend = () => {
                clearTimeout(timeout);
                resolve();
            };

            utterance.onerror = (event) => {
                clearTimeout(timeout);
                // Silence common non-error interruptions
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    console.warn('TTS Notification:', event.error);
                }
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('TTS exception:', error);
            clearTimeout(timeout);
            resolve();
        }
    });
}

export async function speakSequence(text) {
    // Repeat 3 times for sensory loop
    await speakText(text, true);
    for (let i = 0; i < 2; i++) {
        await new Promise(r => setTimeout(r, 200));
        await speakText(text, false);
    }
}

export async function speak3x(text) {
    // Sequential 3x loop: First one cancels existing, next 2 append to queue
    await speakText(text, true);
    for (let i = 0; i < 2; i++) {
        // Shorter delay between repeats for better rhythm
        await new Promise(r => setTimeout(r, 300));
        await speakText(text, false);
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

export function changeVoice(voiceURI) {
    gameState.selectedVoiceURI = voiceURI;
    saveVoicePreference(voiceURI);
    
    // Quick test play to provide instant feedback
    const voices = window.speechSynthesis.getVoices();
    const chosen = voices.find(v => v.voiceURI === voiceURI);
    const displayName = chosen ? chosen.name : "Selected Voice";
    console.log(`✓ Voice changed to: ${displayName}`);
    
    speakText("Voice selected");
}

export function populateVoiceSelector() {
    const selector = document.getElementById('voice-select');
    if (!selector) return;

    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    // Clear existing
    selector.innerHTML = '';

    if (enVoices.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = "No English voices found";
        selector.appendChild(opt);
        return;
    }

    // Load saved URI if any
    const savedURI = loadVoicePreference();
    if (savedURI && voices.some(v => v.voiceURI === savedURI)) {
        gameState.selectedVoiceURI = savedURI;
    } else {
        const defaultUS = enVoices.find(v => v.lang.startsWith('en-US')) || enVoices[0];
        gameState.selectedVoiceURI = defaultUS.voiceURI;
    }

    enVoices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI;
        // Clean display name (e.g., Google US English)
        opt.textContent = `${v.name} (${v.lang})`;
        if (v.voiceURI === gameState.selectedVoiceURI) {
            opt.selected = true;
        }
        selector.appendChild(opt);
    });
}
