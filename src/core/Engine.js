// core/Engine.js
/**
 * 🚨 PRODUCTION BASE LOCK 🚨
 * FRAME-BASED engine (prototype accurate)
 * Locked on: 2025-12-13
 */

import { GameState } from "./GameState.js";
import { BikeSystem } from "../systems/BikeSystem.js";
import { CubeSystem } from "../systems/CubeSystem.js";
import { ScoreSystem } from "../systems/ScoreSystem.js";
import { GameOverUI } from "../ui/GameOver.js";

// --- Core constants ---
const INITIAL_CUBE_SPEED = 0.32;
const FOG_BASE = 0.0006;
const FOG_SCALE = 0.0000009;
const SHAKE_DECAY = 0.55;
const MAX_CUBE_SPEED = 3.9;
const CAMERA_BASE_Y = 6;

let engineLoopStarted = false;

export const Engine = {

  startGameLoop(isInitial) {
    if (engineLoopStarted) return;
    engineLoopStarted = true;

    if (!isInitial) {
      this.restartState();
    } else {
      GameState.cubeSpeed ??= INITIAL_CUBE_SPEED;
      GameState.accumulatedDistance ??= 0;
      GameState.score ??= 0;
      GameState.comboCount ??= 0;
      GameState.multiplier ??= 1;
      GameState.bikeX ??= 0;
      GameState.lastComboTime ??= performance.now();
      GameState.lean ??= 0;
      GameState.wheelRot ??= 0;
      GameState.cameraShake ??= 0;
      GameState.cameraShakeX ??= 0;
    }

    GameState.gameOver = false;
    requestAnimationFrame(this.animate);
  },

  restartState() {
    GameOverUI.resetForRestart();
    const now = performance.now();

    Object.assign(GameState, {
      cubeSpeed: INITIAL_CUBE_SPEED,
      score: 0,
      comboCount: 0,
      multiplier: 1,
      bikeX: 0,
      gameOver: false,
      accumulatedDistance: 0,
      lastFrameTime: now,
      lastComboTime: now,
      lean: 0,
      wheelRot: 0,
      cameraShake: 0,
      cameraShakeX: 0
    });

    if (GameState.scoreDisplay) {
      GameState.scoreDisplay.textContent = "Score: 0";
    }

    if (GameState.bike) {
      GameState.bike.visible = true;
      GameState.bike.position.set(0, 1.2, 1.6);
      GameState.bike.rotation.set(0, 0, 0);
    }

    if (GameState.cubes?.length) {
      for (const c of GameState.cubes) CubeSystem.spawnCube(c);
    }
  },

  animate(now) {
    if (GameState.gameOver) {
      engineLoopStarted = false;
      return;
    }

    ScoreSystem.update(now);
    Engine.updateMovement();
    Engine.updateBikeVisuals();

    const hit = CubeSystem.updateAll(now);
    if (hit?.hit) {
      GameState.cubeSpeed = 0;
      GameOverUI.trigger();
      engineLoopStarted = false;
      return;
    }

    Engine.updateCameraAndWorld(now);

    GameState.renderer?.render(GameState.scene, GameState.camera);
    requestAnimationFrame(Engine.animate);
  },

  updateMovement() {
    const bike = GameState.bike;
    if (!bike) return;

    const moveStep = 1.0;
    let lean = GameState.lean;

    if (GameState.moveLeft && !GameState.moveRight) {
      GameState.bikeX -= moveStep;
      lean += 0.02;
    } else if (GameState.moveRight && !GameState.moveLeft) {
      GameState.bikeX += moveStep;
      lean -= 0.02;
    }

    lean *= 0.93;
    GameState.lean = Math.max(-0.5, Math.min(0.5, lean));

    bike.position.x = GameState.bikeX;
    bike.rotation.z = GameState.lean;
  },

  updateBikeVisuals() {
    GameState.wheelRot -= 0.25;
    GameState.rearTyre && (GameState.rearTyre.rotation.x = GameState.wheelRot);
    GameState.frontTyre && (GameState.frontTyre.rotation.x = GameState.wheelRot * 1.1);
    BikeSystem.updateRims();
    BikeSystem.updateTailLamps();
  },

  updateCameraAndWorld(now) {
    const camera = GameState.camera;
    const scene = GameState.scene;
    const bike = GameState.bike;
    if (!camera || !scene || !bike) return;

    const bikeX = GameState.bikeX;
    const accumulatedDistance = GameState.accumulatedDistance;
    let cubeSpeed = GameState.cubeSpeed;

    const speedFactor = Math.min(2.5, cubeSpeed);
    const breathingAmp = cubeSpeed > 1.3 ? 0.18 : 0.0;

    camera.position.set(
      bikeX,
      CAMERA_BASE_Y + Math.sin(now * 0.001 * speedFactor) * breathingAmp,
      14
    );

    camera.lookAt(bike.position.x, bike.position.y + 0.4, -10);

    if (scene.fog) {
      scene.fog.density = FOG_BASE + accumulatedDistance * FOG_SCALE;
    }

    cubeSpeed += 0.00003 + accumulatedDistance * 0.00000012;
    GameState.cubeSpeed = Math.min(MAX_CUBE_SPEED, cubeSpeed);
  }
};
