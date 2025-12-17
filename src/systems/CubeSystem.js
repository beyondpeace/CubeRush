// systems/CubeSystem.js
/**
 * 🚨 PRODUCTION BASE LOCK 🚨
 * Prototype-aligned random cube field
 * Difficulty driven by LevelSystem
 * Bike-relative spawn (no lateral escape)
 * Full bike collision (front + body + rear)
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GameState } from "../core/GameState.js";

const BASE_CUBE_COUNT = 550;

// Lateral spread around bike (prototype)
const ULTRA_WIDTH = 600;

// Base Z depth (LevelSystem adds density via spacing)
const BASE_Z_MIN = -240;
const BASE_Z_MAX = -40;

const INITIAL_CUBE_SPEED = 0.32;

// Cube geometry
const CUBE_HALF = 0.6;

// Bike geometry
const WHEEL_RADIUS = 0.55;

// Collision Z windows
const FRONT_Z_WINDOW = 2.5;
const BODY_Z_WINDOW  = 2.2;
const REAR_Z_WINDOW  = 1.4;

// Collision X radii
const COLLISION_X_WIDE  = 1.35;
const COLLISION_X_TIGHT = 1.05;

// Rotation
const SPIN_PROBABILITY = 0.28;

// Palette
const MULTI_PALETTE = [
  0x00ffff, 0x66ffcc, 0xff66ff,
  0xffcc66, 0x66ccff, 0xff3399, 0x88ff88
];

function pickMulticolor() {
  return MULTI_PALETTE[Math.floor(Math.random() * MULTI_PALETTE.length)];
}

function randZ(spacing) {
  // spacing tightens the field naturally per level
  return (
    BASE_Z_MIN -
    Math.random() * spacing * 4 +
    Math.random() * (BASE_Z_MAX - BASE_Z_MIN)
  );
}

export const CubeSystem = {

  initCubes(scene) {
    GameState.cubes = [];
    GameState.cubeGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);

    for (let i = 0; i < BASE_CUBE_COUNT; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
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
    const spacing = L.current().spacing;

    // Bike-relative random field
    c.position.x =
      GameState.bikeX + (Math.random() - 0.5) * ULTRA_WIDTH;

    c.position.y = 0.75;
    c.position.z = randZ(spacing);

    // Color controlled by LevelSystem
    const col =
      L.targetColorHex == null || L.idx === 0
        ? pickMulticolor()
        : L.targetColorHex;

    c.material.color.setHex(col);
    c.material.emissive.setHex(col);

    // Rotation variety
    c.userData.spin = Math.random() < SPIN_PROBABILITY;
    c.userData.spinX = (Math.random() - 0.5) * 0.02;
    c.userData.spinY = (Math.random() - 0.5) * 0.025;
  },

  updateAll(now) {
    const bike = GameState.bike;
    if (!bike) return { hit: false };

    const vFront = new THREE.Vector3();
    const vRear  = new THREE.Vector3();

    GameState.frontTyre.getWorldPosition(vFront);
    GameState.rearTyre.getWorldPosition(vRear);

    const bodyZ = (vFront.z + vRear.z) * 0.5;

    // Dynamic collision width
    const speedT = Math.min(
      1,
      (GameState.cubeSpeed - INITIAL_CUBE_SPEED) / 1.2
    );

    const COLLISION_X =
      COLLISION_X_WIDE -
      speedT * (COLLISION_X_WIDE - COLLISION_X_TIGHT);

    for (const c of GameState.cubes) {

      // Move forward
      c.position.z += GameState.cubeSpeed;

      // Respawn just after passing bike
      if (c.position.z > 10) {
        this.spawnCube(c);
        continue;
      }

      const dx = c.position.x - GameState.bikeX;

      const cubeFrontZ = c.position.z - CUBE_HALF;
      const cubeBackZ  = c.position.z + CUBE_HALF;

      // Safety: cube fully behind rear wheel
      if (cubeFrontZ > vRear.z + WHEEL_RADIUS) continue;

      const dzFront =
        (vFront.z - WHEEL_RADIUS) - cubeBackZ;

      const dzBody =
        bodyZ - cubeFrontZ;

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

      // Rotation
      if (c.userData.spin) {
        c.rotation.x += c.userData.spinX;
        c.rotation.y += c.userData.spinY;
      }
    }

    return { hit: false };
  }
};
