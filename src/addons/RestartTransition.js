import { GameState, GameStates } from "../core/GameState.js";
import { Engine } from "../core/Engine.js";
import { GameOverUI } from "../ui/GameOver.js";

export const RestartTransition = {
  el: null,
  msgEl: null,
  duration: 2500,
  _playing: false,

  init() {
    this.el = document.getElementById("restart-transition");
    this.msgEl = document.getElementById("rt-message");
  },

  play() {
  // 🔒 Prevent double-trigger
  if (this._playing) return;
  this._playing = true;

  // ✅ CAPTURE FINAL SCORE BEFORE RESET
  const finalScore = GameState.score;

  // 🔒 Lock state
  GameState.setState(GameStates.RESTART_TRANSITION);

  // 🔥 CLEAN UP GAME OVER (this resets score internally)
  GameOverUI.resetForRestart();

  // 🔥 SAFETY: restore bike visibility
  if (GameState.bike) {
    GameState.bike.visible = true;
  }

  // ✅ USE FINAL SCORE FOR MESSAGE
  this.msgEl.textContent = GameState.getRestartMessage(finalScore);
  this.el.classList.remove("hidden");

  setTimeout(() => {
    this.el.classList.add("hidden");

    // 🔥 FORCE BIKE VISIBILITY BEFORE GAME STARTS
    if (GameState.bike) {
      GameState.bike.visible = true;
    }

    // 🔥 ACTUAL RESTART (ONCE)
    Engine.startGameLoop(false);
    GameState.setState(GameStates.PLAYING);

    this._playing = false;
  }, this.duration);
}

};
