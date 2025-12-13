// core/Engine.js
/**
 * FRAME-BASED engine (prototype accurate)
 * Centralized reset logic + safe restart (A3)
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
const MAX_CUBE_SPEED = 3.9;
const CAMERA_BASE_Y = 6;

// Distance tuning (locked)
const DISTANCE_SCALE = 0.14;

export const Engine = {
  _loopStarted: false,
  _rafId: null,

  startGameLoop(isInitial) {
    if (this._loopStarted) return;
    this._loopStarted = true;

    const now = performance.now();

    if (!isInitial) {
      // 🔒 Centralized numeric reset
      GameState.resetRuntimeState();

      // 🔒 Reset UI state
      GameOverUI.resetForRestart();

      // 🔒 CRITICAL: reset cube world positions
      if (GameState.cubes && GameState.cubes.length) {
        for (const cube of GameState.cubes) {
          CubeSystem.spawnCube(cube);
        }
      }
    } else {
      // First start safety
      GameState.lastFrameTime = now;
      GameState.lastComboTime = now;
      GameState.cubeSpeed = INITIAL_CUBE_SPEED;
    }

    GameState.gameOver = false;
    this._rafId = requestAnimationFrame(this.animate);
  },

  animate: (now) => {
    const delta = Math.min(32, now - (GameState.lastFrameTime || now));
    GameState.lastFrameTime = now;
    const dt = delta / 16.666;

    if (GameState.gameOver) {
      Engine._loopStarted = false;
      if (Engine._rafId) {
        cancelAnimationFrame(Engine._rafId);
        Engine._rafId = null;
      }
      return;
    }

    // Score & progression
    ScoreSystem.update();

    // Player movement
    Engine.updateMovement(dt);
    Engine.updateBikeVisuals(dt);

    // World update & collision
    const hit = CubeSystem.updateAll(now);
    if (hit?.hit) {
      GameState.cubeSpeed = 0;
      GameOverUI.trigger();

      Engine._loopStarted = false;
      if (Engine._rafId) {
        cancelAnimationFrame(Engine._rafId);
        Engine._rafId = null;
      }
      return;
    }

    Engine.updateCameraAndWorld(now, dt);

    GameState.renderer?.render(GameState.scene, GameState.camera);
    Engine._rafId = requestAnimationFrame(Engine.animate);
  },

  updateMovement(dt) {
    const bike = GameState.bike;
    if (!bike) return;

    const moveStep = 1.0 * dt;
    let lean = GameState.lean || 0;

    if (GameState.moveLeft && !GameState.moveRight) {
      GameState.bikeX -= moveStep;
      lean += 0.02 * dt;
    } else if (GameState.moveRight && !GameState.moveLeft) {
      GameState.bikeX += moveStep;
      lean -= 0.02 * dt;
    }

    lean *= 0.93;
    GameState.lean = Math.max(-0.5, Math.min(0.5, lean));

    bike.position.x = GameState.bikeX;
    bike.rotation.z = GameState.lean;
  },

  updateBikeVisuals(dt) {
    GameState.wheelRot -= 0.25 * dt;

    if (GameState.rearTyre) {
      GameState.rearTyre.rotation.x = GameState.wheelRot;
    }
    if (GameState.frontTyre) {
      GameState.frontTyre.rotation.x = GameState.wheelRot * 1.1;
    }

    BikeSystem.updateRims();
    BikeSystem.updateTailLamps();
  },

  updateCameraAndWorld(now, dt) {
    const camera = GameState.camera;
    const scene = GameState.scene;
    const bike = GameState.bike;
    if (!camera || !scene || !bike) return;

    const bikeX = GameState.bikeX;
    let cubeSpeed = GameState.cubeSpeed;

    // 🔒 Authoritative distance progression
    GameState.accumulatedDistance += cubeSpeed * dt * DISTANCE_SCALE;

    const speedFactor = Math.min(2.5, cubeSpeed);
    const breathingAmp = cubeSpeed > 1.3 ? 0.18 : 0.0;

    camera.position.set(
      bikeX,
      CAMERA_BASE_Y + Math.sin(now * 0.001 * speedFactor) * breathingAmp,
      14
    );

    camera.lookAt(bike.position.x, bike.position.y + 0.4, -10);

    if (scene.fog) {
      scene.fog.density =
        FOG_BASE + GameState.accumulatedDistance * FOG_SCALE;
    }

    // Speed ramp
    cubeSpeed +=
      (0.00003 + GameState.accumulatedDistance * 0.00000012) * dt;

    GameState.cubeSpeed = Math.min(MAX_CUBE_SPEED, cubeSpeed);
  }
};
