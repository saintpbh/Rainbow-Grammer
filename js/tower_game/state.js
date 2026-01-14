export const TowerState = {
    score: 0,
    combo: 0,
    currentLevel: 1,          // Track current level (1, 2, or 3)
    sentencesCompleted: 0,    // Count completed sentences in current level
    totalSentences: 0,        // Total sentences across all levels
    SENTENCES_PER_LEVEL: 5,   // Complete 5 sentences to advance to next level
    currentStack: [], // The sentence being built e.g. [{text:"I", type:"subject"}]
    targetStructure: ["subject", "verb", "object"], // The goal structure
    gameActive: false,
    fallingBlocks: [],
    levelData: null,
    spawnTimer: 0,
    lastTime: 0,
    lastActionTime: 0,
    energy: 100,              // Energy level (0-100)
    baseSpeed: 2,             // Base falling speed (slower than before)
    speedMultiplier: 1,       // Multiplier that increases over time
    gameStartTime: 0          // Track when current level started
};

export function resetTowerState() {
    TowerState.score = 0;
    TowerState.combo = 0;
    TowerState.currentLevel = 1;
    TowerState.sentencesCompleted = 0;
    TowerState.totalSentences = 0;
    TowerState.currentStack = [];
    TowerState.fallingBlocks = [];
    TowerState.gameActive = false;
    TowerState.spawnTimer = 0;
    TowerState.lastActionTime = 0;
    TowerState.energy = 100;
    TowerState.baseSpeed = 2;
    TowerState.speedMultiplier = 1;
    TowerState.gameStartTime = 0;
}
