// Synthesized sound effects using the Web Audio API
class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Realistic paper turn sound
  public playPageTurn() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.28; // ~280ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft pink/brown paper friction noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to mimic paper texture
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + 0.25);
      filter.Q.setValueAtTime(1.8, now);

      // Amplitude envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.28);
    } catch {
      // Ignore audio synthesis errors on strict autoplay policies
    }
  }

  // Delicate antique music box chime
  public playChime(freq = 659.25) {
    // E5 default
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Primary tone
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Overtone for metallic tine resonance
      const overtone = ctx.createOscillator();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2.76, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      const overGain = ctx.createGain();
      overGain.gain.setValueAtTime(0.04, now);
      overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      overtone.connect(overGain);
      gain.connect(ctx.destination);
      overGain.connect(ctx.destination);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 1.2);
      overtone.stop(now + 1.2);
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const audio = new AudioManager();
