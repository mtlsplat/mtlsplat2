// Ambient Montreal Urban Soundtrack Engine (Web Audio API)
// Provides a continuous, seamless ambient synth pad soundtrack with zero external network dependencies.

type AudioStateListener = (isPlaying: boolean) => void;

class SoundtrackManager {
  private ctx: AudioContext | null = null;
  private isDesiredPlaying = true; // Always ON by default on page open
  private isChordCycleRunning = false;
  private masterGain: GainNode | null = null;
  private intervalId: number | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  private unlockListenersAttached = false;

  // Chord progression: Dm9 -> Bbmaj7 -> Fmaj7 -> C(add9)
  // Frequencies in Hz
  private chords = [
    [146.83, 220.00, 261.63, 329.63, 440.00], // D3, A3, C4, E4, A4 (Dm9)
    [116.54, 174.61, 233.08, 293.66, 349.23], // Bb2, F3, Bb3, D4, F4 (Bbmaj7)
    [174.61, 261.63, 329.63, 392.00, 523.25], // F3, C4, E4, G4, C5 (Fmaj7)
    [130.81, 196.00, 261.63, 293.66, 392.00], // C3, G3, C4, D4, G4 (Cadd9)
  ];
  private currentChordIndex = 0;

  constructor() {
    // Music is enabled by default on page open
    this.isDesiredPlaying = true;
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isDesiredPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const active = this.isDesiredPlaying;
    this.listeners.forEach((listener) => {
      try {
        listener(active);
      } catch (err) {
        console.error('Audio listener error', err);
      }
    });
  }

  private initContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return null;

      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.20, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Listen for browser audio context state changes
      this.ctx.onstatechange = () => {
        if (this.ctx?.state === 'running' && this.isDesiredPlaying) {
          this.startChordCycle();
        } else if (this.ctx?.state === 'suspended') {
          this.notifyListeners();
        }
      };

      return this.ctx;
    } catch (e) {
      console.warn('Unable to initialize Web Audio context', e);
      return null;
    }
  }

  // Ensures user gestures immediately unlock the Web Audio context if browser blocks autoplay
  private attachUnlockListeners() {
    if (this.unlockListenersAttached) return;
    this.unlockListenersAttached = true;

    const unlockHandler = async () => {
      if (!this.isDesiredPlaying) return;

      if (!this.ctx) {
        this.initContext();
      }

      if (this.ctx && (this.ctx.state as AudioContextState) === 'suspended') {
        try {
          await this.ctx.resume();
          if ((this.ctx.state as AudioContextState) === 'running') {
            this.startChordCycle();
            removeUnlockListeners();
          }
        } catch {
          // ignore until next gesture
        }
      } else if (this.ctx && (this.ctx.state as AudioContextState) === 'running') {
        this.startChordCycle();
        removeUnlockListeners();
      }
    };

    const removeUnlockListeners = () => {
      ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'click', 'scroll', 'wheel'].forEach((event) => {
        window.removeEventListener(event, unlockHandler);
        document.removeEventListener(event, unlockHandler);
      });
      this.unlockListenersAttached = false;
    };

    ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'click', 'scroll', 'wheel'].forEach((event) => {
      window.addEventListener(event, unlockHandler, { passive: true });
      document.addEventListener(event, unlockHandler, { passive: true });
    });
  }

  public async start(): Promise<boolean> {
    this.isDesiredPlaying = true;
    try {
      localStorage.setItem('mtlsplat_audio_enabled', 'true');
    } catch {
      // ignore storage error
    }

    const ctx = this.initContext();
    if (!ctx) return false;

    // Attach unlock listeners immediately in case browser suspends autoplay
    this.attachUnlockListeners();

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (ctx.state === 'running') {
        this.startChordCycle();
        this.notifyListeners();
        return true;
      }
    } catch (e) {
      console.warn('Autoplay suspended by browser, waiting for user gesture', e);
    }

    this.notifyListeners();
    return false;
  }

  private startChordCycle() {
    if (!this.ctx || !this.masterGain || !this.isDesiredPlaying) return;
    if (this.ctx.state !== 'running') return;

    if (this.isChordCycleRunning) {
      this.notifyListeners();
      return;
    }

    this.isChordCycleRunning = true;
    try {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0.20, this.ctx.currentTime);
    } catch {
      // ignore
    }

    // Play first chord immediately
    this.playAmbientChordCycle();

    // Schedule subsequent chords every 6 seconds seamlessly
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      if (this.isDesiredPlaying && this.ctx && this.ctx.state === 'running') {
        this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;
        this.playAmbientChordCycle();
      }
    }, 6000);

    this.notifyListeners();
  }

  private playAmbientChordCycle() {
    if (!this.ctx || !this.masterGain || !this.isDesiredPlaying) return;
    if (this.ctx.state !== 'running') return;

    const chord = this.chords[this.currentChordIndex];
    const now = this.ctx.currentTime;
    const duration = 7.5; // slight overlap for smooth crossfade

    try {
      // Create a warm lowpass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(850, now + duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(420, now + duration);

      const chordGain = this.ctx.createGain();
      chordGain.gain.setValueAtTime(0.0001, now);
      chordGain.gain.linearRampToValueAtTime(0.14, now + 1.8); // slow gentle attack
      chordGain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // smooth release

      filter.connect(chordGain);
      chordGain.connect(this.masterGain);

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        // Alternate between warm sine and triangle waves
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';

        // Gentle stereo detuning for rich chorus texture
        const detune = (idx - 2) * 5;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);

        osc.connect(filter);
        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (err) {
      console.warn('Error during chord cycle synthesis', err);
    }
  }

  public stop() {
    this.isDesiredPlaying = false;
    this.isChordCycleRunning = false;
    try {
      localStorage.setItem('mtlsplat_audio_enabled', 'false');
    } catch {
      // ignore
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      } catch {
        // ignore
      }
    }

    this.notifyListeners();
  }

  public toggle(): boolean {
    if (this.isDesiredPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isDesiredPlaying && this.ctx !== null && this.ctx.state === 'running';
  }

  public getIsDesiredPlaying(): boolean {
    return this.isDesiredPlaying;
  }
}

export const soundtrack = new SoundtrackManager();
