
import { GameState } from './GameState.js';

function onKeyDown(e) {
  if (GameState.splashActive) return;

  if (e.code === 'ArrowLeft') GameState.moveLeft = true;
  else if (e.code === 'ArrowRight') GameState.moveRight = true;
  else if (e.code === 'Space') {
    if (GameState.gameOver && window.playSplash) {
      window.playSplash(true);
    }
  }
}

function onKeyUp(e) {
  if (GameState.splashActive) return;

  if (e.code === 'ArrowLeft') GameState.moveLeft = false;
  else if (e.code === 'ArrowRight') GameState.moveRight = false;
}

export function clearMovement() {
  GameState.moveLeft = false;
  GameState.moveRight = false;
}

export function initInput() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  window.addEventListener('blur', () => clearMovement());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearMovement();
  });
}
