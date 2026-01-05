// core/Engine.js
/**
 * FRAME-BASED engine (prototype accurate)
 * Correct collision ordering + restart determinism
 * FPS-compensated for battery / throttled devices
 */

import { GameState } from "./GameState.js";
import { BikeSystem } from "../systems/BikeSystem.js";
import { CubeSystem } from "../systems/CubeSystem.js";
import { ScoreSystem } from "../systems/ScoreSystem.js";
import { GameOverUI } from "../ui/GameOver.js";
import { resetGrid } from "./Scene.js"; // ✅ ADD THIS
import { HUD } from "../ui/HUD.js";


const INITIAL_CUBE_SPEED = 0.32;
const FOG_BASE = 0.0006;
const FOG_SCALE = 0.0000009;
const MAX_CUBE_SPEED = 3.9;
const CAMERA_BASE_Y = 6;
const DISTANCE_SCALE = 0.14;

export const Engine = {
  _loopStarted: false,
  _rafId: null,

  startGameLoop(isInitial) {
    if (this._loopStarted) return;
    this._loopStarted = true;

    const now = performance.now();

    if (!isInitial) {
      // 1. Reset level progression FIRST
      if (GameState.LevelManager?.reset) {
        GameState.LevelManager.reset();
      }

      // 2. Reset numeric runtime state
      GameState.resetRuntimeState();

      // 3. Reset UI
      GameOverUI.resetForRestart();

      // ✅ 4. RESET GRID VISUAL STATE
      resetGrid();

      // 5. Respawn cubes using level 1 state
      if (GameState.cubes?.length) {
        for (const cube of GameState.cubes) {
          CubeSystem.spawnCube(cube);
        }
      }
    } else {
      GameState.lastFrameTime = now;
      GameState.lastComboTime = now;
      GameState.cubeSpeed = INITIAL_CUBE_SPEED;
    }

    GameState.gameOver = false;
    this._rafId = requestAnimationFrame(this.animate);
  },

  animate: (now) => {
    if (GameState.getState() === "restart_transition") {
  GameState.renderer?.render(GameState.scene, GameState.camera);
  Engine._rafId = requestAnimationFrame(Engine.animate);
  return;
}
    const delta = Math.min(32, now - (GameState.lastFrameTime || now));
    GameState.lastFrameTime = now;

    let dt = delta / 16.666;
    
    // FPS compensation
    const fps = 1000 / delta;
    if (fps < 50) {
      dt *= 50 / fps;
    }
    // Normalize slow Safari / Mac frames
    dt = Math.min(dt, 1.25);

    if (GameState.gameOver) {
      Engine._loopStarted = false;
      if (Engine._rafId) {
        cancelAnimationFrame(Engine._rafId);
        Engine._rafId = null;
      }
      return;
    }

    Engine.updateMovement(dt);
    Engine.updateBikeVisuals(dt);

    const hit = CubeSystem.updateAll(now);
    if (hit?.hit) {
      GameState.gameOver = true;
      GameState.cubeSpeed = 0;
      GameOverUI.trigger();

      Engine._loopStarted = false;
      if (Engine._rafId) {
        cancelAnimationFrame(Engine._rafId);
        Engine._rafId = null;
      }
      return;
    }

    ScoreSystem.update();
    HUD.updateScore(); 
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
    if (GameState.rearTyre) GameState.rearTyre.rotation.x = GameState.wheelRot;
    if (GameState.frontTyre) GameState.frontTyre.rotation.x = GameState.wheelRot * 1.1;

    BikeSystem.updateRims();
    BikeSystem.updateTailLamps();
  },

  updateCameraAndWorld(now, dt) {
    const camera = GameState.camera;
    const scene = GameState.scene;
    const bike = GameState.bike;
    if (!camera || !scene || !bike) return;

    let cubeSpeed = GameState.cubeSpeed;

    GameState.accumulatedDistance += cubeSpeed * dt * DISTANCE_SCALE;

    const speedFactor = Math.min(2.5, cubeSpeed);
    const breathingAmp = cubeSpeed > 1.3 ? 0.18 : 0.0;

    camera.position.set(
      GameState.bikeX,
      CAMERA_BASE_Y + Math.sin(now * 0.001 * speedFactor) * breathingAmp,
      14
    );

    camera.lookAt(bike.position.x, bike.position.y + 0.4, -10);

    if (scene.fog) {
      scene.fog.density =
        FOG_BASE + GameState.accumulatedDistance * FOG_SCALE;
    }

    cubeSpeed +=
      (0.00003 + GameState.accumulatedDistance * 0.00000012) * dt;

    GameState.cubeSpeed = Math.min(MAX_CUBE_SPEED, cubeSpeed);
  }
};
