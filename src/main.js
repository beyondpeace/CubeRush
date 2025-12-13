// main.js — Entry point for CubeRush Modular
import { Splash } from "./ui/Splash.js";

// Start the splash sequence on load
window.addEventListener("load", () => {
    Splash.initDOM();
    Splash.play(false);   // false → first start, not restart
});
