// systems/CubeSystem.js
/**
 * 🚨 PRODUCTION BASE LOCK 🚨
 * Cube movement & collision are FRAME-BASED (prototype-aligned).
 * Collision bounds are intentionally forgiving to match camera perspective.
 * Do NOT refactor to dt unless entire engine is refactored.
 * Locked on: 2025-12-13
 */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GameState } from '../core/GameState.js';

const BASE_CUBE_COUNT = 550;
const MAX_CUBE_COUNT = 1600;
const ULTRA_WIDTH = 600;

const INITIAL_CUBE_SPEED = 0.32;

const BASE_PULSE_AMPLITUDE = 0.08;
const NEARMISS_X_MARGIN = 1.6;
const NEARMISS_DZ = 6.0;
const SHAKE_MAX = 1.2;
const DENSITY_SPEED_SCALE = 220;

// Visual palette identical to prototype
const MULTI_PALETTE = [
  0x00ffff,0x66ffcc,0xff66ff,
  0xffcc66,0x66ccff,0xff3399,0x88ff88
];

function pickMulticolor(){
  return MULTI_PALETTE[Math.floor(Math.random()*MULTI_PALETTE.length)];
}

function randZ(){ return -Math.random()*300 - 20; }
function dynamicRange(){ return ULTRA_WIDTH; }

export const CubeSystem = {

  initCubes(scene){
    GameState.cubes = [];
    GameState.cubeGeom = new THREE.BoxGeometry(1.2,1.2,1.2);

    for(let i=0;i<BASE_CUBE_COUNT;i++){
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

  spawnCube(c){
    const bikeX = GameState.bikeX;
    const L = GameState.LevelManager;

    c.position.x = bikeX + (Math.random()-0.5)*dynamicRange();
    c.position.y = 0.75;
    const spacing = L.current().spacing;
    c.position.z = randZ() - Math.random()*spacing*2;

    c.userData.spin = Math.random() < 0.18;
    c.userData.spinOffset = (Math.random()-0.5)*0.12;

    c.userData.pulse = Math.random() < 0.32;
    c.userData.flickOffset = Math.random()*1000;
    c.userData.baseScale = 1;
    c.scale.setScalar(1);

    if(L.targetColorHex === null || L.idx === 0){
      const col = pickMulticolor();
      c.material.color.setHex(col);
      c.material.emissive.setHex(col);
    } else {
      c.material.color.setHex(L.targetColorHex);
      c.material.emissive.setHex(L.targetColorHex);
    }

    c.userData.baseEmissiveIntensity =
      c.material.emissiveIntensity || 0.7;
  },

  handleCubeRespawn(c, now){
    if(c.position.z > 10){
      this.spawnCube(c);

      const gap = now - GameState.lastComboTime;
      GameState.lastComboTime = now;

      GameState.comboCount = gap < 300
        ? GameState.comboCount + 1
        : 0;

      GameState.multiplier =
        1 + Math.min(
          GameState.comboCount*0.01 + GameState.cubeSpeed*1.2,
          5
        );
    }
  },

  updateAll(now){
    const cubes = GameState.cubes;
    const bike = GameState.bike;
    const L = GameState.LevelManager;

    for(let i=0;i<cubes.length;i++){
      const c = cubes[i];

      const drift =
        Math.sin(
          (GameState.accumulatedDistance*0.001) +
          (i*0.021)
        ) * 0.002 * Math.min(2.0, GameState.cubeSpeed);
      c.position.x += drift;

      c.position.z += GameState.cubeSpeed;

      if(c.position.z > 10)
        this.handleCubeRespawn(c, now);

      const dx = c.position.x - bike.position.x;
      const dz = c.position.z - bike.position.z;

      // 🔧 Collision envelope tuned to camera perspective (prototype-aligned)
      if(Math.abs(dx) < 1.35 && Math.abs(dz) < 2.6){
        return { hit:true };
      }

      const spinMult = 1 + (L.idx*0.35);
      if(c.userData.spin){
        c.rotation.y += (c.userData.spinOffset||0.02) *
           (0.6 + GameState.cubeSpeed*0.05) * spinMult;
        c.rotation.x += (c.userData.spinOffset||0.01) *
           0.45 * spinMult;
      } else {
        c.rotation.y +=
          (c.userData.spinOffset||0.002)*0.2*(1+L.idx*0.08);
      }

      if(c.userData.pulse){
        const speedFactor = 1 + Math.min(1.5, GameState.cubeSpeed*0.45);
        const levelFactor = 1 + (L.idx*0.18);
        const t = (GameState.accumulatedDistance*0.025) +
                  (c.userData.flickOffset*0.001);
        const pulseAmp = BASE_PULSE_AMPLITUDE * speedFactor * levelFactor;
        const pulse = 1 + pulseAmp * Math.sin(t*(1+L.idx*0.06));
        c.scale.setScalar(c.userData.baseScale * pulse);

        c.material.emissiveIntensity =
          (c.userData.baseEmissiveIntensity||0.7) +
          Math.abs(pulseAmp * 2 * Math.sin(t*(1.2+L.idx*0.04)));
      }

      const nearMiss =
        (dz>-NEARMISS_DZ && dz<4 &&
         Math.abs(dx)>1.1 && Math.abs(dx)<NEARMISS_X_MARGIN);

      if(nearMiss){
        const prox = 1 - (Math.abs(dx)-1.1)/(NEARMISS_X_MARGIN-1.1);
        const shakeAmt =
          Math.min(
            SHAKE_MAX,
            1.6 * prox *
            Math.min(1.2, GameState.cubeSpeed*0.6) *
            (1+L.idx*0.12)
          );
        GameState.cameraShake =
          Math.min(SHAKE_MAX, GameState.cameraShake + shakeAmt);

        GameState.cameraShakeX =
          Math.min(
            1.2,
            0.05*(1+GameState.cubeSpeed*0.8)*prox*(1+L.idx*0.1)
          );
      }
    }

    const speedExtra =
      Math.floor((GameState.cubeSpeed - INITIAL_CUBE_SPEED)*DENSITY_SPEED_SCALE);

    const targetCount =
      Math.min(
        MAX_CUBE_COUNT,
        (GameState.LevelManager.targetCount || BASE_CUBE_COUNT)
        + Math.max(0, speedExtra)
      );

    if(cubes.length < targetCount){
      const needed = Math.min(10, targetCount - cubes.length);
      for(let k=0;k<needed;k++){
        const col = GameState.LevelManager.targetColorHex || pickMulticolor();
        const mat = new THREE.MeshStandardMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.7
        });
        const extra = new THREE.Mesh(GameState.cubeGeom, mat);
        this.spawnCube(extra);
        GameState.scene.add(extra);
        cubes.push(extra);
      }
    }

    if(GameState.LevelManager.targetColorHex){
      const tgt = new THREE.Color(GameState.LevelManager.targetColorHex);

      for(let i=0;i<cubes.length;i++){
        const c = cubes[i];
        c.material.emissive.r += (tgt.r - c.material.emissive.r)*0.02;
        c.material.emissive.g += (tgt.g - c.material.emissive.g)*0.02;
        c.material.emissive.b += (tgt.b - c.material.emissive.b)*0.02;

        c.material.color.r += (tgt.r - c.material.color.r)*0.01;
        c.material.color.g += (tgt.g - c.material.color.g)*0.01;
        c.material.color.b += (tgt.b - c.material.color.b)*0.01;
      }
    }

    return { hit:false };
  }
};
