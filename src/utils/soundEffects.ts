/**
 * Synthesizer Audio Engine (Tone.js with Web Audio API Fallback)
 * Reliable, zero-latency, works completely offline without external MP3 files.
 */

import * as Tone from 'tone';

declare global {
  interface Window {
    Tone?: any;
    XLSX?: any;
    html2pdf?: any;
    FirebaseSDK?: any;
    __firebase_config?: any;
  }
}

class SoundEffects {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private toneSynth: Tone.PolySynth | null = null;
  private toneBellSynth: any = null;

  constructor() {
    // Audio will initialize upon first user gesture
  }

  private async ensureToneStarted() {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      if (!this.toneSynth) {
        this.toneSynth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.8 },
        }).toDestination();
        this.toneSynth.volume.value = -4;
      }
    } catch (e) {
      console.warn('Tone.js audio start failed, using fallback', e);
    }
  }

  private initToneIfPossible() {
    this.ensureToneStarted();
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Tinh tinh - Cộng điểm / Tặng hoa thành công
  public playReward() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneSynth) {
      try {
        Tone.start();
        const now = Tone.now();
        this.toneSynth.triggerAttackRelease('C5', '8n', now);
        this.toneSynth.triggerAttackRelease('E5', '8n', now + 0.08);
        this.toneSynth.triggerAttackRelease('G5', '8n', now + 0.16);
        this.toneSynth.triggerAttackRelease('C6', '4n', now + 0.24);
        return;
      } catch (e) {
        // Fallback to Web Audio
      }
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  // TING! - Hạt năng lượng tích tụ & Cây tiến hóa mọc thêm lá
  public playEnergyTing() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneSynth) {
      try {
        Tone.start();
        const now = Tone.now();
        this.toneSynth.triggerAttackRelease('A5', '16n', now);
        this.toneSynth.triggerAttackRelease('E6', '16n', now + 0.06);
        this.toneSynth.triggerAttackRelease('A6', '8n', now + 0.12);
        return;
      } catch (e) {
        // Fallback
      }
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [880, 1318.51, 1760];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.06 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.65);
    });
  }

  // Cây tiến hóa cấp mới (Level Up Fanfare)
  public playLevelUp() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneSynth) {
      try {
        Tone.start();
        const now = Tone.now();
        this.toneSynth.triggerAttackRelease('D5', '8n', now);
        this.toneSynth.triggerAttackRelease('F#5', '8n', now + 0.09);
        this.toneSynth.triggerAttackRelease('A5', '8n', now + 0.18);
        this.toneSynth.triggerAttackRelease('D6', '2n', now + 0.27);
        return;
      } catch (e) {}
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0, now + i * 0.09);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.55);
    });
  }

  // Lá chắn bảo vệ kích hoạt (Shield deflection / Magical barrier)
  public playShieldProtect() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneBellSynth) {
      try {
        Tone.start();
        this.toneBellSynth.triggerAttackRelease('G5', '4n');
        return;
      } catch (e) {}
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 1046.5, 2093.0];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.85);
    });
  }

  // Siêu hoa nở 100 điểm - Đại tiệc Vườn Ươm (Super Bloom Fanfare)
  public playSuperBloom() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneSynth) {
      try {
        Tone.start();
        const now = Tone.now();
        const melody = [
          { note: 'C5', time: 0, dur: '8n' },
          { note: 'E5', time: 0.12, dur: '8n' },
          { note: 'G5', time: 0.24, dur: '8n' },
          { note: 'C6', time: 0.36, dur: '4n' },
          { note: 'E6', time: 0.5, dur: '8n' },
          { note: 'G6', time: 0.65, dur: '2n' },
        ];
        melody.forEach((m) => {
          this.toneSynth.triggerAttackRelease(m.note, m.dur, now + m.time);
        });
        return;
      } catch (e) {}
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.12, d: 0.15 },
      { f: 783.99, t: 0.24, d: 0.15 },
      { f: 1046.50, t: 0.36, d: 0.4 },
      { f: 1318.51, t: 0.5, d: 0.2 },
      { f: 1567.98, t: 0.65, d: 0.8 },
    ];
    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, now + item.t);
      gain.gain.setValueAtTime(0, now + item.t);
      gain.gain.linearRampToValueAtTime(0.35, now + item.t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + item.t + item.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + item.t);
      osc.stop(now + item.t + item.d + 0.05);
    });
  }

  // Mưa nhẹ / Đám mây trôi nhẹ nhàng (Gentle Weather Reminder)
  public playGentleWeather() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const drops = [400, 320, 260];
    drops.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      osc.frequency.exponentialRampToValueAtTime(150, now + i * 0.12 + 0.08);
      gain.gain.setValueAtTime(0.08, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.18);
    });
  }

  // Tiếng chuông trang nghiêm nhắc nhở / trừ điểm
  public playPenalty() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneSynth) {
      try {
        Tone.start();
        const now = Tone.now();
        this.toneSynth.triggerAttackRelease('A3', '8n', now);
        this.toneSynth.triggerAttackRelease('F3', '4n', now + 0.15);
        return;
      } catch (e) {}
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Chuông thanh tịnh / Chuông trật tự lớp học (Classroom Quiet Bell / Gong)
  public playQuietBell() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneBellSynth) {
      try {
        Tone.start();
        this.toneBellSynth.triggerAttackRelease('A4', '2m');
        return;
      } catch (e) {}
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [440, 880, 1320, 1760];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      const amp = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.6);
    });
  }

  public playChimeBell() {
    this.playQuietBell();
  }

  // Âm thanh vỗ tay chúc mừng (Applause & Cheers)
  public playApplause() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneSynth) {
      try {
        Tone.start();
        const now = Tone.now();
        const melody = [
          { n: 'C5', d: '8n', t: 0 },
          { n: 'E5', d: '8n', t: 0.12 },
          { n: 'G5', d: '8n', t: 0.24 },
          { n: 'C6', d: '4n', t: 0.36 },
          { n: 'A5', d: '8n', t: 0.52 },
          { n: 'C6', d: '2n', t: 0.64 },
        ];
        melody.forEach((item) => {
          this.toneSynth.triggerAttackRelease(item.n, item.d, now + item.t);
        });
        return;
      } catch (e) {}
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.50, d: 0.4 },
      { f: 880.00, d: 0.15 },
      { f: 1046.50, d: 0.6 },
    ];
    let t = now;
    melody.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(item.f, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + item.d + 0.05);
      t += item.d * 0.85;
    });
  }

  // Âm thanh kim vòng quay tích tắc (Wheel Tick)
  public playTick() {
    if (!this.soundEnabled) return;
    this.initToneIfPossible();

    if (this.toneSynth) {
      try {
        Tone.start();
        this.toneSynth.triggerAttackRelease('C7', '32n');
        return;
      } catch (e) {}
    }

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Tiếng tíc-tắc đồng hồ đếm ngược nhịp điệu êm ái (Regular Timer Tick)
  public playTimerTickRegular() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  // Tiếng tíc-tắc dồn dập cao độ trong 10 giây cuối cùng (Urgent Final Countdown Tick)
  public playTimerTickUrgent(secondsLeft: number) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      // Pitch increases as secondsLeft goes from 10 down to 1
      const pitchMultiplier = 1 + (10 - Math.max(1, secondsLeft)) * 0.12;
      const baseFreq = 950 * pitchMultiplier;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.065);
      osc2.stop(now + 0.065);
    } catch (e) {}
  }

  // Âm thanh chuông báo hết giờ hoành tráng (Timer Alarm Fanfare)
  public async playTimerAlarm() {
    if (!this.soundEnabled) return;
    try {
      await this.ensureToneStarted();
      if (this.toneSynth) {
        const now = Tone.now();
        // 3-Stage School Bell Chime & Fanfare
        this.toneSynth.triggerAttackRelease(['C5', 'G5'], '8n', now);
        this.toneSynth.triggerAttackRelease(['E5', 'B5'], '8n', now + 0.18);
        this.toneSynth.triggerAttackRelease(['G5', 'D6'], '8n', now + 0.36);
        this.toneSynth.triggerAttackRelease(['C6', 'E6', 'G6'], '2n', now + 0.54);
        return;
      }
    } catch (e) {}

    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const t = now + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880 + i * 110, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    }
  }

  // Âm thanh hồi hộp / Drumroll trước khi công bố
  public playDrumroll() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 12; i++) {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 + (i % 3) * 15, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.055);
    }
  }

  // Click nhẹ nhàng
  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Âm thanh tíc-tắc tăng tốc khi quay gọi tên ngẫu nhiên
  public playToneDramaticTick(pitchFactor: number = 1.0) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 * pitchFactor, now);
      osc.frequency.exponentialRampToValueAtTime(1200 * pitchFactor, now + 0.025);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {
      // Ignore audio glitches
    }
  }

  // Hợp âm PolySynth rộn rã vinh danh người chiến thắng
  public async playPolySynthTriumph() {
    if (!this.soundEnabled) return;
    try {
      await this.ensureToneStarted();
      if (this.toneSynth) {
        const now = Tone.now();
        // Fanfare chord progression C Major 9 -> F Major 7 -> G Major -> C Triumph
        this.toneSynth.triggerAttackRelease(['C4', 'E4', 'G4', 'B4', 'D5'], '8n', now);
        this.toneSynth.triggerAttackRelease(['F4', 'A4', 'C5', 'E5'], '8n', now + 0.22);
        this.toneSynth.triggerAttackRelease(['G4', 'B4', 'D5', 'F5'], '8n', now + 0.44);
        this.toneSynth.triggerAttackRelease(['C4', 'G4', 'C5', 'E5', 'G5'], '2n', now + 0.66);
      } else {
        this.playLevelUp();
        setTimeout(() => this.playApplause(), 300);
      }
    } catch (e) {
      this.playLevelUp();
      setTimeout(() => this.playApplause(), 300);
    }
  }

  // Tiếng vịt kêu hoạt hình vui nhộn "Quạc quạc!" (Duck Quack)
  public playDuckQuack() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 2 consecutive quacks
      [0, 0.16].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        // Formant pitch drop for duck quack
        osc.frequency.setValueAtTime(320, now + offset);
        osc.frequency.linearRampToValueAtTime(220, now + offset + 0.12);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(850, now + offset);
        filter.Q.setValueAtTime(3.5, now + offset);

        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.2, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    } catch (e) {}
  }

  // Còi xuất phát cuộc đua (Race Start Whistle)
  public playRaceWhistle() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.linearRampToValueAtTime(2800, now + 0.1);
      osc.frequency.linearRampToValueAtTime(2600, now + 0.35);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  // Tiếng nước bắn / bơi lội vui nhộn (Water Splash / Bubble)
  public playWaterSplash() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const offset = i * 0.05;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const startFreq = 400 + Math.random() * 300;
        osc.frequency.setValueAtTime(startFreq, now + offset);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, now + offset + 0.06);

        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      }
    } catch (e) {}
  }

  // Tiếng bóng bay nổ "POP!" vui nhộn
  public playBalloonPop() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Fast pitch drop oscillator for "thump"
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

      oscGain.gain.setValueAtTime(0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // Noise burst for the "POP" snap
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.07);
    } catch (e) {}
  }

  // Tiếng trứng nứt "Crack - Crunch"
  public playEggCrack() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [0, 0.04, 0.08].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1600 + Math.random() * 600, now + delay);
        osc.frequency.exponentialRampToValueAtTime(300, now + delay + 0.03);

        gain.gain.setValueAtTime(0.12, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.04);
      });
    } catch (e) {}
  }

  // Tiếng trứng nở / ánh sáng lấp lánh kỳ diệu
  public playEggHatch() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.26);
      });
    } catch (e) {}
  }

  // Tiếng cá cắn câu & cuộn dây câu
  public playFishBite() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Water "bloop"
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);

      // Reel clicks
      [0.1, 0.16, 0.22, 0.28].forEach((offset) => {
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(2200, now + offset);
        clickGain.gain.setValueAtTime(0.06, now + offset);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.02);

        clickOsc.connect(clickGain);
        clickGain.connect(ctx.destination);
        clickOsc.start(now + offset);
        clickOsc.stop(now + offset + 0.025);
      });
    } catch (e) {}
  }

  // Tiếng chuông Ting! nhẹ nhàng
  public playTing() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      osc.frequency.setValueAtTime(2637, now + 0.08); // E7

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    } catch (e) {}
  }

  // Tiếng tăng tốc bất ngờ (Speed Boost / Zap)
  public playDuckBoost() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
  }

  // Tiếng nước vỗ bì bõm / rẽ sóng
  public playDuckSplash() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } catch (e) {}
  }

  // Tiếng cạch kim vòng quay (Wheel Tick / Peg Click)
  public playWheelTick(pitchMultiplier = 1.0) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 750 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.035);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(400, now);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {}
  }

  // Tiếng hồi hộp vòng quay sắp dừng (Suspense Hum)
  public playWheelSuspense() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.6);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.68);
    } catch (e) {}
  }

  // Tiếng reo chiến thắng vòng quay
  public playWheelWin() {
    if (!this.soundEnabled) return;
    this.playReward();
  }
}

export const sound = new SoundEffects();

