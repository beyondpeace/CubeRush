import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createMatrixBackground() {
  // --- Canvas setup ---
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Matrix characters (simple, readable)
  const chars = "01アイウエオカキクケコサシスセソ0123456789";
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(0);

  // --- Texture ---
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

  // --- Material ---
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.12,      // keep subtle
    depthWrite: false
  });

  // --- Plane ---
  const geometry = new THREE.PlaneGeometry(2000, 2000);
  const plane = new THREE.Mesh(geometry, material);

  // Push far back
  // plane.position.z = -600;
  plane.renderOrder = -10;

  // --- Animation ---
  function update() {
  // Fade for trail effect
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#00aa66";
  ctx.font = `${fontSize}px monospace`;

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    ctx.fillText(char, x, y);

    if (y > canvas.height && Math.random() > 0.985) {
      drops[i] = 0;
    } else {
      drops[i] += 0.6;
    }
  }

  texture.needsUpdate = true;
}


  return { texture, update };
}
