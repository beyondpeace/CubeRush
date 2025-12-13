// src/ui/Splash.js — Robust, prototype-accurate startup (SAFE LOCKED VERSION)
import { GameState } from "../core/GameState.js";
import { initScene } from "../core/Scene.js";
import { initInput } from "../core/Input.js";
import { LevelSystem } from "../systems/LevelSystem.js";
import { HUD } from "./HUD.js";
import { Engine } from "../core/Engine.js";

export const Splash = {
  splashEl: null,
  logoEl: null,

  SPLASH_PREDELAY: 600,
  SPLASH_DURATION: 1800,
  SPLASH_FADE: 400,

  // 🔒 lifecycle guards
  _isPlaying: false,
  _hasStarted: false,

  initDOM() {
    this.splashEl = document.getElementById("splash");
    this.logoEl = document.getElementById("logo");

    if (!this.splashEl) {
      console.warn("Splash.initDOM: #splash not found");
      this.splashEl = { style: {} };
    }
    if (!this.logoEl) {
      console.warn("Splash.initDOM: #logo not found");
      this.logoEl = { style: {}, offsetWidth: 0 };
    }
  },

  play(isRestart = false) {
    // 🔒 Absolute guards
    if (this._isPlaying) return;
    if (this._hasStarted && !isRestart) return;

    this._isPlaying = true;

    if (!this.splashEl || !this.logoEl) this.initDOM();

    GameState.splashActive = true;

    const splash = this.splashEl;
    const logo = this.logoEl;

    // On restart, hide game over panels first
    if (isRestart) {
      const goPanel = document.getElementById("gameover");
      const fadeOverlay = document.getElementById("fadeOverlay");
      if (goPanel) goPanel.style.opacity = 0;
      if (fadeOverlay) fadeOverlay.style.opacity = 0;
    }

    // Show splash
    try {
      splash.style.display = "flex";
      splash.style.opacity = 1;
    } catch (e) {
      console.warn("Splash.play: splash DOM issue", e);
    }

    // Restart logo animation (prototype parity)
    try {
      logo.style.animation = "none";
      void logo.offsetWidth;
      logo.style.animation = `fillLogo ${this.SPLASH_DURATION}ms linear forwards`;
    } catch (e) {
      console.warn("Splash.play: logo animation issue", e);
    }

    // Fade out after reveal
    setTimeout(() => {
      try {
        splash.style.transition = `opacity ${this.SPLASH_FADE}ms ease`;
        splash.style.opacity = 0;
      } catch (e) {
        console.warn("Splash.play: fade issue", e);
      }

      setTimeout(() => {
        try {
          splash.style.display = "none";
          splash.style.transition = "";
        } catch (e) { /* ignore */ }

        if (!isRestart) {
          this.firstStart();
        } else {
          this.restartGame();
        }
      }, this.SPLASH_FADE);

    }, this.SPLASH_DURATION);
  },

  firstStart() {
    // 🔒 Mark game as started forever (page lifetime)
    this._hasStarted = true;

    // SAFE START ORDER (do not change)
    try { initInput(); } 
    catch (e) { console.error("Splash.firstStart: initInput failed", e); }

    try {
      if (typeof LevelSystem.init === "function") {
        LevelSystem.init();
      }
    } catch (e) {
      console.error("Splash.firstStart: LevelSystem.init failed", e);
    }

    try { initScene(); } 
    catch (e) { console.error("Splash.firstStart: initScene failed", e); }

    try { HUD.init(); } 
    catch (e) { console.error("Splash.firstStart: HUD.init failed", e); }

    try {
      Engine.startGameLoop(true);
    } catch (e) {
      console.error("Splash.firstStart: Engine.startGameLoop failed", e);
    }

    // 🔒 Release splash lock on next frame (engine-safe)
    requestAnimationFrame(() => {
      GameState.splashActive = false;
      this._isPlaying = false;
    });
  },

  restartGame() {
    try {
      Engine.startGameLoop(false);
    } catch (e) {
      console.error("Splash.restartGame: Engine.startGameLoop failed", e);
    }

    requestAnimationFrame(() => {
      GameState.splashActive = false;
      this._isPlaying = false;
    });
  }
};

// Controlled global access (kept for prototype parity)
window.playSplash = function (isRestart = false) {
  Splash.play(isRestart);
};

// Auto-start splash exactly ONCE per page load
let splashBooted = false;

window.addEventListener("load", () => {
  if (splashBooted) return;
  splashBooted = true;

  setTimeout(() => {
    Splash.play(false);
  }, Splash.SPLASH_PREDELAY);
});
