/* =========================================================
   SurTaal Pro — Lightweight Web Audio Synth Engine
   ========================================================= */

class SurSynthEngine {
  constructor() {
    this.ctx = null;
    this.tanpuraNodes = null;
    this.buffers = {
      clickSam: null,
      clickOther: null,
      tablaLoop: null,
      harmonium: null
    };
    this.currentTablaLoop = null;
    
    // Harmonium engine constants
    this.HARMONIUM_SAMPLE_FREQ = 293.66; // D4 (MIDI 62)
    this.HARMONIUM_LOOP_START = 1.2;
    this.HARMONIUM_LOOP_END = 2.5;
    this.activeHarmoniumNotes = new Map();
  }

  async loadBuffers() {
    const c = this.getCtx();
    const BASE_TABLA_URL = "https://mojhivqchmrifaalrmsq.supabase.co/storage/v1/object/public/tabla";
    
    const load = async (url) => {
      try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        return await c.decodeAudioData(arrayBuffer);
      } catch (e) {
        console.error("Failed to load", url, e);
        return null;
      }
    };

    // Fetch all audio buffers concurrently
    const [clickSam, clickOther, tablaLoop, harmonium] = await Promise.all([
      load(`${BASE_TABLA_URL}/metronome1.mp3`),
      load(`${BASE_TABLA_URL}/metronome2.mp3`),
      load(`${BASE_TABLA_URL}/MWV%20Tabla%20Loop%201.wav`),
      load(`https://mojhivqchmrifaalrmsq.supabase.co/storage/v1/object/public/harmonium/harmonium-kannan-sustain.wav`)
    ]);

