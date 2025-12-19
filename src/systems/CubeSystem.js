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
        color: 0x000000,     // irrelevant once transparent
        transparent: true,
        opacity: 0.0,       // fully invisible faces
        emissive: 0x000000,
        roughness: 1,
        metalness: 0
      });


      const cube = new THREE.Mesh(GameState.cubeGeom, mat);
      // === VISUAL ONLY: cube glowing edges ===
      const edgeGeom = new THREE.EdgesGeometry(GameState.cubeGeom);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      const edges = new THREE.LineSegments(edgeGeom, edgeMat);

      // === SOFT GLOW EDGES (FAKE BLOOM) ===
        const glowMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false
        });

        const glowEdges = new THREE.LineSegments(edgeGeom, glowMat);

        // Slightly scale up for halo effect
        glowEdges.scale.set(1.08, 1.08, 1.08);
        cube.add(glowEdges);
        cube.userData.__glowEdges = glowEdges;
        
        // === OUTER SOFT GLOW (NEON HALO) ===
        const outerGlowMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          depthWrite: false
        });

        const outerGlowEdges = new THREE.LineSegments(edgeGeom, outerGlowMat);

        // Bigger scale = softer halo
        outerGlowEdges.scale.set(1.22, 1.22, 1.22);

        // Render behind everything
        outerGlowEdges.renderOrder = -1;

        cube.add(outerGlowEdges);
        cube.userData.__outerGlowEdges = outerGlowEdges;


      // Attach edges to cube so they inherit movement & rotation
      cube.add(edges);
      glowEdges.renderOrder = 0;
      edges.renderOrder = 1;


      // Store reference for coloring later
      cube.userData.__edges = edges;
      cube.userData.__pulse = Math.random() * Math.PI * 2; // random start
      cube.userData.__pulseSpeed = 0.02 + Math.random() * 0.02;
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

    // c.material.color.setHex(col);
    // c.material.emissive.setHex(col);
    // Apply color ONLY to edges
      if (c.userData.__edges) {
        c.userData.__edges.material.color.setHex(col);
      }
      if (c.userData.__glowEdges) {
        c.userData.__glowEdges.material.color.setHex(col);
      }
      if (c.userData.__outerGlowEdges) {
         c.userData.__outerGlowEdges.material.color.setHex(col);
       }

      c.userData.__baseEdgeColor = col;

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
      // === EDGE GLOW PULSE (VISUAL ONLY) ===
      if (c.userData.__edges && c.userData.__baseEdgeColor != null) {
        c.userData.__pulse += c.userData.__pulseSpeed;

        // Base glow (always ON)
        const BASE_GLOW = 1.15;

        // Pulse adds gently on top
        const PULSE_AMPLITUDE = 0.3;
        const pulse = Math.sin(c.userData.__pulse) * PULSE_AMPLITUDE;

        const intensity = BASE_GLOW + pulse;

        const baseColor = new THREE.Color(c.userData.__baseEdgeColor);
        baseColor.multiplyScalar(intensity);

        c.userData.__edges.material.color.copy(baseColor);

        if (c.userData.__glowEdges) {
          const glowColor = baseColor.clone().multiplyScalar(0.8);
          c.userData.__glowEdges.material.color.copy(glowColor);
        }
         if (c.userData.__outerGlowEdges) {
        const outerColor = baseColor.clone().multiplyScalar(0.6);
        c.userData.__outerGlowEdges.material.color.copy(outerColor);
      }
      }
     


    }

    return { hit: false };
  }
};
