export const OrientationOverlay = {
  overlay: null,
  isMobile: false,

  init() {
    this.overlay = document.getElementById("rotate-overlay");

    this.isMobile =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    if (!this.isMobile) return;

    const check = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      if (isPortrait) {
        this.overlay.classList.add("active");
      } else {
        this.overlay.classList.remove("active");
      }
    };

    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    check();
  }
};
