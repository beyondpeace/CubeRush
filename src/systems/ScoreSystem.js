// ScoreSystem.js — prototype-accurate scoring & distance
import { GameState } from '../core/GameState.js';

const DISTANCE_SCALE = 10.0;

export const ScoreSystem = {
    update(now) {
        if (GameState.lastFrameTime == null) {
            GameState.lastFrameTime = now;
        }

        const dtSec = (now - GameState.lastFrameTime) / 1000;
        GameState.lastFrameTime = now;
        if (dtSec <= 0) return;

        // Distance & score exactly like prototype
        const d = GameState.cubeSpeed * DISTANCE_SCALE * dtSec;
        GameState.accumulatedDistance += d;

        GameState.score = GameState.accumulatedDistance * 0.85;

        if (GameState.scoreDisplay) {
            GameState.scoreDisplay.textContent =
                "Score: " + Math.floor(GameState.score);
        }

        // Level manager update
        if (GameState.LevelManager && GameState.LevelManager.update) {
            GameState.LevelManager.update(GameState.accumulatedDistance);
        }
    }
};
