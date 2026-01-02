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
             <div class="player-name">
                Alright. ! 
                <span id="playerNameText"></span>,
                <span id="editNameBtn">✎</span>
            </div>
                <div class="hold-instruction">HOLD SPACE TO START</div>
                <div class="hold-progress">
                    <div class="hold-progress-fill">
                        <img
                            class="bike-indicator"
                            src="assets/bike_progress.png"
                            alt="Bike Progress"
                        />
                    </div>
                </div>
            </div>

            <br><br>

            <button id="how-to-play-btn" class="secondary-btn">
                HOW TO PLAY
            </button>
        </div>
    `;
        const nameText = container.querySelector("#playerNameText");
const editBtn = container.querySelector("#editNameBtn");

function getPlayerName() {
    let name = localStorage.getItem("cuberush_player_name");
    if (!name) {
        name = "RIDER-" + Math.floor(100 + Math.random() * 900);
        localStorage.setItem("cuberush_player_name", name);
    }
    return name;
}

nameText.innerText = getPlayerName();

editBtn.onclick = () => {
    const currentName = nameText.innerText;

    const input = document.createElement("input");
    input.type = "text";
    input.value = currentName;
    input.maxLength = 12;

    input.className = "player-name-input";

    nameText.replaceWith(input);
    input.focus();
    input.select();

    const save = () => {
        const newName = input.value.trim() || currentName;
        localStorage.setItem("cuberush_player_name", newName);

        nameText.innerText = newName;
        input.replaceWith(nameText);
    };

    const cancel = () => {
        input.replaceWith(nameText);
    };

    input.addEventListener("blur", save);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") cancel();
    });
};


    return container;
}
