import { TowerState, resetTowerState } from './state.js';
import * as UI from './ui.js';
import { speakText, playSuccessSound, playFailureSound } from '../audio.js';

let animationId;

export async function initTowerGame() {
    console.log("Initializing Sentence Tower Game...");

    const container = document.getElementById('tower-game-container');
    if (!container) return;

    // Initialize UI
    UI.initTowerUI(container, exitTowerGame);

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

    resetTowerState();
    TowerState.gameActive = true;
    TowerState.lastTime = performance.now();
    TowerState.gameStartTime = performance.now();

    UI.updateEnergyBar(TowerState.energy);
    UI.updateGoalDisplay(0, TowerState.levelData.targetStructure);

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

    // Move Blocks (State-driven)
    TowerState.fallingBlocks.forEach(block => {
        block.y += (currentSpeed * block.speedVariation * (dt / 16));

        // Sync Visuals
        UI.updateBlockPosition(block.element, block.y);

        // Cleanup if off screen
        if (block.y > window.innerHeight) {
            block.markedForDeletion = true;
        }
    });

    // Cleanup Deletion Queue
    TowerState.fallingBlocks = TowerState.fallingBlocks.filter(block => {
        if (block.markedForDeletion) {
            UI.removeElement(block.element);
            return false;
        }
        return true;
    });
}

function spawnBlock() {
    const pool = TowerState.levelData.pool;
    const item = pool[Math.floor(Math.random() * pool.length)];

    const x = Math.random() * (window.innerWidth - 150) + 25;
    const startY = -60;
    const speedVariation = 0.7 + Math.random() * 0.6;

    // Create State Object
    const block = {
        item: item,
        x: x,
        y: startY,
        speedVariation: speedVariation,
        element: null, // Filled by UI
        markedForDeletion: false
    };

    // Create Visual Element
    block.element = UI.createBlockElement(item, x, startY, (clickedItem, el) => {
        handleBlockInteraction(block, clickedItem, el);
    });

    TowerState.fallingBlocks.push(block);
}

function handleBlockInteraction(blockObject, item, element) {
    // Check if this matches the needed part
    const stackLength = TowerState.currentStack.length;
    const neededType = TowerState.levelData.targetStructure[stackLength];

    if (item.type === neededType) {
        // Correct match!
        addToStack(item);

        // Mark for removal from falling list
        blockObject.markedForDeletion = true; // Loop will clean it up next frame? 
        // Actually interaction removes imediately usually
        UI.removeElement(element);

        // We also need to remove it from `fallingBlocks` array properly to avoid errors if loop runs
        // Filter will handle markedForDeletion in next update, but we want instant removal visually (done above)
        // Let's force mark it
        blockObject.markedForDeletion = true;

        UI.setMonsterState('eating', "Yum! " + item.text);
        playSuccessSound();
        speakText(item.text);

    } else {
        // Wrong type!
        UI.indicateWrongBlock(element);

        // Reduce energy
        TowerState.energy = Math.max(0, TowerState.energy - 10);
        UI.updateEnergyBar(TowerState.energy);

        UI.setMonsterState('angry', "Yuck! I want " + neededType + "!");
        playFailureSound();

        setTimeout(() => {
            blockObject.markedForDeletion = true;
            // element removal handled by loop or here? 
            // Loop handles it if marked, but loop runs on frame.
            // Let's rely on loop cleanup or explicit remove if we want it gone now.
            // Previous logic kept it for 200ms then removed.
        }, 200);
    }
}

function addToStack(item) {
    TowerState.currentStack.push(item);
    UI.addStackedBlock(item);
    UI.updateGoalDisplay(TowerState.currentStack.length, TowerState.levelData.targetStructure);

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

    UI.setMonsterState('eating', "DELICIOUS! 🚀");
    playSuccessSound();

    // Speak Full Sentence with TTS
    console.log('🎉 Sentence completed:', sentence);
    speakText(sentence);

    // Trigger boost animation
    UI.triggerBoostAnimation(() => {
        // Callback after animation (1s)

        // Reset Visuals
        UI.clearTower();

        // IMPORTANT: Reset stack and update goal display to continue game
        TowerState.currentStack = [];
        UI.updateGoalDisplay(0, TowerState.levelData.targetStructure);

        // Restore energy on completion
        TowerState.energy = Math.min(100, TowerState.energy + 20);
        UI.updateEnergyBar(TowerState.energy);

        // Check for level progression
        if (TowerState.sentencesCompleted >= TowerState.SENTENCES_PER_LEVEL) {
            if (TowerState.currentLevel < 3) {
                // Level up!
                setTimeout(() => {
                    levelUp();
                }, 500);
            } else {
                // Game completed!
                UI.setMonsterState('eating', "YOU'RE A MASTER! 🏆");
            }
        } else {
            // Continue with next sentence
            UI.setMonsterState('eating', `${TowerState.sentencesCompleted}/${TowerState.SENTENCES_PER_LEVEL} Complete! Keep going! 🎯`);
        }
    });
}

async function levelUp() {
    TowerState.currentLevel++;
    TowerState.sentencesCompleted = 0;
    TowerState.gameStartTime = performance.now(); // Reset speed progression
    TowerState.speedMultiplier = 1;

    // Clear existing blocks
    TowerState.fallingBlocks.forEach(block => {
        UI.removeElement(block.element);
    });
    TowerState.fallingBlocks = [];

    // Load next level data
    const levelFile = `data/tower_game/level${TowerState.currentLevel}.json`;
    try {
        const res = await fetch(levelFile);
        const data = await res.json();
        TowerState.levelData = data[0];

        UI.setMonsterState('eating', `LEVEL ${TowerState.currentLevel}! 🎉`);
        UI.updateGoalDisplay(0, TowerState.levelData.targetStructure);
    } catch (e) {
        console.error("Failed to load level", e);
    }
}

// Window bindings (for Main.js compatibility if needed, though Main.js calls initTowerGame)
window.exitTowerGame = function () {
    TowerState.gameActive = false;
    cancelAnimationFrame(animationId);
    if (window.initLobby) window.initLobby();
    else location.reload();
}
