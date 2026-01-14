import { TowerState, resetTowerState } from './state.js';

let animationId;
let container;

export async function initTowerGame() {
    console.log("Initializing Sentence Tower Game...");

    container = document.getElementById('tower-game-container');
    if (!container) return; // Should not happen if main.js is correct

    // Load Data based on current level
    const levelFile = `data/tower_game/level${TowerState.currentLevel}.json`;
    try {
        const res = await fetch(levelFile);
        const data = await res.json();
        TowerState.levelData = data[0]; // Just take first level
    } catch (e) {
        console.error("Failed to load tower data", e);
        return;
    }

    // Build UI
    container.innerHTML = `
        <button onclick="exitTowerGame()" class="exit-button">✕ EXIT</button>
        
        <!-- Energy Bar -->
        <div id="energy-bar-container">
            <div class="energy-label">SPACESHIP ENERGY</div>
            <div id="energy-bar-bg">
                <div id="energy-bar-fill"></div>
            </div>
        </div>
        
        <div id="goal-display">
            FEED: <span id="current-goal" class="needed-part">SUBJECT</span>
        </div>

        <div id="tower-area">
            <div id="tower-base">
                <div class="spaceship-flames"></div>
            </div>
            <!-- Stacked blocks go here -->
        </div>
        
        <!-- Nom-Nom Character -->
        <div id="monster-zone">
            <div class="speech-bubble" id="monster-speech">Hungry!</div>
            <div id="nom-nom">
                <div class="monster-mouth"></div>
            </div>
        </div>

        <!-- Falling blocks will be appended to container directly -->
    `;

    // Add third star layer for parallax
    const starsNear = document.createElement('div');
    starsNear.className = 'stars-near';
    container.appendChild(starsNear);

    resetTowerState();
    TowerState.gameActive = true;
    TowerState.lastTime = performance.now();
    TowerState.gameStartTime = performance.now();

    updateEnergyBar(); // Initialize energy bar

    // Start Loop
    animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!TowerState.gameActive) return;

    const dt = timestamp - TowerState.lastTime;
    TowerState.lastTime = timestamp;

    update(dt);

    animationId = requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Progressive speed increase over time
    const elapsedTime = performance.now() - TowerState.gameStartTime;
    const secondsElapsed = elapsedTime / 1000;
    // Increase speed by 10% every 10 seconds, max 2x
    TowerState.speedMultiplier = Math.min(2, 1 + (secondsElapsed / 100));

    const currentSpeed = TowerState.baseSpeed * TowerState.speedMultiplier;

    // Spawning
    TowerState.spawnTimer += dt;
    if (TowerState.spawnTimer > TowerState.levelData.spawnRate) {
        spawnBlock();
        TowerState.spawnTimer = 0;
    }

    // Move Blocks
    const blocks = document.querySelectorAll('.falling-block');
    blocks.forEach(el => {
        let y = parseFloat(el.getAttribute('data-y'));
        y += (currentSpeed * (dt / 16));
        el.style.top = y + 'px';
        el.setAttribute('data-y', y);

        // Cleanup if off screen
        if (y > window.innerHeight) {
            el.remove();
        }
    });

    updateGoalDisplay();
}

function spawnBlock() {
    const pool = TowerState.levelData.pool;
    const item = pool[Math.floor(Math.random() * pool.length)];

    const el = document.createElement('div');
    el.className = `falling-block type-${item.type}`;
    el.innerText = `${item.text} ${item.emoji}`;

    // Random X position
    const x = Math.random() * (window.innerWidth - 150) + 25;
    el.style.left = x + 'px';
    const startY = -60;
    el.style.top = startY + 'px';
    el.setAttribute('data-y', startY);

    // Interaction
    el.onmousedown = (e) => handleBlockClick(item, el);
    el.ontouchstart = (e) => { e.preventDefault(); handleBlockClick(item, el); }; // Better mobile support

    container.appendChild(el);
}

// Helper to animate monster
function setMonsterState(state, speech = null) {
    const monster = document.getElementById('nom-nom');
    const bubble = document.getElementById('monster-speech');
    if (!monster) return;

    monster.className = '';

    if (state === 'eating') {
        monster.classList.add('eating');
        setTimeout(() => monster.classList.remove('eating'), 500);
    } else if (state === 'angry') {
        monster.classList.add('angry');
        setTimeout(() => monster.classList.remove('angry'), 500);
    }

    if (speech) {
        bubble.innerText = speech;
        bubble.style.opacity = 1;
    }
}

// Update energy bar display
function updateEnergyBar() {
    const energyFill = document.getElementById('energy-bar-fill');
    if (energyFill) {
        energyFill.style.width = TowerState.energy + '%';
        if (TowerState.energy < 30) {
            energyFill.classList.add('low');
        } else {
            energyFill.classList.remove('low');
        }
    }
}

