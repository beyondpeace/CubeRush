export function createStartScreenUI() {
    const container = document.createElement("div");
    container.id = "start-screen";

    const cubeCount = 68;          // 🔼 increase this (48, 60, 72)
    const cols = 5.5;                // grid columns
    const rows = Math.ceil(cubeCount / cols);

    const cubesHTML = Array.from({ length: cubeCount })
        .map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const cellWidth = 90 / cols;
            const cellHeight = 90 / rows;

            const baseLeft = 5 + col * cellWidth;
            const baseTop = 5 + row * cellHeight;

            // jitter inside cell
            const left = baseLeft + Math.random() * (cellWidth * 0.7);
            const top = baseTop + Math.random() * (cellHeight * 0.7);

            return `
                <div class="cube" style="top:${top}%; left:${left}%;">
                    <div class="face front"></div>
                    <div class="face back"></div>
                    <div class="face right"></div>
                    <div class="face left"></div>
                    <div class="face top"></div>
                    <div class="face bottom"></div>
                </div>
            `;
        })
        .join("");

    container.innerHTML = `
        <div class="cube-layer">
            ${cubesHTML}
        </div>

        <div class="start-inner">
            <h1 class="game-title">CUBERUSH</h1>
            <p class="game-subtitle">Survive the Rush</p>

            <div class="hold-wrapper">
                <div class="hold-instruction">HOLD SPACE TO START</div>
                <div class="hold-progress">
                    <div class="hold-progress-fill">
                        <div class="bike-indicator">🏍️</div>
                    </div>
                </div>
            </div>

            <br><br>

            <button id="how-to-play-btn" class="secondary-btn">
                HOW TO PLAY
            </button>
        </div>
    `;

    return container;
}
