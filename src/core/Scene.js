// core/Scene.js
/**
 * 🚨 PRODUCTION BASE LOCK 🚨
 * Procedural grid floor – NO textures
 * Feature A: Speed-based grid fade
 * Feature B: Z-direction grid animation
 * Feature C: Lane highlighting
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GameState } from "./GameState.js";
import { CubeSystem } from "../systems/CubeSystem.js";
import { BikeSystem } from "../systems/BikeSystem.js";

/* ======================================================
   🔧 GRID & FLOOR TUNING CONTROLS (EDIT THESE ONLY)
====================================================== */

// Grid appearance
const GRID_SCALE = 1080.0;
const GRID_LINE_WIDTH = 0.018;

// Speed-based fade
const GRID_OPACITY_BASE = 0.25;
const GRID_OPACITY_MIN  = 0.12;
const GRID_FADE_SPEED   = 1.6;

// Z-direction grid motion
const GRID_SCROLL_SPEED = 0.15;
const GRID_SCROLL_SCALE = 0.6;

// Lane highlighting
const LANE_SPACING  = 1.0;    // grid cells per lane
const LANE_INTENSITY = 0.25;  // brightness boost
const LANE_SOFTNESS  = 0.18;  // blend smoothness

// Colors
const GRID_COLOR = 0x00ffff;
const GRID_BG_COLOR = 0x001420;

// Floor placement & size
const FLOOR_SIZE = 4000;
const FLOOR_Y = -0.15;

// Camera defaults
const CAMERA_Y = 6;
const CAMERA_Z = 14;

/* ======================================================
   Resize handler
====================================================== */
function handleResize() {
  if (!GameState.camera || !GameState.renderer) return;
  GameState.camera.aspect = window.innerWidth / window.innerHeight;
  GameState.camera.updateProjectionMatrix();
  GameState.renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ======================================================
   Scene initialization
====================================================== */
export function initScene() {

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0006);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, CAMERA_Y, CAMERA_Z);
  camera.lookAt(0, 1.5, -10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  document.body.appendChild(renderer.domElement);
  setTimeout(handleResize, 0);

  GameState.scene = scene;
  GameState.camera = camera;
  GameState.renderer = renderer;

  scene.add(new THREE.AmbientLight(0x00ffff, 0.3));

  const point = new THREE.PointLight(0x00ffff, 1.2, 300);
  point.position.set(0, 60, 80);
  scene.add(point);

  /* ======================================================
     PROCEDURAL GRID FLOOR (FADE + Z-MOTION + LANES)
  ===================================================== */
  const floorMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      gridColor: { value: new THREE.Color(GRID_COLOR) },
      bgColor: { value: new THREE.Color(GRID_BG_COLOR) },
      gridScale: { value: GRID_SCALE },
      lineWidth: { value: GRID_LINE_WIDTH },
      opacity: { value: GRID_OPACITY_BASE },
      gridOffsetZ: { value: 0.0 },
      laneSpacing: { value: LANE_SPACING },
      laneIntensity: { value: LANE_INTENSITY },
      laneSoftness: { value: LANE_SOFTNESS }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 gridColor;
      uniform vec3 bgColor;
      uniform float gridScale;
      uniform float lineWidth;
      uniform float opacity;
      uniform float gridOffsetZ;
      uniform float laneSpacing;
      uniform float laneIntensity;
      uniform float laneSoftness;

      float gridLine(vec2 uv) {
        vec2 p = abs(fract(uv * gridScale - 0.5) - 0.5) / fwidth(uv * gridScale);
        return 1.0 - smoothstep(lineWidth, lineWidth + 1.0, min(p.x, p.y));
      }

      float laneLine(vec2 uv) {
        float lane = abs(fract(uv.x * gridScale / laneSpacing) - 0.5);
        return 1.0 - smoothstep(0.5 - laneSoftness, 0.5, lane);
      }

      void main() {
        vec2 uv = vUv;
        uv.y += gridOffsetZ;

        float g = gridLine(uv);
        float lane = laneLine(uv) * laneIntensity;

        vec3 base = mix(bgColor, gridColor, g);
        vec3 color = base + lane * gridColor;

        gl_FragColor = vec4(color, opacity);
      }
    `
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(FLOOR_SIZE, FLOOR_SIZE),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  scene.add(floor);

  GameState.grid = floor;

  BikeSystem.createBike(scene);
  CubeSystem.initCubes(scene);

  window.addEventListener("resize", handleResize);
  handleResize();

  /* ======================================================
     GRID UPDATE LOOP (FADE + Z-FLOW)
  ===================================================== */
  function updateGridVisuals() {
    if (!GameState.grid || !GameState.grid.material) return;

    const speed = GameState.cubeSpeed || 0;

    // Fade
    const fade =
      GRID_OPACITY_BASE -
      Math.min(1, speed / GRID_FADE_SPEED) *
      (GRID_OPACITY_BASE - GRID_OPACITY_MIN);

    GameState.grid.material.uniforms.opacity.value = fade;

    // Z-flow
    const scroll =
      GRID_SCROLL_SPEED +
      speed * GRID_SCROLL_SCALE * 0.01;

    GameState.grid.material.uniforms.gridOffsetZ.value += scroll;
  }

  const originalRender = renderer.render.bind(renderer);
  renderer.render = function (scene, camera) {
    updateGridVisuals();
    originalRender(scene, camera);
  };
}