function handleBlockClick(item, element) {
    // Check if this matches the needed part
    const stackLength = TowerState.currentStack.length;
    const neededType = TowerState.levelData.targetStructure[stackLength];

    if (item.type === neededType) {
        // Correct match!
        addToStack(item);
        element.remove();

        setMonsterState('eating', "Yum! " + item.text);

        // Play success sound
        if (window.playSuccessSound) window.playSuccessSound();

        if (window.speakText) window.speakText(item.text);

    } else {
        // Wrong type!
        element.style.background = '#FF5252';
        element.style.color = 'white';

        // Reduce energy
        TowerState.energy = Math.max(0, TowerState.energy - 10);
        updateEnergyBar();

        setMonsterState('angry', "Yuck! I want " + neededType + "!");

        // Play failure sound
        if (window.playFailureSound) window.playFailureSound();

        setTimeout(() => element.remove(), 200);
    }
}

function addToStack(item) {
    TowerState.currentStack.push(item);

    const towerArea = document.getElementById('tower-area');
    const block = document.createElement('div');
    block.className = `stacked-block type-${item.type}`;
    block.innerText = `${item.text} ${item.emoji}`;
    towerArea.prepend(block); // Visual stack (flex-direction: column-reverse handles visual order)

    // Check if sentence complete
    if (TowerState.currentStack.length >= TowerState.levelData.targetStructure.length) {
        // VICTORY / CLEAR
        handleTowerCompletion();
    }
}

function handleTowerCompletion() {
    const sentence = TowerState.currentStack.map(i => i.text).join(' ');

    TowerState.sentencesCompleted++;
    TowerState.totalSentences++;

    // Trigger boost animation
    const container = document.getElementById('tower-game-container');
    const towerArea = document.getElementById('tower-area');

    towerArea.classList.add('boosting');
    container.classList.add('boost-mode');

    setMonsterState('eating', "DELICIOUS! 🚀");

    // Play celebration sound
    if (window.playSuccessSound) window.playSuccessSound();

    // Speak Full Sentence with TTS
    if (window.speakText) window.speakText(sentence);

    // Boost duration: 1 second with ease-in-out
    setTimeout(() => {
        container.classList.remove('boost-mode');
        towerArea.classList.remove('boosting');

        // Clear tower and reset
        towerArea.innerHTML = `
            <div id="tower-base">
                <div class="spaceship-flames"></div>
            </div>
        `;

    }, 1000);

    TowerState.currentStack = [];

    // Restore energy on completion
    TowerState.energy = Math.min(100, TowerState.energy + 20);
    updateEnergyBar();

    // Check for level progression
    if (TowerState.sentencesCompleted >= TowerState.SENTENCES_PER_LEVEL) {
        if (TowerState.currentLevel < 3) {
            // Level up!
            setTimeout(() => {
                levelUp();
            }, 2000);
        } else {
            // Game completed!
            setTimeout(() => {
                setMonsterState('eating', "YOU'RE A MASTER! 🏆");
            }, 2000);
        }
    }
}

async function levelUp() {
    TowerState.currentLevel++;
    TowerState.sentencesCompleted = 0;
    TowerState.gameStartTime = performance.now(); // Reset speed progression
    TowerState.speedMultiplier = 1;

    // Clear existing blocks
    TowerState.fallingBlocks.forEach(block => {
        if (block.element && block.element.parentNode) {
            block.element.remove();
        }
    });
    TowerState.fallingBlocks = [];

    // Load next level data
    const levelFile = `data/tower_game/level${TowerState.currentLevel}.json`;
    try {
        const res = await fetch(levelFile);
        const data = await res.json();
        TowerState.levelData = data[0];

        setMonsterState('eating', `LEVEL ${TowerState.currentLevel}! 🎉`);
        updateGoalDisplay();
    } catch (e) {
        console.error("Failed to load level", e);
    }
}

function updateGoalDisplay() {
    const goalEl = document.getElementById('current-goal');
    if (goalEl) {
        const stackLength = TowerState.currentStack.length;
        const nextNeeded = TowerState.levelData.targetStructure[stackLength];
        if (nextNeeded) {
            goalEl.innerText = nextNeeded.toUpperCase() + ' Needed!';
            goalEl.className = `needed-part type-${nextNeeded}`;
        } else {
            goalEl.innerText = "COMPLETE!";
        }
    }
}

// Window bindings
window.exitTowerGame = function () {
    TowerState.gameActive = false;
    cancelAnimationFrame(animationId);
    if (window.initLobby) window.initLobby();
    else location.reload();
}
