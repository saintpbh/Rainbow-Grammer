import { gameState } from './state.js';
import { saveAudioPreference, saveVoicePreference, loadVoicePreference, saveTTSPreference, loadTTSPreference } from './storage.js';

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

    if (!gameState.ttsEnabled) {
        return Promise.resolve(); // TTS Muted by default / user setting
    }

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
    
    // 1. Filter: Strictly US English (en-US or en_US) to keep it native
    let usVoices = voices.filter(v => {
        const lang = v.lang.replace('_', '-').toLowerCase();
        return lang === 'en-us';
    });

    // Fallback: If no strict en-US, take any en voice
    if (usVoices.length === 0) {
        usVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    }

    // 2. High-Quality Professional Voice Filter Keywords
    const premiumKeywords = ['google', 'samantha', 'premium', 'enhanced', 'natural', 'ava', 'allison', 'susan', 'zoe', 'david', 'zira', 'karen', 'nathan', 'en-us-x-sfg'];
    
    let filteredVoices = usVoices.filter(v => {
        const name = v.name.toLowerCase();
        return premiumKeywords.some(kw => name.includes(kw));
    });

    // Fallback: If filtering left us empty, use all US voices
    if (filteredVoices.length === 0) {
        filteredVoices = usVoices;
    }

    // 3. Sort: Google US English and Apple Samantha/Ava/Premium at the top!
    filteredVoices.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        // Google high-quality US English first
        const isGoogleA = nameA.includes('google');
        const isGoogleB = nameB.includes('google');
        if (isGoogleA && !isGoogleB) return -1;
        if (!isGoogleA && isGoogleB) return 1;
        
        // Apple Samantha/Ava second
        const isSamanthaA = nameA.includes('samantha') || nameA.includes('ava');
        const isSamanthaB = nameB.includes('samantha') || nameB.includes('ava');
        if (isSamanthaA && !isSamanthaB) return -1;
        if (!isSamanthaA && isSamanthaB) return 1;
        
        // Enhanced / Premium / Natural third
        const isPremiumA = nameA.includes('premium') || nameA.includes('enhanced') || nameA.includes('natural');
        const isPremiumB = nameB.includes('premium') || nameB.includes('enhanced') || nameB.includes('natural');
        if (isPremiumA && !isPremiumB) return -1;
        if (!isPremiumA && isPremiumB) return 1;

        return a.name.localeCompare(b.name);
    });

    // Clear existing options
    selector.innerHTML = '';

    if (filteredVoices.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = "No US voices found";
        selector.appendChild(opt);
        return;
    }

    // 4. Load saved URI if valid, else take the top premium option
    const savedURI = loadVoicePreference();
    if (savedURI && filteredVoices.some(v => v.voiceURI === savedURI)) {
        gameState.selectedVoiceURI = savedURI;
    } else {
        gameState.selectedVoiceURI = filteredVoices[0].voiceURI;
    }

    // 5. Populate and beautify display names
    filteredVoices.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.voiceURI;
        
        let cleanName = v.name;
        if (cleanName.includes('Google') || cleanName.includes('en-US-x-sfg')) {
            cleanName = 'Google US English (High Quality)';
        } else if (cleanName.includes('Samantha')) {
            cleanName = 'Apple Samantha (Enhanced)';
        } else if (cleanName.includes('Ava')) {
            cleanName = 'Apple Ava (Premium)';
        } else if (cleanName.includes('David')) {
            cleanName = 'Microsoft David (US)';
        } else if (cleanName.includes('Zira')) {
            cleanName = 'Microsoft Zira (US)';
        } else {
            cleanName = cleanName.replace(/english/i, '').replace(/united states/i, '').replace(/\(enhanced\)/i, 'Premium').trim();
            cleanName = `${cleanName} (US)`;
        }
        
        opt.textContent = cleanName;
        if (v.voiceURI === gameState.selectedVoiceURI) {
            opt.selected = true;
        }
        selector.appendChild(opt);
    });
}

export function initTTSState() {
    const enabled = loadTTSPreference();
    gameState.ttsEnabled = enabled;
    updateTTSButtonUI(enabled);
    console.log(`✓ TTS initialized: ${enabled ? 'ON' : 'OFF'}`);
}

export function toggleTTS() {
    const nextState = !gameState.ttsEnabled;
    gameState.ttsEnabled = nextState;
    saveTTSPreference(nextState);
    updateTTSButtonUI(nextState);
    
    if (nextState) {
        speakText("Voice enabled");
    }
}

export function updateTTSButtonUI(enabled) {
    const btn = document.getElementById('tts-toggle-btn');
    if (btn) {
        if (enabled) {
            btn.textContent = "🔊 Voice On";
            btn.classList.add('active');
        } else {
            btn.textContent = "🔇 Voice Off";
            btn.classList.remove('active');
        }
    }
}
