
export const GameState = {
  scene: null,
  camera: null,
  renderer: null,
  gridHelper: null,
  ambient: null,

  bike: null,
  rearTyre: null,
  frontTyre: null,
  rimRearLeft: null,
  rimRearRight: null,
  rimFrontLeft: null,
  rimFrontRight: null,
  tailLeft: null,
  tailRight: null,

  cubes: [],
  cubeGeom: null,
  cubeSpeed: 0.32,

  score: 0,
  gameOver: false,
  bikeX: 0,
  moveLeft: false,
  moveRight: false,
  lastFrameTime: performance.now(),
  accumulatedDistance: 0,
  comboCount: 0,
  multiplier: 1,
  lastComboTime: performance.now(),

  cameraShake: 0,
  cameraShakeX: 0,

  scoreDisplay: null,
  fadeOverlay: null,
  goPanel: null,
  goScore: null,

  splashActive: true,

  LevelManager: null
};
