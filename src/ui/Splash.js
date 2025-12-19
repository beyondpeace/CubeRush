// src/ui/Splash.js
// 🚨 PRODUCTION BASE LOCK 🚨
// Splash → Start Screen → Gameplay (Transition is VISUAL ONLY)

import { GameState } from "../core/GameState.js";
import { initScene } from "../core/Scene.js";
import { initInput } from "../core/Input.js";
import { LevelSystem } from "../systems/LevelSystem.js";
import { HUD } from "./HUD.js";
import { Engine } from "../core/Engine.js";
import { StartScreen } from "../addons/StartScreen.js";
import { HowToPlay } from "../addons/HowToPlay.js";

export const Splash = {
  splashEl: null,
  logoEl: null,

  SPLASH_PREDELAY: 600,
  SPLASH_DURATION: 1800,
  SPLASH_FADE: 400,

  _isPlaying: false,
  _hasStarted: false,

  /* =========================
     DOM INIT
  ========================= */
  initDOM() {
    this.splashEl = document.getElementById("splash");
    this.logoEl = document.getElementById("logo");

    if (!this.splashEl) this.splashEl = { style: {} };
    if (!this.logoEl) this.logoEl = { style: {}, offsetWidth: 0 };
  },

  /* =========================
     SPLASH
  ========================= */
  play(isRestart = false) {
    if (this._isPlaying) return;
    if (this._hasStarted && !isRestart) return;

    this._isPlaying = true;
    this.initDOM();

    GameState.splashActive = true;

    const splash = this.splashEl;
    const logo = this.logoEl;

    splash.style.display = "flex";
    splash.style.opacity = 1;

    logo.style.animation = "none";
    void logo.offsetWidth;
    logo.style.animation = `fillLogo ${this.SPLASH_DURATION}ms linear forwards`;

    setTimeout(() => {
      splash.style.transition = `opacity ${this.SPLASH_FADE}ms ease`;
      splash.style.opacity = 0;

      setTimeout(() => {
        splash.style.display = "none";
        splash.style.transition = "";

        isRestart ? this.restartGame() : this.firstStart();
      }, this.SPLASH_FADE);

    }, this.SPLASH_DURATION);
  },

  /* =========================
     FIRST START
  ========================= */
  firstStart() {
    this._hasStarted = true;

    // 🔒 Core init — ONCE
    initInput();
    LevelSystem.init?.();
    initScene();
    HUD.init();

    StartScreen.show({
      onStart: () => {
        const container = GameState.gameContainer;
        const cover = document.getElementById("game-cover");

        if (container) {
          container.style.visibility = "visible";
          container.style.pointerEvents = "auto";
        }

        // 🔥 GAME STARTS IMMEDIATELY (NO BLOCKERS)
        cover?.classList.add("hidden");
        Engine.startGameLoop(true);

        // 🎬 OPTIONAL TRANSITION (VISUAL ONLY)
        const flash = document.getElementById("transition-flash");
        if (flash) {
          flash.classList.add("active");
          setTimeout(() => {
            flash.classList.remove("active");
          }, 2200);
        }
      },

      onHowToPlay: () => {
        HowToPlay.show();
      }
    });

    requestAnimationFrame(() => {
      GameState.splashActive = false;
      this._isPlaying = false;
    });
  },

  /* =========================
     RESTART
  ========================= */
  restartGame() {
    Engine.startGameLoop(false);

    requestAnimationFrame(() => {
      GameState.splashActive = false;
      this._isPlaying = false;
    });
  }
};

/* =========================
   GLOBAL HOOK
========================= */
window.playSplash = (isRestart = false) => {
  Splash.play(isRestart);
};

/* =========================
   AUTO BOOT
========================= */
let splashBooted = false;
window.addEventListener("load", () => {
  if (splashBooted) return;
  splashBooted = true;

  setTimeout(() => {
    Splash.play(false);
  }, Splash.SPLASH_PREDELAY);
});
