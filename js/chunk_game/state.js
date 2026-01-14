
export const GameState = {
    score: 0,
    combo: 0,
    level: 1,
    isGameOver: false,
    isPaused: false,
    activeDrops: [], // Array of entities
    particles: [],   // Array of visual effects
    levelData: null, // Full JSON data
    currentWave: 0,
    waveTimer: 0,    // Time spent in current wave
    spawnTimer: 0,
    gameTime: 0,
    lives: 3,
    isBriefing: false,
    isFever: false,
    mistakes: [] // Array of text
};

export function resetState() {
    GameState.score = 0;
    GameState.combo = 0;
    GameState.isGameOver = false;
    GameState.isPaused = false;
    GameState.isBriefing = false;
    GameState.isFever = false;
    GameState.activeDrops = [];
    GameState.particles = [];
    GameState.currentWave = 0;
    GameState.waveTimer = 0;
    GameState.spawnTimer = 0;
    GameState.gameTime = 0;
    GameState.lives = 3;
    GameState.mistakes = [];
}
