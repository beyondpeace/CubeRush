// main.js — Entry point for CubeRush Modular
import { Splash } from "./ui/Splash.js";
import { RestartTransition } from "./addons/RestartTransition.js";


// Start the splash sequence on load
window.addEventListener("load", () => {
    Splash.initDOM();
    RestartTransition.init();
    Splash.play(false);   // false → first start, not restart
});