    this.buffers.clickSam = clickSam;
    this.buffers.clickOther = clickOther;
    this.buffers.tablaLoop = tablaLoop;
    this.buffers.harmonium = harmonium;
  }

  getCtx() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  resume() {
    const c = this.getCtx();
    if (c.state === 'suspended') c.resume();
    return c;
  }

  noiseBuffer(c, duration) {
    const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  playTone(c, time, { freq, dur, type = 'sine', gain = 0.6, decay = 0.25, detune = 0 }) {
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    osc.detune.setValueAtTime(detune, time);

    const amp = c.createGain();
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + dur * decay + 0.05);

    osc.connect(amp).connect(c.destination);
    osc.start(time);
    osc.stop(time + dur + 0.1);
  }

  playThump(c, time, { freq = 90, dur = 0.35, gain = 0.9 }) {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.8, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, time + dur * 0.5);

    const amp = c.createGain();
    amp.gain.setValueAtTime(0.0001, time);
    amp.gain.exponentialRampToValueAtTime(gain, time + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(amp).connect(c.destination);
    osc.start(time);
    osc.stop(time + dur + 0.1);
  }

  playClick(c, time, { freq = 1800, dur = 0.05, gain = 0.5 }) {
    const noise = c.createBufferSource();
    noise.buffer = this.noiseBuffer(c, dur);
    const filt = c.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = freq;
    const amp = c.createGain();
    amp.gain.setValueAtTime(gain, time);
    amp.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    noise.connect(filt).connect(amp).connect(c.destination);
    noise.start(time);
    noise.stop(time + dur + 0.02);
  }

  getKits() {
    return {
      tabla: {
        Dha:  (c,t)=>{ this.playTone(c,t,{freq:220,dur:.5,type:'triangle',gain:.55,decay:.5}); this.playThump(c,t,{freq:85,dur:.45,gain:.85}); },
        Dhin: (c,t)=>{ this.playTone(c,t,{freq:246,dur:.55,type:'triangle',gain:.55,decay:.55}); this.playThump(c,t,{freq:80,dur:.5,gain:.8}); },
        Na:   (c,t)=>{ this.playTone(c,t,{freq:520,dur:.18,type:'triangle',gain:.5,decay:.3}); },
        Tin:  (c,t)=>{ this.playTone(c,t,{freq:480,dur:.35,type:'triangle',gain:.5,decay:.4}); },
        Ta:   (c,t)=>{ this.playTone(c,t,{freq:440,dur:.12,type:'square',gain:.35,decay:.2}); },
        Ge:   (c,t)=>{ this.playThump(c,t,{freq:70,dur:.5,gain:.8}); },
        Ga:   (c,t)=>{ this.playThump(c,t,{freq:70,dur:.5,gain:.8}); },
        Ka:   (c,t)=>{ this.playClick(c,t,{freq:900,dur:.06,gain:.4}); this.playThump(c,t,{freq:60,dur:.12,gain:.4}); },
        Kat:  (c,t)=>{ this.playClick(c,t,{freq:900,dur:.06,gain:.4}); },
        Tirakita: (c,t)=>{ this.playTone(c,t,{freq:600,dur:.1,type:'triangle',gain:.35,decay:.3}); },
        Dhage: (c,t)=>{ this.playTone(c,t,{freq:300,dur:.3,type:'triangle',gain:.5}); this.playThump(c,t,{freq:80,dur:.3,gain:.6}); },
        _default: (c,t)=>{ this.playTone(c,t,{freq:400,dur:.2,type:'triangle',gain:.4}); }
      },
      pakhawaj: {
        Dha:  (c,t)=>{ this.playTone(c,t,{freq:160,dur:.5,type:'sine',gain:.6}); this.playThump(c,t,{freq:75,dur:.5,gain:.9}); },
        Dhin: (c,t)=>{ this.playTone(c,t,{freq:180,dur:.55,type:'sine',gain:.6}); this.playThump(c,t,{freq:70,dur:.55,gain:.85}); },
        Ta:   (c,t)=>{ this.playTone(c,t,{freq:380,dur:.2,type:'sine',gain:.4}); },
        Ga:   (c,t)=>{ this.playThump(c,t,{freq:65,dur:.5,gain:.8}); },
        _default: (c,t)=>{ this.playTone(c,t,{freq:250,dur:.3,type:'sine',gain:.5}); }
      },
      mridangam: {
        Tha:  (c,t)=>{ this.playTone(c,t,{freq:500,dur:.2,type:'triangle',gain:.5}); },
        Dhi:  (c,t)=>{ this.playTone(c,t,{freq:560,dur:.2,type:'triangle',gain:.5}); },
        Thom: (c,t)=>{ this.playThump(c,t,{freq:90,dur:.45,gain:.85}); },
        Nam:  (c,t)=>{ this.playTone(c,t,{freq:420,dur:.15,type:'square',gain:.35}); },
        _default: (c,t)=>{ this.playTone(c,t,{freq:450,dur:.2,type:'triangle',gain:.45}); }
      },
      click: {
        _default: (c,t)=>{ this.playClick(c,t,{freq:2000,dur:.05,gain:.55}); }
      }
    };
  }

  playTablaLoop(time, bpm, subdivision = 1, offsetBeats = 0) {
    if (!this.buffers.tablaLoop) return;
    const c = this.getCtx();
    
    if (this.currentTablaLoop) {
      try { this.currentTablaLoop.stop(time); } catch {}
    }
    
    const source = c.createBufferSource();
    source.buffer = this.buffers.tablaLoop;
    source.loop = true; 
    // The original loop is essentially at 200 BPM effective matra rate (2 syllables per beat at 100BPM).
    source.playbackRate.value = (bpm * subdivision) / 200;
    
    const gainNode = c.createGain();
    gainNode.gain.value = 1.0;
    
    source.connect(gainNode);
    gainNode.connect(c.destination);
    
    // 1 matra at 200 BPM = 0.3 seconds.
    const offsetSeconds = (offsetBeats % 16) * 0.3;
    source.start(time, offsetSeconds);
    
    this.currentTablaLoop = source;
    this.lastTablaBpm = bpm;
    this.lastTablaSubdivision = subdivision;
  }

  stopTablaLoop() {
    if (this.currentTablaLoop) {
      try { this.currentTablaLoop.stop(); } catch {}
      this.currentTablaLoop = null;
    }
  }

  updateTablaLoopBpm(bpm, subdivision = 1) {
    if (this.currentTablaLoop) {
      const c = this.getCtx();
      this.currentTablaLoop.playbackRate.setValueAtTime((bpm * subdivision) / 200, c.currentTime);
    }
  }

  playSampledClick(time, type) {
    const c = this.getCtx();
    const buffer = (type === 'sam' || type === 'tali') ? this.buffers.clickSam : this.buffers.clickOther;
    if (!buffer) return;
    
    const source = c.createBufferSource();
    source.buffer = buffer;
    const gainNode = c.createGain();
    gainNode.gain.value = type === 'sub' ? 0.3 : 1.0;
    
    source.connect(gainNode);
    gainNode.connect(c.destination);
    source.start(time);
  }

  playBol(kitName, bol, time, roleAccent) {
    const c = this.resume();
    const kits = this.getKits();
    const kit = kits[kitName] || kits.tabla;
    const fn = kit[bol] || kit._default;
    
    fn(c, time);
    
    if (roleAccent === 'sam') {
      this.playClick(c, time, { freq: 3000, dur: 0.03, gain: 0.18 });
    }
  }

  startTanpura(baseFreq) {
    const c = this.resume();
    this.stopTanpura();
    
    const master = c.createGain();
    master.gain.value = 0.18;
    master.connect(c.destination);

    const ratios = [1, 1.5, 1, 2]; // Sa, Pa, Sa, Sa(upper)
    const nodes = [];
    
    ratios.forEach((ratio) => {
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = baseFreq * ratio;
      const filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 900;
      const gain = c.createGain();
      gain.gain.value = 0;
      osc.connect(filt).connect(gain).connect(master);
      osc.start();
      nodes.push({ osc, gain, filt });
    });

    let idx = 0;
    const pluckInterval = setInterval(() => {
      const now = c.currentTime;
      const active = nodes[idx % nodes.length];
      active.gain.gain.cancelScheduledValues(now);
      active.gain.gain.setValueAtTime(0.5, now);
      active.gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
      idx++;
    }, 900);

    this.tanpuraNodes = { nodes, master, pluckInterval };
  }

  stopTanpura() {
    if (!this.tanpuraNodes) return;
    clearInterval(this.tanpuraNodes.pluckInterval);
    this.tanpuraNodes.nodes.forEach(n => {
      try { n.osc.stop(); } catch {}
    });
    this.tanpuraNodes = null;
  }

  isTanpuraPlaying() { 
    return !!this.tanpuraNodes; 
  }

  playSargamNote(freq) {
    const c = this.resume();
    const now = c.currentTime;

    // Stop any existing harmonium note
    this.stopSargamNote();

    // Use Authentic Harmonium Sample if loaded
    if (this.buffers.harmonium) {
      const source = c.createBufferSource();
      source.buffer = this.buffers.harmonium;
      source.loopStart = this.HARMONIUM_LOOP_START;
      source.loopEnd = this.HARMONIUM_LOOP_END;
      source.loop = true;
      
      // Calculate playback rate to pitch shift the D4 sample to the desired frequency
      source.playbackRate.value = freq / this.HARMONIUM_SAMPLE_FREQ;

      const gainNode = c.createGain();
      // Smooth attack
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.8, now + 0.1);

      source.connect(gainNode);
      gainNode.connect(c.destination);
      source.start(now);

      // Save references so we can stop it later
      this.currentHarmoniumSource = source;
      this.currentHarmoniumGain = gainNode;
      return;
    }

    // Fallback Synth if buffer isn't loaded
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    const amp = c.createGain();
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(0.4, now + 0.1);

    osc.connect(amp).connect(c.destination);
    osc.start(now);

    this.currentHarmoniumSource = osc;
    this.currentHarmoniumGain = amp;
  }

  updateSargamPitch(freq) {
    if (this.currentHarmoniumSource) {
      if (this.buffers.harmonium) {
        // Shift harmonium sample pitch dynamically
        this.currentHarmoniumSource.playbackRate.setValueAtTime(freq / this.HARMONIUM_SAMPLE_FREQ, this.getCtx().currentTime);
      } else {
        // Shift fallback oscillator dynamically
        this.currentHarmoniumSource.frequency.setValueAtTime(freq, this.getCtx().currentTime);
      }
    }
  }

  stopSargamNote() {
    if (this.currentHarmoniumGain && this.currentHarmoniumSource) {
      const c = this.getCtx();
      const now = c.currentTime;
      
      // Smooth release
      this.currentHarmoniumGain.gain.cancelScheduledValues(now);
      this.currentHarmoniumGain.gain.setValueAtTime(this.currentHarmoniumGain.gain.value, now);
      this.currentHarmoniumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      try {
        this.currentHarmoniumSource.stop(now + 0.6);
      } catch {}
      
      this.currentHarmoniumSource = null;
      this.currentHarmoniumGain = null;
    }
  }
}

export const synth = new SurSynthEngine();