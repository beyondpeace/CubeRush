import { createStartScreenUI } from "../ui/StartScreenUI.js";

export const StartScreen = {
    el: null,

    show({ onStart, onHowToPlay }) {
        if (this.el) return;

        this.el = createStartScreenUI();
        document.body.appendChild(this.el);

        requestAnimationFrame(() => {
            this.el.classList.add("visible");
        });

        this.el.querySelector("#start-ride-btn").onclick = () => {
            this.hide();
            onStart && onStart();
        };

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
