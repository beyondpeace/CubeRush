// src/core/Input.js
// Centralized, lifecycle-safe input handling (A4)
// Keyboard + Mobile Touch Zones

import { GameState } from "./GameState.js";
import { RestartTransition } from "../addons/RestartTransition.js";

let inputAttached = false;

const isTouch =
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0;

// ─────────────────────────────────────────────
// Keyboard Handlers
// ─────────────────────────────────────────────

function onKeyDown(e) {
  if (GameState.splashActive) return;
  if (e.repeat) return;

  if (e.code === "ArrowLeft") {
    GameState.moveLeft = true;
  } else if (e.code === "ArrowRight") {
    GameState.moveRight = true;
  } else if (e.code === "Space") {
    if (GameState.gameOver) {
      RestartTransition.play();
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

// ─────────────────────────────────────────────
// Touch Handlers (Mobile)
// ─────────────────────────────────────────────

function onTouchStart(e) {
  if (GameState.splashActive) return;

  // Tap to restart on game over
  if (GameState.gameOver) {
    RestartTransition.play();
    return;
  }

  if (!e.touches || e.touches.length === 0) return;

  const touchX = e.touches[0].clientX;
  const width = window.innerWidth;

  if (touchX < width * 0.5) {
    GameState.moveLeft = true;
    GameState.moveRight = false;
  } else {
    GameState.moveRight = true;
    GameState.moveLeft = false;
  }
}

function onTouchMove(e) {
  if (GameState.splashActive) return;
  if (!e.touches || e.touches.length === 0) return;

  const touchX = e.touches[0].clientX;
  const width = window.innerWidth;

  if (touchX < width * 0.5) {
    GameState.moveLeft = true;
    GameState.moveRight = false;
  } else {
    GameState.moveRight = true;
    GameState.moveLeft = false;
  }
}

function onTouchEnd() {
  clearMovement();
}

// ─────────────────────────────────────────────
// Focus / Visibility Safety
// ─────────────────────────────────────────────

function onBlur() {
  clearMovement();
}

function onVisibilityChange() {
  if (document.hidden) {
    clearMovement();
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function clearMovement() {
  GameState.moveLeft = false;
  GameState.moveRight = false;
}

// ─────────────────────────────────────────────
// Lifecycle Control
// ─────────────────────────────────────────────

export function initInput() {
  if (inputAttached) return;
  inputAttached = true;

  // Keyboard
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // Focus safety
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onVisibilityChange);

  // Touch (mobile only)
  if (isTouch) {
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
  }
}

export function detachInput() {
  if (!inputAttached) return;
  inputAttached = false;

  // Keyboard
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);

  // Focus safety
  window.removeEventListener("blur", onBlur);
  document.removeEventListener("visibilitychange", onVisibilityChange);

  // Touch
  if (isTouch) {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
  }

  clearMovement();
}
