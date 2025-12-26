// src/core/Input.js
// Centralized, lifecycle-safe input handling (A4)

import { GameState } from "./GameState.js";
import { GameOverUI } from "../ui/GameOver.js";


let inputAttached = false;

// --- Handlers (named so they can be detached) ---

function onKeyDown(e) {
  if (GameState.splashActive) return;

  // Prevent repeated keydown spam
  if (e.repeat) return;

  if (e.code === "ArrowLeft") {
    GameState.moveLeft = true;
  } else if (e.code === "ArrowRight") {
    GameState.moveRight = true;
  } else if (e.code === "Space") {
    // Restart only when game is over
    if (GameState.gameOver && window.playSplash) {
      // 🔒 Fully reset Game Over state BEFORE restart splash
      GameOverUI.resetForRestart();
      window.playSplash(true);
    }
  }
}

function onKeyUp(e) {
  if (e.code === "ArrowLeft") {
    GameState.moveLeft = false;
  } else if (e.code === "ArrowRight") {
    GameState.moveRight = false;
  }
}

function onBlur() {
  clearMovement();
}

function onVisibilityChange() {
  if (document.hidden) {
    clearMovement();
  }
}

// --- Public helpers ---

export function clearMovement() {
  GameState.moveLeft = false;
  GameState.moveRight = false;
}

// --- Lifecycle-controlled attach ---

export function initInput() {
  if (inputAttached) return;
  inputAttached = true;

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibilityChange);
}

// Optional future-proofing (not used yet, but safe)
export function detachInput() {
  if (!inputAttached) return;
  inputAttached = false;

  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("blur", onBlur);
  document.removeEventListener("visibilitychange", onVisibilityChange);

  clearMovement();
}
