// src/ui/Splash.js — Robust, prototype-accurate startup (replace your file)
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

  // guard to prevent re-entrancy
  _isPlaying: false,

  initDOM() {
    this.splashEl = document.getElementById("splash");
    this.logoEl = document.getElementById("logo");

    // defensive fallbacks
    if (!this.splashEl) {
      console.warn("Splash.initDOM: #splash not found");
      this.splashEl = { style: {} };
    }
    if (!this.logoEl) {
      console.warn("Splash.initDOM: #logo not found");
      this.logoEl = { style: {} , offsetWidth: 0};
    }
  },

  play(isRestart = false) {
    if (this._isPlaying) return; // PROTOTYPE: do not re-run splash while already playing
    this._isPlaying = true;

    if (!this.splashEl || !this.logoEl) this.initDOM();

    // Block input while splash is active
    GameState.splashActive = true;

    const splash = this.splashEl;
    const logo = this.logoEl;

    // When restarting, hide gameover and overlay first (prototype behaviour)
    if (isRestart) {
      const goPanel = document.getElementById("gameover");
      const fadeOverlay = document.getElementById("fadeOverlay");
      if (goPanel) goPanel.style.opacity = 0;
      if (fadeOverlay) fadeOverlay.style.opacity = 0;
    }

    // show splash
    try {
      splash.style.display = "flex";
      splash.style.opacity = 1;
    } catch (e) {
      // defensive in case DOM is missing
      console.warn("Splash.play: could not show splash DOM", e);
    }

    // restart animation exactly like prototype
    try {
      logo.style.animation = "none";
      void logo.offsetWidth;
      logo.style.animation = `fillLogo ${this.SPLASH_DURATION}ms linear forwards`;
    } catch (e) {
      console.warn("Splash.play: logo animation issue", e);
    }

    // schedule fade out after reveal
    setTimeout(() => {
      try {
        splash.style.transition = `opacity ${this.SPLASH_FADE}ms ease`;
        splash.style.opacity = 0;
      } catch (e) {
        console.warn("Splash.play: fade out issue", e);
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
    // CORRECT SAFE STARTUP ORDER:
    // 1) Input (sets key flags so UI/scene can safely bind)
    // 2) LevelSystem.init() (must be ready before cubes spawn)
    // 3) Scene (spawns cubes using level info)
    // 4) HUD (requires scene/UI elements present)
    // 5) Engine.startGameLoop()

    try {
      initInput();
    } catch (e) {
      console.error("Splash.firstStart: initInput() failed", e);
    }

    try {
      if (typeof LevelSystem.init === "function") {
        LevelSystem.init();
      } else {
        console.warn("LevelSystem.init() not found or not a function");
      }
    } catch (e) {
      console.error("Splash.firstStart: LevelSystem.init() failed", e);
    }

    try {
      initScene();
    } catch (e) {
      console.error("Splash.firstStart: initScene() failed", e);
    }

    try {
      HUD.init();
    } catch (e) {
      console.error("Splash.firstStart: HUD.init() failed", e);
    }

    try {
      // true -> firstStart indicates a fresh start
      Engine.startGameLoop(true);
    } catch (e) {
      console.error("Splash.firstStart: Engine.startGameLoop() failed", e);
    }

    // allow input a moment after fade
    setTimeout(() => {
      GameState.splashActive = false;
      this._isPlaying = false;
    }, 120);
  },

  restartGame() {
    try {
      // false -> restart flow (Engine should not re-initialize some singletons)
      Engine.startGameLoop(false);
    } catch (e) {
      console.error("Splash.restartGame: Engine.startGameLoop failed", e);
    }

    setTimeout(() => {
      GameState.splashActive = false;
      this._isPlaying = false;
    }, 120);
  }
};

// global quick-access (keeps parity with prototype)
window.playSplash = function (isRestart = false) {
  Splash.play(isRestart);
};

// auto-start splash on page load (same timings as prototype)
window.addEventListener("load", () => {
  setTimeout(() => {
    Splash.play(false);
  }, Splash.SPLASH_PREDELAY);
});
