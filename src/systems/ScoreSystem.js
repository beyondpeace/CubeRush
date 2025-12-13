// ScoreSystem.js — prototype-accurate scoring (engine-driven timing)
import { GameState } from '../core/GameState.js';

export const ScoreSystem = {
    update() {
        // Engine already updates accumulatedDistance
        const distance = GameState.accumulatedDistance || 0;

        // Prototype scoring curve
        GameState.score = distance * 0.85;

        if (GameState.scoreDisplay) {
            GameState.scoreDisplay.textContent =
                "Score: " + Math.floor(GameState.score);
        }

        // Level manager update
        if (GameState.LevelManager && GameState.LevelManager.update) {
            GameState.LevelManager.update(distance);
        }
    }
};
