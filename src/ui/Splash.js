// src/ui/Splash.js
// 🚨 PRODUCTION BASE LOCK 🚨
// Splash → Start Screen → Gameplay / Restart-safe

import { GameState } from "../core/GameState.js";
import { initScene } from "../core/Scene.js";
import { initInput } from "../core/Input.js";
import { LevelSystem } from "../systems/LevelSystem.js";
import { HUD } from "./HUD.js";
import { Engine } from "../core/Engine.js";
import { StartScreen } from "../addons/StartScreen.js";
import { HowToPlay } from "../addons/HowToPlay.js";
import { playTransition } from "../ui/Transition.js"; // ✅ NEW (ONLY ADDITION)

export const Splash = {
  splashEl: null,
  logoEl: null,

  SPLASH_PREDELAY: 600,
  SPLASH_DURATION: 1800,
  SPLASH_FADE: 400,

  // 🔒 lifecycle guards
  _isPlaying: false,
  _hasStarted: false,

  /* =========================
     DOM INIT
  ========================= */
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

  /* =========================
     PLAY SPLASH
  ========================= */
  play(isRestart = false) {
    if (this._isPlaying) return;
    if (this._hasStarted && !isRestart) return;

    this._isPlaying = true;
    if (!this.splashEl || !this.logoEl) this.initDOM();

    GameState.splashActive = true;

    const splash = this.splashEl;
    const logo = this.logoEl;

    /* ---- Restart cleanup ---- */
    if (isRestart) {
      const goPanel = document.getElementById("gameover");
      const fadeOverlay = document.getElementById("fadeOverlay");
      if (goPanel) goPanel.style.opacity = 0;
      if (fadeOverlay) fadeOverlay.style.opacity = 0;
    }

    /* ---- Show splash ---- */
    splash.style.display = "flex";
    splash.style.opacity = 1;

    /* ---- Restart logo animation ---- */
    logo.style.animation = "none";
    void logo.offsetWidth;
    logo.style.animation = `fillLogo ${this.SPLASH_DURATION}ms linear forwards`;

    /* ---- Fade out splash ---- */
    setTimeout(() => {
      splash.style.transition = `opacity ${this.SPLASH_FADE}ms ease`;
      splash.style.opacity = 0;

      setTimeout(() => {
        splash.style.display = "none";
        splash.style.transition = "";

        if (!isRestart) {
          this.firstStart();
        } else {
          this.restartGame();
        }
      }, this.SPLASH_FADE);

    }, this.SPLASH_DURATION);
  },

  /* =========================
     FIRST START (BOOT)
  ========================= */
  firstStart() {
    this._hasStarted = true;

    // 🔒 INIT ONLY (NO GAME LOOP)
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

    /* ---- SHOW START SCREEN ---- */
    StartScreen.show({
      onStart: () => {
        const cover = document.getElementById("game-cover");
        const container = GameState.gameContainer;

        if (container) {
          container.style.visibility = "visible";
          container.style.pointerEvents = "auto";
        }

        // ✅ SINGLE SOURCE OF TRANSITION
        playTransition(() => {
          if (cover) cover.classList.add("hidden");
          Engine.startGameLoop(true);
        });
      },

      onHowToPlay: () => {
        HowToPlay.show();
      }
    });

    /* ---- Release splash lock ---- */
    requestAnimationFrame(() => {
      GameState.splashActive = false;
      this._isPlaying = false;
    });
  },

  /* =========================
     RESTART GAME
  ========================= */
  restartGame() {
    // 🔒 On restart, game-cover is already hidden

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

/* =========================
   PROTOTYPE PARITY HOOK
========================= */
window.playSplash = function (isRestart = false) {
  Splash.play(isRestart);
};

/* =========================
   AUTO BOOT (ONCE)
========================= */
let splashBooted = false;

window.addEventListener("load", () => {
  if (splashBooted) return;
  splashBooted = true;

  setTimeout(() => {
    Splash.play(false);
  }, Splash.SPLASH_PREDELAY);
});
