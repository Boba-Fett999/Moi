/**
 * Ultra-Fluid Piano & Solfège Vocal Audio Engine
 * Features:
 * - Studio-grade acoustic piano physical modeling (warm string harmonics, felt hammer transient, soundboard body resonance)
 * - Built-in Vocal Solfège Formant Synthesizer (sings Do-Ré-Mi in real-time tune with zero stutter)
 * - Master Dynamics Compressor & Smooth Voice Allocation (prevents clipping, zero clicks)
 */

interface VoiceFormants {
  f1: number; // Formant 1 (Hz)
  f2: number; // Formant 2 (Hz)
  gain1: number;
  gain2: number;
}

// Formants for French solfège vowels [o, e, i, a]
const SOLFEGE_FORMANTS: Record<string, VoiceFormants> = {
  'Do': { f1: 500, f2: 1000, gain1: 1.0, gain2: 0.6 },
  'Do♯': { f1: 450, f2: 1100, gain1: 1.0, gain2: 0.6 },
  'Ré♭': { f1: 420, f2: 1900, gain1: 1.0, gain2: 0.7 },
  'Ré': { f1: 400, f2: 2100, gain1: 1.0, gain2: 0.7 },
  'Ré♯': { f1: 380, f2: 2200, gain1: 1.0, gain2: 0.7 },
  'Mi♭': { f1: 320, f2: 2500, gain1: 1.0, gain2: 0.8 },
  'Mi': { f1: 300, f2: 2700, gain1: 1.0, gain2: 0.8 },
  'Fa': { f1: 800, f2: 1300, gain1: 1.0, gain2: 0.65 },
  'Fa♯': { f1: 750, f2: 1400, gain1: 1.0, gain2: 0.65 },
  'Sol♭': { f1: 520, f2: 950, gain1: 1.0, gain2: 0.6 },
  'Sol': { f1: 500, f2: 900, gain1: 1.0, gain2: 0.6 },
  'Sol♯': { f1: 780, f2: 1350, gain1: 1.0, gain2: 0.65 },
  'La♭': { f1: 820, f2: 1250, gain1: 1.0, gain2: 0.65 },
  'La': { f1: 800, f2: 1300, gain1: 1.0, gain2: 0.65 },
  'La♯': { f1: 330, f2: 2400, gain1: 1.0, gain2: 0.75 },
  'Si♭': { f1: 320, f2: 2500, gain1: 1.0, gain2: 0.8 },
  'Si': { f1: 300, f2: 2700, gain1: 1.0, gain2: 0.8 },
};

class PianoAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbGain: GainNode | null = null;
  private mediaStreamDest: MediaStreamAudioDestinationNode | null = null;
  private isMuted: boolean = false;
  private activeVoices: Map<number, { stop: () => void }> = new Map();
  private lastSpokenTime: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Compressor (studio glue for silky smooth polyphony)
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      // Create stream destination for video recording
      this.mediaStreamDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.mediaStreamDest);
      this.compressor.connect(this.ctx.destination);

      // Algorithmic warm acoustic concert reverb
      this.createReverb();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createReverb() {
    if (!this.ctx || !this.compressor) return;
    try {
      const rate = this.ctx.sampleRate;
      const length = Math.floor(rate * 1.8);
      const impulse = this.ctx.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (rate * 0.45));
        left[i] = (Math.random() * 2 - 1) * decay * 0.12;
        right[i] = (Math.random() * 2 - 1) * decay * 0.12;
      }

      const reverbNode = this.ctx.createConvolver();
      reverbNode.buffer = impulse;

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

      reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.compressor);
    } catch (e) {
      console.warn('Reverb creation skipped:', e);
    }
  }

  public getAudioStream(): MediaStreamTrack | null {
    this.initContext();
    if (this.mediaStreamDest && this.mediaStreamDest.stream.getAudioTracks().length > 0) {
      return this.mediaStreamDest.stream.getAudioTracks()[0];
    }
    return null;
  }

  public midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Play rich acoustic piano note with smooth attack and natural string damping
   */
  public playNote(midi: number, duration: number = 0.8, velocity: number = 0.8) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const freq = this.midiToFrequency(midi);
    const now = this.ctx.currentTime;

    // Smooth voice stealing with crossfade (no clicks!)
    if (this.activeVoices.has(midi)) {
      try {
        this.activeVoices.get(midi)?.stop();
      } catch {}
      this.activeVoices.delete(midi);
    }

    const noteGain = this.ctx.createGain();

    // Stereo panning based on key position (bass left, treble right)
    if (this.ctx.createStereoPanner) {
      const panNode = this.ctx.createStereoPanner();
      const panValue = Math.max(-0.55, Math.min(0.55, (midi - 60) / 42));
      panNode.pan.setValueAtTime(panValue, now);
      noteGain.connect(panNode);
      panNode.connect(this.masterGain);
    } else {
      noteGain.connect(this.masterGain);
    }

    // Lowpass filter modeling the felt hammer strike & keyboard tracking
    // Lower notes have darker harmonics; higher notes have clearer, chimey tops
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoffFreq = Math.min(12000, Math.max(1200, freq * 6));
    filter.frequency.setValueAtTime(cutoffFreq, now);
    filter.frequency.exponentialRampToValueAtTime(cutoffFreq * 0.4, now + duration);

    filter.connect(noteGain);

    // Warm Multi-Harmonic Physical Model:
    // Fundamental + Octave + 5th + High Ring
    const harmonics = [
      { ratio: 1.0, type: 'triangle' as OscillatorType, gain: 0.65 },
      { ratio: 2.0, type: 'sine' as OscillatorType, gain: 0.28 },
      { ratio: 3.01, type: 'sine' as OscillatorType, gain: 0.12 },
      { ratio: 4.02, type: 'sine' as OscillatorType, gain: 0.05 },
    ];

    const oscillators: OscillatorNode[] = [];

    harmonics.forEach(({ ratio, type, gain }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq * ratio, now);

      const hGain = this.ctx.createGain();
      hGain.gain.setValueAtTime(gain * velocity, now);

      osc.connect(hGain);
      hGain.connect(filter);
      osc.start(now);
      oscillators.push(osc);
    });

    // Felt Hammer Strike Transient (warm click)
    const hammerBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.012), this.ctx.sampleRate);
    const hammerData = hammerBuffer.getChannelData(0);
    for (let i = 0; i < hammerData.length; i++) {
      hammerData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.0025));
    }
    const hammerSource = this.ctx.createBufferSource();
    hammerSource.buffer = hammerBuffer;
    const hammerFilter = this.ctx.createBiquadFilter();
    hammerFilter.type = 'bandpass';
    hammerFilter.frequency.setValueAtTime(freq * 1.6, now);
    hammerSource.connect(hammerFilter);
    hammerFilter.connect(filter);
    hammerSource.start(now);

    // Smooth Natural Acoustic Envelope:
    // Immediate felt strike (0.004s), natural decay to warm sustain, gentle exponential fade
    const attackTime = 0.004;
    const sustainTime = Math.max(0.12, duration * 0.88);
    const releaseTime = Math.min(1.4, Math.max(0.5, duration * 0.6));

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.linearRampToValueAtTime(velocity, now + attackTime);
    noteGain.gain.exponentialRampToValueAtTime(velocity * 0.55, now + attackTime + 0.09);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + sustainTime + releaseTime);

    const stopTime = now + sustainTime + releaseTime + 0.08;

    oscillators.forEach(osc => {
      try {
        osc.stop(stopTime);
      } catch {}
    });

    const voice = {
      stop: () => {
        try {
          if (this.ctx) {
            noteGain.gain.cancelScheduledValues(this.ctx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.06);
          }
          oscillators.forEach(o => {
            try { o.stop(now + 0.08); } catch {}
          });
        } catch {}
      },
    };

    this.activeVoices.set(midi, voice);
    setTimeout(() => {
      if (this.activeVoices.get(midi) === voice) {
        this.activeVoices.delete(midi);
      }
    }, (sustainTime + releaseTime + 0.1) * 1000);
  }

  /**
   * Melodic Vocal Solfège Synthesizer (Vocal Formant Choir)
   * Sings the solfège syllable (Do, Ré, Mi, Fa, Sol, La, Si) directly in pitch
   * with smooth vocal formants and gentle vibrato!
   */
  public singSolfegeVocal(syllable: string, midi: number, duration: number = 0.6) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const cleanSyllable = syllable.replace(/[0-9]/g, '');
    const formants = SOLFEGE_FORMANTS[cleanSyllable] || SOLFEGE_FORMANTS['Do'];
    const freq = this.midiToFrequency(midi);
    const now = this.ctx.currentTime;

    // Vocal glottal source (harmonic saw/triangle)
    const vocalOsc = this.ctx.createOscillator();
    vocalOsc.type = 'sawtooth';
    vocalOsc.frequency.setValueAtTime(freq, now);

    // Subtle gentle vibrato (5.5 Hz)
    const vibrato = this.ctx.createOscillator();
    vibrato.frequency.setValueAtTime(5.5, now);
    const vibratoGain = this.ctx.createGain();
    vibratoGain.gain.setValueAtTime(freq * 0.015, now);
    vibrato.connect(vocalOsc.frequency);
    vibrato.start(now + 0.1);

    // Formant Filter 1
    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(formants.f1, now);
    f1.Q.setValueAtTime(5.0, now);

    // Formant Filter 2
    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(formants.f2, now);
    f2.Q.setValueAtTime(6.0, now);

    const f1Gain = this.ctx.createGain();
    f1Gain.gain.setValueAtTime(formants.gain1 * 0.25, now);

    const f2Gain = this.ctx.createGain();
    f2Gain.gain.setValueAtTime(formants.gain2 * 0.18, now);

    vocalOsc.connect(f1);
    vocalOsc.connect(f2);
    f1.connect(f1Gain);
    f2.connect(f2Gain);

    const vocalMasterGain = this.ctx.createGain();
    f1Gain.connect(vocalMasterGain);
    f2Gain.connect(vocalMasterGain);

    // Smooth vocal envelope
    vocalMasterGain.gain.setValueAtTime(0.0001, now);
    vocalMasterGain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    vocalMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.15);

    vocalMasterGain.connect(this.masterGain);

    vocalOsc.start(now);
    const stopTime = now + duration + 0.2;
    vocalOsc.stop(stopTime);
    vibrato.stop(stopTime);
  }

  public playMetronomeTick(isStrongBeat: boolean) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isStrongBeat ? 1600 : 900, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setMasterVolume(vol: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  /**
   * Smooth speech synthesis with debounce so words don't cut off or stutter
   */
  public speakSolfege(syllable: string, midi?: number) {
    // Also trigger melodic vocal formant choir!
    if (midi) {
      this.singSolfegeVocal(syllable, midi, 0.45);
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const now = Date.now();
    if (now - this.lastSpokenTime < 180) return; // Prevent stuttering overlap
    this.lastSpokenTime = now;

    try {
      const utterance = new SpeechSynthesisUtterance(syllable);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.35;
      utterance.pitch = 1.05;
      utterance.volume = 0.45;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const pianoEngine = new PianoAudioEngine();
