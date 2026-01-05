// core/Scene.js
/**
 * 🚨 PRODUCTION BASE LOCK 🚨
 * Procedural grid floor – NO textures
 * Feature A: Speed-based grid fade
 * Feature B: Z-direction grid animation
 * Feature C: Lane highlighting
 * V-2 FINAL: Far Horizon Layer (NO SKY TEXTURES)
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GameState } from "./GameState.js";
import { CubeSystem } from "../systems/CubeSystem.js";
import { VoidRain } from "../ui/voidrain.js";

import { BikeSystem } from "../systems/BikeSystem.js";

/* ======================================================
   GRID & FLOOR TUNING CONTROLS
====================================================== */
const GRID_SCALE = 1080.0;
const GRID_LINE_WIDTH = 0.018;

const GRID_OPACITY_BASE = 0.25;
const GRID_OPACITY_MIN  = 0.12;
const GRID_FADE_SPEED   = 1.6;

const GRID_SCROLL_SPEED = 0.15;
const GRID_SCROLL_SCALE = 0.6;

const LANE_SPACING   = 1.0;
const LANE_INTENSITY = 0.25;
const LANE_SOFTNESS  = 0.18;

const GRID_COLOR    = 0x00ffff;
const GRID_BG_COLOR = 0x001420;

const FLOOR_SIZE = 4000;
const FLOOR_Y = -0.15;

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

  /* 🔒 GAME CONTAINER (HIDDEN UNTIL PLAY) */
  let gameContainer = document.getElementById("game-container");
  if (!gameContainer) {
    gameContainer = document.createElement("div");
    gameContainer.id = "game-container";
    gameContainer.style.position = "fixed";
    gameContainer.style.inset = "0";
    gameContainer.style.visibility = "hidden";
    gameContainer.style.pointerEvents = "none";
    document.body.appendChild(gameContainer);
  }

  const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);


  // Dark void + fog (sky stays black)
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
  // renderer.setClearColor(0x000000);
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));

  gameContainer.appendChild(renderer.domElement);

  GameState.scene = scene;
  GameState.camera = camera;
  GameState.renderer = renderer;
  GameState.gameContainer = gameContainer;
  if (!VoidRain.active) VoidRain.init();


  /* ================= LIGHTING ================= */
  scene.add(new THREE.AmbientLight(0x00ffff, 0.3));

  const point = new THREE.PointLight(0x00ffff, 1.2, 300);
  point.position.set(0, 60, 80);
  scene.add(point);

  /* ================= GRID FLOOR ================= */
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

  /* ================= FAR HORIZON (V-2 FINAL) ================= */
  const horizon = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 1200),
    new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    })
  );

  horizon.position.set(0, 60, -1200);
  horizon.rotation.x = -Math.PI * 0.02;
  horizon.renderOrder = -5;
  scene.add(horizon);

  /* ================= GAME OBJECTS ================= */
  BikeSystem.createBike(scene);
  CubeSystem.initCubes(scene);

  window.addEventListener("resize", handleResize);
  handleResize();

  /* ================= RENDER OVERRIDE ================= */
  const originalRender = renderer.render.bind(renderer);
  renderer.render = function (scene, camera) {
    updateGridVisuals();
    originalRender(scene, camera);
  };

  function updateGridVisuals() {
    const speed = GameState.cubeSpeed || 0;

    const fade =
      GRID_OPACITY_BASE -
      Math.min(1, speed / GRID_FADE_SPEED) *
      (GRID_OPACITY_BASE - GRID_OPACITY_MIN);

    GameState.grid.material.uniforms.opacity.value = fade;

    const scroll =
      GRID_SCROLL_SPEED +
      speed * GRID_SCROLL_SCALE * 0.01;

    GameState.grid.material.uniforms.gridOffsetZ.value += scroll;
  }
}

/* ======================================================
   RESET GRID (REQUIRED BY ENGINE)
====================================================== */
export function resetGrid() {
  if (!GameState.grid || !GameState.grid.material) return;

  const uniforms = GameState.grid.material.uniforms;

  if (uniforms?.gridOffsetZ) {
    uniforms.gridOffsetZ.value = 0;
  }

  if (uniforms?.opacity) {
    uniforms.opacity.value = GRID_OPACITY_BASE;
  }
}
