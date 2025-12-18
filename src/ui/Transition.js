// src/ui/Transition.js
// SAFE cinematic transition (guaranteed game start)

export function playTransition(onComplete) {
    const flash = document.getElementById("transition-flash");
    const text = flash?.querySelector(".tf-text");

    // If transition DOM missing → start immediately
    if (!flash || !text) {
        onComplete && onComplete();
        return;
    }

    // Reset state (restart-safe)
    flash.style.display = "flex";
    flash.style.opacity = "1";
    text.style.opacity = "1";

    // Show text
    text.textContent = "GET READY TO RUSH";

    // Short cinematic delay (FIXED, SAFE)
    setTimeout(() => {
        flash.style.opacity = "0";
        flash.style.display = "none";
        onComplete && onComplete();
    }, 1600); // 👈 intentional, reliable
}
