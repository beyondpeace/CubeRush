export function createStartScreenUI() {
    const container = document.createElement("div");
    container.id = "start-screen";

    container.innerHTML = `
        <div class="start-inner">
            <h1 class="game-title">CubeRush</h1>
            <p class="game-subtitle">Survive the Rush</p>

            <div class="start-buttons">
                <button id="start-ride-btn" class="primary-btn">START RIDE</button>
                <button id="how-to-play-btn" class="secondary-btn">HOW TO PLAY</button>
            </div>
        </div>
    `;

    return container;
}
