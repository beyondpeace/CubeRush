export class AudioManager {
  constructor() {
    this.music = new Audio('assets/audio/Cuberush_Theme.mp3');
    this.music.loop = true;
    this.music.volume = 0.6;
    this.started = false;
  }

  startMusic() {
    if (this.started) return;

    this.music.play().catch(() => {
      // browser blocked autoplay — will retry on user gesture
    });
    this.started = true;
  }

  stopMusic() {
    this.music.pause();
    this.music.currentTime = 0;
    this.started = false;
  }
}
