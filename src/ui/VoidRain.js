export const VoidRain = {
  canvas: null,
  ctx: null,
  drops: [],
  active: false,

  init() {
    this.canvas = document.getElementById("void-rain");
    this.ctx = this.canvas.getContext("2d");

    this.resize();

    /* 🔥 INCREASE RAIN DENSITY */
    const count = 220; // ⬆ was 60
    this.drops = Array.from({ length: count }).map(() => ({
      x: Math.random(),
      y: Math.random() * -1,
      speed: 0.25 + Math.random() * 0.45, // ⬆ faster fall
      alpha: 0.18 + Math.random() * 0.25 // ⬆ brighter
    }));

    window.addEventListener("resize", () => this.resize());
    this.active = true;
    this.loop();
  },

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  loop() {
    if (!this.active) return;

    const { ctx, canvas } = this;

    /* 🖤 KEEP VOID BLACK, NO SMEAR */
    ctx.clearRect(0, 0, canvas.width, canvas.height * 0.6);

    /* ✨ CYBER GLOW */
    ctx.shadowColor = "rgba(0,255,220,0.6)";
    ctx.shadowBlur = 10;

    for (const d of this.drops) {
      const x = d.x * canvas.width;
      const y = d.y * canvas.height * 0.6;

      /* 🟢 STRONG TEAL */
      ctx.fillStyle = `rgba(0,255,220,${d.alpha})`;

      /* 🔥 THINNER STREAKS */
      ctx.fillRect(x, y, 1, 18);

      d.y += d.speed * 0.015; // ⬆ smoother motion

      if (d.y * canvas.height > canvas.height * 0.6) {
        d.y = Math.random() * -0.3;
        d.x = Math.random();
      }
    }

    requestAnimationFrame(() => this.loop());
  },

  stop() {
    this.active = false;
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
};
