// HUD.js — 100% prototype-accurate UI fade logic
import { GameState } from "../core/GameState.js";
let highScore = Number(localStorage.getItem("cuberush_highscore")) || 0;

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
        HUD.deltaDisplay = document.createElement("div");
        HUD.deltaDisplay.id = "deltaDisplay";
        document.body.appendChild(HUD.deltaDisplay);

    },

    updateScore() {
        const score = Math.floor(GameState.score);

        if (GameState.scoreDisplay) {
            GameState.scoreDisplay.innerText = "Score: " + score;
        }

        if (score >= highScore) {
            HUD.deltaDisplay.innerText = "NEW HIGH SCORE!";
            HUD.deltaDisplay.classList.add("new-high");
        } else {
            HUD.deltaDisplay.innerText = "To Beat: " + (highScore - score);
            HUD.deltaDisplay.classList.remove("new-high");
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
        const finalScore = Math.floor(GameState.score);
        if (finalScore > highScore) {
            highScore = finalScore;
            localStorage.setItem("cuberush_highscore", highScore);
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
