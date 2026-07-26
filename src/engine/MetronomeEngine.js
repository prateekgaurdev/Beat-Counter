import { synth } from './synth';

export class MetronomeEngine {
  constructor() {
    this.audioContext = null;
    
    // Core timing
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // s
    this.nextNoteTime = 0.0;
    this.currentBeat = 0;
    this.currentAvartan = 0;
    
    // Config
    this.bpm = 120;
    this.taal = null; // will hold taal object
    this.subdivision = 1;
    this.soundPack = 'tabla';
    this.soundOn = true;
    
    // State
    this.isPlaying = false;
    this.stopRequested = false;
    this.timerID = null;
    this.onBeatListeners = []; // callbacks for UI

    this.worker = this.createWorker();
    this.worker.onmessage = (e) => {
      if (e.data === 'tick') {
        this.scheduler();
      }
    };
  }

  createWorker() {
    const blob = new Blob([`
      let timerID = null;
      let interval = 25;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          timerID = setInterval(() => postMessage('tick'), interval);
        } else if (e.data === 'stop') {
          clearInterval(timerID);
          timerID = null;
        }
      };
    `], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }

  async init() {
    // We now use the shared synth context
    this.audioContext = synth.getCtx();
    await synth.loadBuffers();
  }

  setTaal(taal) {
    this.taal = taal;
    this.bpm = taal.default_bpm;
    if (this.soundPack === 'tabla' && taal.id !== 'teentaal') {
      synth.stopTablaLoop();
    }
  }

  setBpm(bpm) {
    this.bpm = Math.max(20, Math.min(500, bpm));
  }

  setSubdivision(sub) {
    if (this.subdivision === sub) return;
    
    // Scale currentBeat to maintain position in the avartan
    const ratio = sub / this.subdivision;
    this.currentBeat = Math.floor(this.currentBeat * ratio);
    
    this.subdivision = sub;
  }
  
  setSoundPack(pack) {
    this.soundPack = pack;
    if (pack !== 'tabla' || (this.taal && this.taal.id !== 'teentaal')) {
      synth.stopTablaLoop();
    }
  }

  onBeat(callback) {
    this.onBeatListeners.push(callback);
  }

  getBeatType(beatIndex) {
    if (!this.taal) return 'normal';
    
    // Determine which vibhag this beat falls into
    let acc = 0;
    for (let i = 0; i < this.taal.vibhags.length; i++) {
      const v = this.taal.vibhags[i];
      if (beatIndex === acc) {
        return v.type; // 'sam', 'tali', 'khali'
      }
      acc += v.beats;
      if (beatIndex < acc) {
        return 'normal';
      }
    }
    return 'normal';
  }

  playNote(time, type, bol, isSub, mainBeatIndex) {
    if (!this.soundOn || !this.audioContext) return;
    
    if (this.soundPack === 'tabla') {
      if (!isSub && mainBeatIndex === 0) {
        synth.playTablaLoop(time, this.bpm, this.subdivision);
      }
    } else if (this.soundPack === 'click') {
      if (!isSub) synth.playSampledClick(time, type);
    } else {
      synth.playBol(this.soundPack, bol, time, type);
    }
  }

  nextNote() {
    const secondsPerBeat = 60.0 / (this.bpm * this.subdivision);
    this.nextNoteTime += secondsPerBeat;
    
    this.currentBeat++;
    
    const maxBeats = this.taal ? this.taal.maatras * this.subdivision : 12 * this.subdivision;

    if (this.currentBeat >= maxBeats) {
      this.currentBeat = 0;
      this.currentAvartan++;
    }
  }

  scheduleNote(beatNumber, time) {
    // Math to determine if it's a subdivision off-beat
    const isSub = beatNumber % this.subdivision !== 0;
    const mainBeatIndex = Math.floor(beatNumber / this.subdivision);
    
    let type = 'normal';
    if (!isSub) {
      type = this.getBeatType(mainBeatIndex);
    } else {
      type = 'sub';
    }

    let bol = 'Ta';
    let bol_hi = '';
    
    // For proper Layakari, cycle the bol text with every sub-beat tick
    if (this.taal && this.taal.theka && this.taal.theka.length > 0) {
      bol = this.taal.theka[beatNumber % this.taal.theka.length];
      bol_hi = this.taal.theka_devanagari ? this.taal.theka_devanagari[beatNumber % this.taal.theka_devanagari.length] : bol;
    } else {
      bol = (mainBeatIndex + 1).toString();
      bol_hi = bol;
    }

    // Schedule audio
    if (this.soundPack === 'tabla' && this.taal && this.taal.id === 'teentaal') {
      // Start or resync the loop if parameters changed
      if (!synth.currentTablaLoop || synth.lastTablaBpm !== this.bpm || synth.lastTablaSubdivision !== this.subdivision) {
        synth.playTablaLoop(time, this.bpm, this.subdivision, beatNumber / this.subdivision);
      }
    } else if (this.soundPack === 'click') {
      synth.playSampledClick(time, type);
    } else {
      synth.playBol(this.soundPack, bol, time, type);
    }

    // Notify UI for ALL beats to keep bol updates in sync with Layakari speed
    this.onBeatListeners.forEach(cb => cb({
      beat: mainBeatIndex, 
      avartan: this.currentAvartan, 
      time: time,
      type: type,
      bol: bol,
      bol_hi: bol_hi
    }));
  }

  scheduler() {
    if (!this.audioContext) return;

    // Stop at end of avartan if requested
    if (this.stopRequested && this.currentBeat === 0) {
      this.isPlaying = false;
      this.stopRequested = false;
      this.worker.postMessage('stop');
      synth.stopTablaLoop();
      this.onBeatListeners.forEach(cb => cb({ stopped: true }));
      return;
    }

    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.nextNote();
    }
  }

  start() {
    if (this.isPlaying) return;
    
    synth.resume();
    this.audioContext = synth.getCtx();
    
    this.isPlaying = true;
    this.stopRequested = false;
    this.currentBeat = 0;
    this.currentAvartan = 0;
    
    if (this.audioContext) {
      this.nextNoteTime = this.audioContext.currentTime + 0.05;
    }
    
    this.worker.postMessage('start');
  }

  stop(immediate = false) {
    if (immediate) {
      this.isPlaying = false;
      this.stopRequested = false;
      this.worker.postMessage('stop');
      synth.stopTablaLoop();
      this.onBeatListeners.forEach(cb => cb({ stopped: true }));
    } else {
      this.stopRequested = true;
    }
  }
}

export const engine = new MetronomeEngine();
