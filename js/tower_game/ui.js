import { speakText } from '../audio.js';

export function initTowerUI(container, onExit) {
    container.innerHTML = `
        <button id="exit-tower-btn" class="exit-button">✕ EXIT</button>
        
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

    document.getElementById('exit-tower-btn').onclick = onExit;

    // Add stars parallax
    const starsNear = document.createElement('div');
    starsNear.className = 'stars-near';
    container.appendChild(starsNear);
}

export function updateEnergyBar(energy) {
    const energyFill = document.getElementById('energy-bar-fill');
    if (energyFill) {
        energyFill.style.width = energy + '%';
        if (energy < 30) {
            energyFill.classList.add('low');
        } else {
            energyFill.classList.remove('low');
        }
    }
}

export function updateGoalDisplay(stackLength, targetStructure) {
    const goalEl = document.getElementById('current-goal');
    if (goalEl) {
        const nextNeeded = targetStructure[stackLength];
        if (nextNeeded) {
            goalEl.innerText = nextNeeded.toUpperCase() + ' Needed!';
            goalEl.className = `needed-part type-${nextNeeded}`;
        } else {
            goalEl.innerText = "COMPLETE!";
        }
    }
}

export function setMonsterState(state, speech = null) {
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

export function createBlockElement(item, x, y, onInteract) {
    const container = document.getElementById('tower-game-container');
    if (!container) return null;

    const el = document.createElement('div');
    el.className = `falling-block type-${item.type}`;
    el.innerText = `${item.text} ${item.emoji}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    // Interaction
    const interactHandler = (e) => {
        if (e.cancelable) e.preventDefault();
        onInteract(item, el);
    };

    el.onmousedown = interactHandler;
    el.ontouchstart = interactHandler;

    container.appendChild(el);
    return el;
}

export function updateBlockPosition(el, y) {
    if (el) el.style.top = y + 'px';
}

export function removeElement(el) {
    if (el) el.remove();
}

export function addStackedBlock(item) {
    const towerArea = document.getElementById('tower-area');
    if (!towerArea) return;

    const block = document.createElement('div');
    block.className = `stacked-block type-${item.type}`;
    block.innerText = `${item.text} ${item.emoji}`;
    towerArea.prepend(block);
}

export function clearTower() {
    const towerArea = document.getElementById('tower-area');
    if (towerArea) {
        towerArea.innerHTML = `
            <div id="tower-base">
                <div class="spaceship-flames"></div>
            </div>
        `;
    }
}

export function triggerBoostAnimation(onComplete) {
    const container = document.getElementById('tower-game-container');
    const towerArea = document.getElementById('tower-area');

    if (towerArea) towerArea.classList.add('boosting');
    if (container) container.classList.add('boost-mode');

    setTimeout(() => {
        if (container) container.classList.remove('boost-mode');
        if (towerArea) towerArea.classList.remove('boosting');
        if (onComplete) onComplete();
    }, 1000);
}

export function indicateWrongBlock(el) {
    if (el) {
        el.style.background = '#FF5252';
        el.style.color = 'white';
    }
}
