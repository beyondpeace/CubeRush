// GameOver.js — Prototype-accurate game over handling
import { GameState } from "../core/GameState.js";
import { HUD } from "./HUD.js";
import { clearMovement } from "../core/Input.js";

export const GameOverUI = {

    trigger() {
        // BLOCK all input
        GameState.moveLeft = false;
        GameState.moveRight = false;
        clearMovement();

        // Stop gameplay
        GameState.gameOver = true;

        // Hide bike (prototype behavior)
        if (GameState.bike) {
            GameState.bike.visible = false;
        }

        // Fade overlay (prototype-like effect)
        const fadeOverlay = document.getElementById("fadeOverlay");
        if (fadeOverlay) {
            fadeOverlay.style.transition = "opacity 0.8s ease";
            fadeOverlay.style.opacity = 1;
        }

        // Show GAME OVER UI
        HUD.showGameOver();
    },

    resetForRestart() {
        // Reset core flags
        GameState.gameOver = false;
        GameState.score = 0;
        GameState.accumulatedDistance = 0;
        GameState.comboCount = 0;
        GameState.multiplier = 1;
        GameState.cameraShake = 0;
        GameState.cameraShakeX = 0;

        // Restore bike
        if (GameState.bike) {
            GameState.bike.visible = false;
            GameState.bike.position.set(0, 1.2, 1.6);
            GameState.bike.rotation.set(0, 0, 0);
        }

        // Hide fade overlay immediately
        const fadeOverlay = document.getElementById("fadeOverlay");
        if (fadeOverlay) {
            fadeOverlay.style.transition = "opacity 0.8s ease";
            fadeOverlay.style.opacity = 0;
        }

        // Hide GAME OVER UI
        HUD.hideGameOver();
    }
};
