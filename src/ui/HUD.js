// HUD.js — 100% prototype-accurate UI fade logic
import { GameState } from "../core/GameState.js";

export const HUD = {

    init() {
        GameState.scoreDisplay = document.getElementById("scoreDisplay");
        GameState.fadeOverlay  = document.getElementById("fadeOverlay");
        GameState.goPanel      = document.getElementById("gameover");
        GameState.goScore      = document.getElementById("go-score");

        // PROTOTYPE BEHAVIOR:
        // gameover panel stays in DOM, opacity=0 (not display:none)
        if (GameState.goPanel) {
            GameState.goPanel.style.opacity = 0;
            GameState.goPanel.style.display = "flex";
            GameState.goPanel.style.transition = "opacity 0.6s ease";
        }

        if (GameState.fadeOverlay) {
            GameState.fadeOverlay.style.opacity = 0;
            GameState.fadeOverlay.style.transition = "opacity 0.8s ease";
        }
    },

    updateScore() {
        if (GameState.scoreDisplay) {
            GameState.scoreDisplay.innerText =
                "Score: " + Math.floor(GameState.score);
        }
    },

    showGameOver() {
        if (GameState.fadeOverlay) {
            GameState.fadeOverlay.style.opacity = 1;
        }

        if (GameState.goPanel) {
            GameState.goPanel.style.opacity = 1;   // fade-in with CSS transition
        }

        if (GameState.goScore) {
            GameState.goScore.innerText = "Score: " + Math.floor(GameState.score);
        }
    },

    hideGameOver() {
        if (GameState.fadeOverlay) {
            GameState.fadeOverlay.style.opacity = 0;
        }

        if (GameState.goPanel) {
            GameState.goPanel.style.opacity = 0;  // fade-out only
        }
    }
};
