// LevelSystem.js — prototype-accurate level manager (restart-safe)
import { GameState } from "../core/GameState.js";

const LEVEL_THRESHOLDS = [0, 120, 320, 620, 980, 1500];

export const LevelSystem = {

  levels: [
    { name: "Level 1 - Open",    color: null,      ambient: 0x00ccff, speedTarget: 0.36, cubeCount: 550, spacing: 20 },
    { name: "Level 2 - Blue",    color: 0x00ffff,  ambient: 0x00ffee, speedTarget: 0.56, cubeCount: 650, spacing: 18 },
    { name: "Level 3 - Magenta", color: 0xff00ff,  ambient: 0xcc33ff, speedTarget: 0.84, cubeCount: 750, spacing: 16 },
    { name: "Level 4 - Orange",  color: 0xff8800,  ambient: 0xffbb66, speedTarget: 1.14, cubeCount: 850, spacing: 14 },
    { name: "Level 5 - Pink",    color: 0xff3399,  ambient: 0xff6699, speedTarget: 1.45, cubeCount: 950, spacing: 12 },
    { name: "Endless",           color: 0xffee88,  ambient: 0xffffff, speedTarget: 2.0,  cubeCount: 1100, spacing: 10 }
  ],

  idx: 0,
  targetSpeed: 0.36,
  targetColorHex: null,
  targetCount: 550,

  init() {
    this.reset();
    GameState.LevelManager = this;
  },

  reset() {
    this.idx = 0;

    const L0 = this.levels[0];
    this.targetSpeed = L0.speedTarget;
    this.targetColorHex = L0.color;
    this.targetCount = L0.cubeCount;

    if (GameState.ambient) {
      GameState.ambient.color.setHex(L0.ambient);
    }
  },

  current() {
    return this.levels[this.idx];
  },

  applyLevel(i) {
    this.idx = i;

    const L = this.current();
    this.targetSpeed = L.speedTarget;
    this.targetColorHex = L.color;
    this.targetCount = L.cubeCount;

    if (GameState.ambient) {
      GameState.ambient.color.setHex(L.ambient);
    }
  },

  update(distance) {
    // IMPORTANT: do nothing if game is already over
    if (GameState.gameOver) return;

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (distance >= LEVEL_THRESHOLDS[i]) {
        if (this.idx !== i) {
          this.applyLevel(i);
        }
        break;
      }
    }
  }
};
