import { createStartScreenUI } from "../ui/StartScreenUI.js";

export const StartScreen = {
    el: null,
    holdStartTime: 0,
    holding: false,
    holdRequired: 2000,
    rafId: null,

    show({ onStart, onHowToPlay }) {
        if (this.el) return;

        this.el = createStartScreenUI();
        document.body.appendChild(this.el);

        const fill = this.el.querySelector(".hold-progress-fill");

        requestAnimationFrame(() => {
            this.el.classList.add("visible");
        });

        const onKeyDown = (e) => {
            if (e.code !== "Space" || this.holding) return;
            this.holding = true;
            this.holdStartTime = performance.now();
        };

        const onKeyUp = (e) => {
            if (e.code !== "Space") return;
            this.holding = false;
            this.holdStartTime = 0;
            fill.style.width = "0%";
        };

        const update = () => {
            if (!this.el) return;

            if (this.holding) {
                const elapsed = performance.now() - this.holdStartTime;
                const progress = Math.min(elapsed / this.holdRequired, 1);
                fill.style.width = `${progress * 100}%`;

                if (progress >= 1) {
                    cleanup();
                    this.hide();

                    // ✅ SIGNAL SPLASH — NOTHING ELSE
                    onStart && onStart();
                    return;
                }
            }

            this.rafId = requestAnimationFrame(update);
        };

        const cleanup = () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            cancelAnimationFrame(this.rafId);
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        this.rafId = requestAnimationFrame(update);

        this.el.querySelector("#how-to-play-btn").onclick = () => {
            onHowToPlay && onHowToPlay();
        };
    },

    hide() {
        if (!this.el) return;

        this.el.classList.remove("visible");
        setTimeout(() => {
            this.el.remove();
            this.el = null;
        }, 400);
    }
};
