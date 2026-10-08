// Ambient Montreal Urban Soundtrack Engine (Web Audio API)
// Provides a continuous, seamless ambient synth pad soundtrack with zero external network dependencies.

class SoundtrackManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private hasInitialized = false;

  // Chord progression: Dm9 -> Bbmaj7 -> Fmaj7 -> C(add9)
  // Frequencies in Hz
  private chords = [
    [146.83, 220.00, 261.63, 329.63, 440.00], // D3, A3, C4, E4, A4
    [116.54, 174.61, 233.08, 293.66, 349.23], // Bb2, F3, Bb3, D4, F4
    [174.61, 261.63, 329.63, 392.00, 523.25], // F3, C4, E4, G4, C5
    [130.81, 196.00, 261.63, 293.66, 392.00], // C3, G3, C4, D4, G4
  ];
  private currentChordIndex = 0;

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  public async start(): Promise<boolean> {
    try {
      this.initContext();
      if (!this.ctx) return false;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (this.isPlaying) return true;

      this.isPlaying = true;
      this.hasInitialized = true;
      this.playAmbientChordCycle();

      // Schedule next chord every 6 seconds seamlessly
      this.intervalId = window.setInterval(() => {
        if (this.isPlaying && this.ctx && this.ctx.state === 'running') {
          this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
          this.playAmbientChordCycle();
        }
      }, 6000);

      return true;
    } catch (e) {
      console.warn('Audio autoplay blocked until user interaction', e);
      return false;
    }
  }

  private playAmbientChordCycle() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const chord = this.chords[this.currentChordIndex];
    const now = this.ctx.currentTime;
    const duration = 7.5; // slight overlap for seamless crossfade

    // Create a stereo filter for warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(850, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(420, now + duration);

    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.001, now);
    chordGain.gain.linearRampToValueAtTime(0.12, now + 2.0); // slow gentle attack
    chordGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // smooth release

    filter.connect(chordGain);
    chordGain.connect(this.masterGain);

    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      // Alternate between warm sine and triangle waves
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      
      // Gentle detuning for lush stereo chorusing
      const detune = (idx - 2) * 5;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      osc.connect(filter);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public toggleMute(): boolean {
    if (!this.masterGain || !this.ctx) {
      this.start();
      return true;
    }
    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : 0.18;
    this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    return !this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getHasInitialized(): boolean {
    return this.hasInitialized;
  }
}

export const soundtrack = new SoundtrackManager();
