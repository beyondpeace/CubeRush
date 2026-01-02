// main.js — Entry point for CubeRush Modular
import { Splash } from "./ui/Splash.js";
import { RestartTransition } from "./addons/RestartTransition.js";
import { HUD } from "./ui/HUD.js";   // ✅ ADD THIS

// Start the splash sequence on load
window.addEventListener("load", () => {
    HUD.init();              // ✅ ADD THIS (ONE TIME ONLY)
    Splash.initDOM();
    RestartTransition.init();
    Splash.play(false);      // false → first start, not restart
});
