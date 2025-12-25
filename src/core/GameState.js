// src/core/GameState.js
// Centralized game state + authoritative reset contract

// 🔒 Phase 1 – Game flow states (non-invasive)
export const GameStates = {
  BOOT: "BOOT",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER"
};

export const GameState = {

    // --- Game flow ---
  state: GameStates.BOOT,

  setState(next) {
    if (this.state === next) return;
    console.log(`[GameState] ${this.state} → ${next}`);
    this.state = next;
  },

  getState() {
    return this.state;
  },
  // --- Three.js core ---
  scene: null,
  camera: null,
  renderer: null,
  gridHelper: null,
  ambient: null,

  // --- Bike & visuals ---
  bike: null,
  rearTyre: null,
  frontTyre: null,
  rimRearLeft: null,
  rimRearRight: null,
  rimFrontLeft: null,
  rimFrontRight: null,
  tailLeft: null,
  tailRight: null,

  // --- Cubes ---
  cubes: [],
  cubeGeom: null,
  cubeSpeed: 0.32,

  // --- Gameplay state ---
  score: 0,
  gameOver: false,
  bikeX: 0,
  moveLeft: false,
  moveRight: false,

  lastFrameTime: 0,
  accumulatedDistance: 0,
  comboCount: 0,
  multiplier: 1,
  lastComboTime: 0,

  // --- Camera effects ---
  cameraShake: 0,
  cameraShakeX: 0,

  // --- UI references ---
  scoreDisplay: null,
  fadeOverlay: null,
  goPanel: null,
  goScore: null,

  // --- Global flags ---
  splashActive: true,

  // --- External systems ---
  LevelManager: null,

  /**
   * 🔒 Authoritative runtime reset
   * Called on every restart (NOT on first init)
   * Must NOT recreate scene, renderer, input, or DOM
   */
  resetRuntimeState() {
    const now = performance.now();

    // Gameplay
    this.score = 0;
    this.gameOver = false;
    this.bikeX = 0;
    this.accumulatedDistance = 0;
    this.cubeSpeed = 0.32;

    // Combo / multiplier
    this.comboCount = 0;
    this.multiplier = 1;
    this.lastComboTime = now;

    // Timing
    this.lastFrameTime = now;

    // Camera effects
    this.cameraShake = 0;
    this.cameraShakeX = 0;

    // Input flags
    this.moveLeft = false;
    this.moveRight = false;

    // Bike transform safety
    if (this.bike) {
      this.bike.visible = true;
      this.bike.position.set(0, 1.2, 1.6);
      this.bike.rotation.set(0, 0, 0);
    }

    // UI safety
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = "Score: 0";
    }
  }
};
