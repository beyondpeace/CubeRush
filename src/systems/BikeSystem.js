// BikeSystem.js — Cleaned but gameplay-identical bike construction & updates
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GameState } from '../core/GameState.js';

const TAIL_RED = new THREE.Color(0xff0000);
const TAIL_ORANGE = new THREE.Color(0xff8800);

export const BikeSystem = {
    createBike(scene) {
        const bike = new THREE.Group();
        bike.scale.set(0.75, 0.75, 0.75);
        bike.position.set(0, 1.2, 1.6);
        scene.add(bike);

        // Materials
        const tyreMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x00eaff,
            emissiveIntensity: 2.0
        });

        const tailMat = new THREE.MeshStandardMaterial({
            color: 0x550000,
            emissive: 0xff0000,
            emissiveIntensity: 0.6
        });

        // Rear Tyre
        const rearGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.9, 32);
        rearGeo.rotateZ(Math.PI / 2);
        const rearTyre = new THREE.Mesh(rearGeo, tyreMat);
        rearTyre.position.set(0, 1.25, 0.6);
        bike.add(rearTyre);

        // Front Tyre
        const frontGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.6, 32);
        frontGeo.rotateZ(Math.PI / 2);
        const frontTyre = new THREE.Mesh(frontGeo, tyreMat);
        frontTyre.position.set(0, 1.25, -3.6);
        bike.add(frontTyre);

        // Rims
        const rimGeoRear = new THREE.TorusGeometry(1.25, 0.08, 16, 60);
        rimGeoRear.rotateY(Math.PI / 2);
        const rimLeft = new THREE.Mesh(rimGeoRear, rimMat);
        const rimRight = new THREE.Mesh(rimGeoRear, rimMat);
        rimLeft.position.set(-0.45, 1.25, 0.6);
        rimRight.position.set(0.45, 1.25, 0.6);
        bike.add(rimLeft, rimRight);

        const rimGeoFront = new THREE.TorusGeometry(1.0, 0.07, 16, 60);
        rimGeoFront.rotateY(Math.PI / 2);
        const rimFrontLeft = new THREE.Mesh(rimGeoFront, rimMat);
        const rimFrontRight = new THREE.Mesh(rimGeoFront, rimMat);
        rimFrontLeft.position.set(-0.35, 1.25, -3.6);
        rimFrontRight.position.set(0.35, 1.25, -3.6);
        bike.add(rimFrontLeft, rimFrontRight);

        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.7, 1.0, 4.0),
            new THREE.MeshStandardMaterial({ color: 0x000000 })
        );
        body.position.set(0, 1.25, -1.4);
        bike.add(body);

        // Visor
        const visorGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.4, 32);
        visorGeo.rotateX(Math.PI / 2);
        const visor = new THREE.Mesh(
            visorGeo,
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                emissive: 0x003344,
                emissiveIntensity: 0.75
            })
        );
        visor.position.set(0, 1.88, -3.15);
        bike.add(visor);

        // Tail Lamps
        const lampGeo = new THREE.BoxGeometry(0.32, 0.25, 0.18);
        const tailLeft = new THREE.Mesh(lampGeo, tailMat.clone());
        const tailRight = new THREE.Mesh(lampGeo, tailMat.clone());
        tailLeft.position.set(-0.7, 1.55, 1.05);
        tailRight.position.set(0.7, 1.55, 1.05);
        bike.add(tailLeft, tailRight);

        // Assign to GameState
        Object.assign(GameState, {
            bike,
            rearTyre,
            frontTyre,
            rimRearLeft: rimLeft,
            rimRearRight: rimRight,
            rimFrontLeft,
            rimFrontRight,
            tailLeft,
            tailRight
        });
    },

    updateRims() {
        if (!GameState.bike) return;
        const lean = GameState.bike.rotation.z * 0.35;

        GameState.rimRearLeft.rotation.z = lean;
        GameState.rimRearRight.rotation.z = lean;
        GameState.rimFrontLeft.rotation.z = lean;
        GameState.rimFrontRight.rotation.z = lean;
    },

    updateTailLamps() {
        if (!GameState.bike) return;
        const z = GameState.bike.rotation.z;
        const threshold = 0.05;

        let L = 0, R = 0;

        if (z > threshold) L = THREE.MathUtils.clamp((z - threshold) * 3, 0, 1);
        else if (z < -threshold) R = THREE.MathUtils.clamp((-z - threshold) * 3, 0, 1);

        const leftColor = TAIL_RED.clone().lerp(TAIL_ORANGE, L);
        const rightColor = TAIL_RED.clone().lerp(TAIL_ORANGE, R);

        GameState.tailLeft.material.emissive.copy(leftColor);
        GameState.tailRight.material.emissive.copy(rightColor);

        const idle = 0.6, turn = 2.5;
        GameState.tailLeft.material.emissiveIntensity = idle + L * (turn - idle);
        GameState.tailRight.material.emissiveIntensity = idle + R * (turn - idle);
    }
};
