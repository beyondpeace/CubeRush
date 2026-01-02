// HUD.js — 100% prototype-accurate UI fade logic
import { GameState } from "../core/GameState.js";

let highScore = Number(localStorage.getItem("cuberush_highscore")) || 0;
const LEADERBOARD_KEY = "cuberush_leaderboard";
const MAX_ENTRIES = 5;


function saveLeaderboard(entries) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

export function getLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem("cuberush_leaderboard")) || [];
    } catch {
        return [];
    }
}

export function renderLeaderboard(container, highlightScore = null) {
    const data = getLeaderboard();

    if (!data.length) {
        container.innerHTML = "<div class='lb-empty'>No scores yet</div>";
        return;
    }

    container.innerHTML = `
        <div class="lb-title">🏆 LEADERBOARD</div>
        ${data.map((e, i) => `
            <div class="lb-row ${highlightScore === e.score ? "highlight" : ""}">
                ${i + 1}. ${e.name} - ${e.score}
            </div>
        `).join("")}
    `;
}



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
        // --- GAME OVER LEADERBOARD UI ---
let lb = GameState.goPanel.querySelector("#gameover-leaderboard");

if (!lb) {
    lb = document.createElement("div");
    lb.id = "gameover-leaderboard";
    lb.style.marginTop = "16px";
    GameState.goPanel.appendChild(lb);
}

// Render Top 5 & highlight current score
renderLeaderboard(lb, Math.floor(GameState.score));

        const finalScore = Math.floor(GameState.score);
        if (finalScore > highScore) {
            highScore = finalScore;
            localStorage.setItem("cuberush_highscore", highScore);
        }
        // --- Leaderboard save ---
            const playerName =
                localStorage.getItem("cuberush_player_name") || "RIDER";

            let leaderboard = getLeaderboard();

            leaderboard.push({
                name: playerName,
                score: finalScore,
                date: Date.now()
            });

            // Sort high → low
            leaderboard.sort((a, b) => b.score - a.score);

            // Trim to top N
            leaderboard = leaderboard.slice(0, MAX_ENTRIES);

            saveLeaderboard(leaderboard);


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
