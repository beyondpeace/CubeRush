// systems/CubeSystem.js
/**
 * 🚨 PRODUCTION BASE LOCK 🚨
 * FULL BIKE COLLISION (corrected)
 * Front + body + rear
 * NO collision after bike has passed cube
 * NEGATIVE Z = forward
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GameState } from "../core/GameState.js";

const BASE_CUBE_COUNT = 550;
const ULTRA_WIDTH = 600;
const INITIAL_CUBE_SPEED = 0.32;

// Cube geometry
const CUBE_HALF = 0.6;

// Bike geometry
const WHEEL_RADIUS = 0.55;

// Z windows
const FRONT_Z_WINDOW = 2.5;
const BODY_Z_WINDOW  = 2.2;
const REAR_Z_WINDOW  = 1.4; // tightened for fairness

// X collision radii
const COLLISION_X_WIDE = 1.35;
const COLLISION_X_TIGHT = 1.05;

// Palette
const MULTI_PALETTE = [
  0x00ffff, 0x66ffcc, 0xff66ff,
  0xffcc66, 0x66ccff, 0xff3399, 0x88ff88
];

function pickMulticolor() {
  return MULTI_PALETTE[Math.floor(Math.random() * MULTI_PALETTE.length)];
}

function randZ() {
  return -Math.random() * 300 - 20;
}

export const CubeSystem = {

  initCubes(scene) {
    GameState.cubes = [];
    GameState.cubeGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);

    for (let i = 0; i < BASE_CUBE_COUNT; i++) {
      const col = pickMulticolor();
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.7
      });

      const cube = new THREE.Mesh(GameState.cubeGeom, mat);
      this.spawnCube(cube);
      scene.add(cube);
      GameState.cubes.push(cube);
    }
  },

  spawnCube(c) {
    const L = GameState.LevelManager;

    c.position.x = GameState.bikeX + (Math.random() - 0.5) * ULTRA_WIDTH;
    c.position.y = 0.75;

    const spacing = L.current().spacing;
    c.position.z = randZ() - Math.random() * spacing * 2;

    const col =
      L.targetColorHex == null || L.idx === 0
        ? pickMulticolor()
        : L.targetColorHex;

    c.material.color.setHex(col);
    c.material.emissive.setHex(col);
  },

  updateAll(now) {
    const bike = GameState.bike;
    if (!bike) return { hit: false };

    const vFront = new THREE.Vector3();
    const vRear  = new THREE.Vector3();

    GameState.frontTyre.getWorldPosition(vFront);
    GameState.rearTyre.getWorldPosition(vRear);

    const bodyZ = (vFront.z + vRear.z) * 0.5;

    // Dynamic X radius
    const speedT = Math.min(
      1,
      (GameState.cubeSpeed - INITIAL_CUBE_SPEED) / 1.2
    );

    const COLLISION_X =
      COLLISION_X_WIDE -
      speedT * (COLLISION_X_WIDE - COLLISION_X_TIGHT);

    for (const c of GameState.cubes) {
      c.position.z += GameState.cubeSpeed;

      const dx = c.position.x - GameState.bikeX;

      const cubeFrontZ = c.position.z - CUBE_HALF;
      const cubeBackZ  = c.position.z + CUBE_HALF;

      // 🔒 HARD SAFETY: cube already behind rear wheel → no collision
      if (cubeFrontZ > vRear.z + WHEEL_RADIUS) {
        continue;
      }

      // FRONT WHEEL
      const dzFront =
        (vFront.z - WHEEL_RADIUS) - cubeBackZ;

      // BODY (only between wheels)
      const dzBody =
        bodyZ - cubeFrontZ;

      // REAR WHEEL
      const dzRear =
        cubeFrontZ - (vRear.z + WHEEL_RADIUS);

      if (
        Math.abs(dx) < COLLISION_X &&
        (
          (dzFront >= 0 && dzFront < FRONT_Z_WINDOW) ||
          (dzBody >= -BODY_Z_WINDOW && dzBody <= BODY_Z_WINDOW) ||
          (dzRear >= 0 && dzRear < REAR_Z_WINDOW)
        )
      ) {
        return { hit: true };
      }
    }

    return { hit: false };
  }
};
