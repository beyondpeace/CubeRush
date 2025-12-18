import { createHowToPlayUI } from "../ui/HowToPlayUI.js";

export const HowToPlay = {
    el: null,

    show() {
        if (this.el) return;

        this.el = createHowToPlayUI();
        document.body.appendChild(this.el);

        requestAnimationFrame(() => {
            this.el.classList.add("visible");
        });

        this.el.querySelector("#htp-close-btn").onclick = () => {
            this.hide();
        };
    },

    hide() {
        if (!this.el) return;

        this.el.classList.remove("visible");
        setTimeout(() => {
            this.el.remove();
            this.el = null;
        }, 300);
    }
};
