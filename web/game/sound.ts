class SoundManager {
  private musicAudio: HTMLAudioElement | null = null;
  private currentMusicUrl: string = '';
  public musicVolume: number = 0.5;
  public seVolume: number = 0.6;
  public isMuted: boolean = false;

  private soundUrls: Record<string, string> = {
    theme: '/res/sound/BlueBoyAdventure.wav',
    merchant: '/res/sound/Merchant.wav',
    coin: '/res/sound/coin.wav',
    powerup: '/res/sound/powerup.wav',
    unlock: '/res/sound/unlock.wav',
    fanfare: '/res/sound/fanfare.wav',
    hitmonster: '/res/sound/hitmonster.wav',
    receivedamage: '/res/sound/receivedamage.wav',
    swingweapon: '/res/sound/swingweapon.wav',
    levelup: '/res/sound/levelup.wav',
    cursor: '/res/sound/cursor.wav',
    burning: '/res/sound/burning.wav',
    cuttree: '/res/sound/cuttree.wav',
    gameover: '/res/sound/gameover.wav',
    stairs: '/res/sound/stairs.wav',
    chipwall: '/res/sound/chipwall.wav',
    dooropen: '/res/sound/dooropen.wav',
    parry: '/res/sound/parry.wav',
    speak: '/res/sound/speak.wav',
    sleep: '/res/sound/sleep.wav',
    blocked: '/res/sound/blocked.wav',
  };

  private audioPool: Map<string, HTMLAudioElement[]> = new Map();

  playMusic(name: 'theme' | 'merchant') {
    const url = this.soundUrls[name];
    if (!url) return;

    if (this.musicAudio && this.currentMusicUrl === url) {
      if (this.musicAudio.paused && !this.isMuted) {
        this.musicAudio.play().catch(() => {});
      }
      return;
    }

    this.stopMusic();

    try {
      this.currentMusicUrl = url;
      this.musicAudio = new Audio(url);
      this.musicAudio.loop = true;
      this.musicAudio.volume = this.isMuted ? 0 : this.musicVolume;
      this.musicAudio.play().catch(() => {
        // User hasn't interacted yet; will resume on first input
      });
    } catch (e) {
      console.warn('Could not play music:', e);
    }
  }

  stopMusic() {
    if (this.musicAudio) {
      try {
        this.musicAudio.pause();
        this.musicAudio.currentTime = 0;
      } catch (e) {}
      this.musicAudio = null;
      this.currentMusicUrl = '';
    }
  }

  playSE(name: string) {
    if (this.isMuted) return;
    const url = this.soundUrls[name];
    if (!url) return;

    try {
      let pool = this.audioPool.get(name);
      if (!pool) {
        pool = [];
        this.audioPool.set(name, pool);
      }

      let audio = pool.find((a) => a.paused || a.ended);
      if (!audio) {
        if (pool.length < 5) {
          audio = new Audio(url);
          pool.push(audio);
        } else {
          audio = pool[0];
          audio.currentTime = 0;
        }
      }

      audio.volume = this.seVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {
      // Audio playback error fallback
    }
  }

  setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicAudio) {
      this.musicAudio.volume = this.isMuted ? 0 : this.musicVolume;
    }
  }

  setSEVolume(vol: number) {
    this.seVolume = Math.max(0, Math.min(1, vol));
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.musicAudio) {
      this.musicAudio.volume = this.isMuted ? 0 : this.musicVolume;
    }
    return this.isMuted;
  }
}

export const sounds = new SoundManager();
