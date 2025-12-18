export function createHowToPlayUI() {
    const el = document.createElement("div");
    el.id = "how-to-play";

    el.innerHTML = `
        <div class="htp-panel">
            <h2>HOW TO PLAY</h2>

            <div class="htp-animation">
                <div class="htp-track">
                    <div class="htp-bike"></div>
                </div>
            </div>

            <div class="htp-text desktop">
                <p>Use <strong>← / →</strong> arrow keys to steer</p>
            </div>

            <div class="htp-text mobile">
                <p>Touch & hold <strong>LEFT</strong> or <strong>RIGHT</strong> side to steer</p>
            </div>

            <ul class="htp-rules">
                <li>Avoid the cubes</li>
                <li>Speed increases every level</li>
                <li>One hit = Game Over</li>
            </ul>

            <button id="htp-close-btn">GOT IT</button>
        </div>
    `;

    return el;
}
