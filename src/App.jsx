import { useState, useRef, useEffect } from 'react';
import { useMetronome } from './hooks/useMetronome';
import {
  Play, Square, Volume2, VolumeX, Settings, Music, ChevronDown,
  Info, X, Plus, Minus, Zap, Clock, Gauge, Layers, Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { thaats } from './data/thaats';
import { raags } from './data/raags';
import { synth } from './engine/synth';

const Tab = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const BeatVisualizerCircle = ({ isActive, type, label }) => {
  const getColor = () => {
    if (type === 'sam') return isActive ? 'bg-blue-500 border-blue-400 ring-blue-400/50' : 'border-blue-400/30';
    if (type === 'tali') return isActive ? 'bg-emerald-500 border-emerald-400 ring-emerald-400/50' : 'border-emerald-400/30';
    if (type === 'khali') return isActive ? 'bg-amber-500 border-amber-400 ring-amber-400/50' : 'border-amber-400/30 border-dashed';
    return isActive ? 'bg-gray-600 border-gray-400 ring-gray-400/50' : 'border-gray-500/30';
  };

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.3 : 1,
        opacity: isActive ? 1 : 0.6
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${getColor()} ${
        isActive ? 'ring-4' : ''
      }`}
    >
      <span className="text-xs md:text-sm font-semibold">{label}</span>
    </motion.div>
  );
};

function App() {
  const {
    taals, taal, setTaal,
    bpm, setBpm,
    isPlaying, stopRequested, togglePlay,
    soundOn, setSoundOn,
    soundPack, setSoundPack,
    subdivision, setSubdivision,
    currentBeat, avartan
  } = useMetronome('teentaal');

  const [isEditingBpm, setIsEditingBpm] = useState(false);
  const [bpmInputValue, setBpmInputValue] = useState(bpm);
  const [showTaalInfo, setShowTaalInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('counter');

  const tapTimesRef = useRef([]);

  useEffect(() => {
    setBpmInputValue(bpm);
  }, [bpm]);

  const handleTapTempo = () => {
    const now = Date.now();
    const tapTimes = tapTimesRef.current;
    tapTimes.push(now);

    if (tapTimes.length > 1) {
      const interval = tapTimes[tapTimes.length - 1] - tapTimes[tapTimes.length - 2];
      const newBpm = Math.round(60000 / interval);
      if (newBpm >= 20 && newBpm <= 400) {
        setBpm(newBpm);
      }
    }

    if (tapTimes.length > 8) {
      tapTimes.shift();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      tapTimesRef.current = [];
    }, 2000);
    return () => clearTimeout(timer);
  });

  const handleBpmInputBlur = () => {
    const parsed = parseInt(bpmInputValue, 10);
    if (!isNaN(parsed) && parsed >= 20 && parsed <= 400) {
      setBpm(parsed);
    } else {
      setBpmInputValue(bpm);
    }
    setIsEditingBpm(false);
  };

  // Render beat visualization
  const renderVisualizer = () => {
    if (!taal) return null;

    const elements = [];
    let beatCounter = 1;

    taal.vibhags.forEach((vibhag, vIndex) => {
      const vibhagBeats = [];

      for (let i = 0; i < vibhag.beats; i++) {
        const isCurrent = currentBeat !== '--' && currentBeat === beatCounter;
        const beatType = vibhag.type || 'beat';

        vibhagBeats.push(
          <BeatVisualizerCircle
            key={`beat-${beatCounter}`}
            isActive={isCurrent}
            type={beatType}
            label={beatCounter}
          />
        );
        beatCounter++;
      }

      elements.push(
        <div key={`vibhag-${vIndex}`} className="flex items-center gap-3 md:gap-4">
          {vibhagBeats}
        </div>
      );
    });

    return elements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">BeatCounter</h1>
                <p className="text-xs text-gray-400">Taal Metronome Pro</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700/50">
              <Tab icon={Play} label="Counter" isActive={activeTab === 'counter'} onClick={() => setActiveTab('counter')} />
              <Tab icon={Music} label="Raag" isActive={activeTab === 'raag'} onClick={() => setActiveTab('raag')} />
              <Tab icon={Lightbulb} label="Learn" isActive={activeTab === 'learn'} onClick={() => setActiveTab('learn')} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* COUNTER TAB */}
          {activeTab === 'counter' && (
            <motion.div
              key="counter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Top Control Panel */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Taal Selector */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Taal (Cycle)</h2>
                    <button
                      onClick={() => setShowTaalInfo(true)}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="Taal Information"
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      className="w-full bg-gray-900/50 border border-gray-700/50 text-white font-semibold py-3 px-4 rounded-lg appearance-none cursor-pointer hover:border-blue-500/50 focus:outline-none focus:border-blue-500/80 transition-colors"
                      value={taal.id}
                      onChange={(e) => setTaal(taals.find(t => t.id === e.target.value))}
                    >
                      <optgroup label="Hindustani Classical">
                        {taals.filter(t => t.tradition === 'Hindustani').map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name.en} ({t.matras} beats)
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Carnatic Sapta-Tala">
                        {taals.filter(t => t.tradition === 'Carnatic').map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name.en} ({t.matras} beats)
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-400 mb-2">Sound Pack</p>
                    <div className="relative">
                      <select
                        className="w-full bg-gray-900/50 border border-gray-700/50 text-white py-2 px-4 rounded-lg appearance-none cursor-pointer hover:border-blue-500/50 focus:outline-none focus:border-blue-500/80 transition-colors text-sm"
                        value={soundPack}
                        onChange={(e) => setSoundPack(e.target.value)}
                      >
                        <option value="tabla">Tabla</option>
                        <option value="pakhawaj">Pakhawaj</option>
                        <option value="mridangam">Mridangam</option>
                        <option value="click">Click</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Subdivision Control */}
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Speed Variation</h2>
                  <div className="space-y-3">
                    {[
                      { val: 1, label: '1x (Vilambit)', desc: 'Slow' },
                      { val: 2, label: '2x (Dugun)', desc: 'Double' },
                      { val: 3, label: '3x (Tigun)', desc: 'Triple' },
                      { val: 4, label: '4x (Chaugun)', desc: 'Quadruple' }
                    ].map(l => (
                      <button
                        key={l.val}
                        onClick={() => setSubdivision(l.val)}
                        className={`w-full p-3 rounded-lg text-left transition-all text-sm font-medium ${
                          subdivision === l.val
                            ? 'bg-blue-600 text-white border border-blue-500'
                            : 'bg-gray-900/30 border border-gray-700/50 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{l.label}</span>
                          <span className="text-xs opacity-70">{l.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Beat Visualizer */}
              <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-8">
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                  {renderVisualizer()}
                </div>
              </div>

              {/* Counter Display & Controls */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Beat Counter */}
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-950/20 border border-blue-700/30 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-xs font-semibold uppercase mb-3">Current Beat</p>
                  <motion.div
                    key={currentBeat}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-bold text-blue-400 font-mono"
                  >
                    {currentBeat}
                  </motion.div>
                </div>

                {/* Avartan Counter */}
                <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/20 border border-emerald-700/30 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-xs font-semibold uppercase mb-3">Cycles</p>
                  <motion.div
                    key={avartan}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-bold text-emerald-400 font-mono"
                  >
                    {avartan}
                  </motion.div>
                </div>

                {/* BPM Control */}
                <div className="bg-gradient-to-br from-amber-900/40 to-amber-950/20 border border-amber-700/30 rounded-xl p-8">
                  <p className="text-gray-400 text-xs font-semibold uppercase mb-3 text-center">Tempo</p>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <button
                      onClick={() => setBpm(Math.max(20, bpm - 5))}
                      className="p-3 bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700/50"
                    >
                      <Minus className="w-5 h-5" />
                    </button>

                    <div
                      onClick={() => setIsEditingBpm(true)}
                      className="text-5xl font-bold font-mono text-amber-400 cursor-pointer hover:text-amber-300 transition-colors"
                    >
                      {isEditingBpm ? (
                        <input
                          type="number"
                          autoFocus
                          className="bg-transparent text-center w-32 focus:outline-none border-b-2 border-amber-400"
                          value={bpmInputValue}
                          onChange={(e) => setBpmInputValue(e.target.value)}
                          onBlur={handleBpmInputBlur}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleBpmInputBlur(); }}
                        />
                      ) : (
                        bpm
                      )}
                    </div>

                    <button
                      onClick={() => setBpm(Math.min(400, bpm + 5))}
                      className="p-3 bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700/50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs text-center">Beats Per Minute</p>
                </div>
              </div>

              {/* Tempo Slider */}
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <input
                  type="range"
                  min="20"
                  max="400"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between mt-3 text-xs text-gray-400">
                  <span>20 BPM</span>
                  <span>400 BPM</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-6">
                {/* Sound Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSoundOn(!soundOn)}
                  className={`w-16 h-16 flex items-center justify-center rounded-full transition-all border-2 ${
                    soundOn
                      ? 'bg-gray-700/50 border-gray-600 text-white'
                      : 'bg-gray-900/50 border-gray-700/50 text-gray-500'
                  }`}
                >
                  {soundOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </motion.button>

                {/* Play/Stop Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay}
                  className={`w-28 h-28 flex items-center justify-center rounded-full transition-all border-2 font-bold text-lg shadow-2xl ${
                    isPlaying && !stopRequested
                      ? 'bg-red-600 border-red-500 text-white hover:bg-red-700 shadow-red-600/30'
                      : 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 text-white hover:from-blue-700 hover:to-blue-800 shadow-blue-600/30'
                  }`}
                >
                  {isPlaying && !stopRequested ? (
                    <Square className="w-10 h-10 fill-current" />
                  ) : (
                    <Play className="w-10 h-10 fill-current ml-1" />
                  )}
                </motion.button>

                {/* Tap Tempo */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTapTempo}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-700/50 border-2 border-gray-600 text-white font-bold text-xs hover:border-gray-500 transition-all"
                >
                  TAP<br />TEMPO
                </motion.button>
              </div>

              {stopRequested && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-blue-400 font-semibold animate-pulse"
                >
                  Stopping at Sam...
                </motion.div>
              )}
            </motion.div>
          )}

          {/* RAAG TAB */}
          {activeTab === 'raag' && (
            <motion.div
              key="raag"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Raag Explorer</h2>
                <p className="text-gray-400">Explore Hindustani classical ragas by parent thaat</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {thaats.map(thaat => (
                  <div key={thaat.id} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                    <h3 className="text-lg font-bold mb-2">{thaat.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{thaat.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {thaat.swaras.slice(0, 5).map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* LEARN TAB */}
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Learning Guide</h2>
                <p className="text-gray-400">Master Indian classical rhythm cycles</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Understanding Taal',
                    desc: 'Taal (rhythm cycle) is the foundation of Indian classical music. Each taal has a fixed number of beats (matras) and specific patterns.',
                    icon: Gauge
                  },
                  {
                    title: 'Sam & Vibhag',
                    desc: 'Sam is the first beat where musicians resolve. Vibhags are subdivisions of the cycle marking musically significant points.',
                    icon: Zap
                  },
                  {
                    title: 'Laya (Speed)',
                    desc: 'Laya controls the speed of the taal. Start slow (vilambit) and progressively double the speed for practice.',
                    icon: Gauge
                  },
                  {
                    title: 'Practice Tips',
                    desc: 'Use tap tempo to calibrate your feel. Practice with different sound packs to get comfortable with various drum sounds.',
                    icon: Lightbulb
                  }
                ].map((item, i) => (
                  <div key={i} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                    <item.icon className="w-6 h-6 text-blue-400 mb-3" />
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Taal Info Modal */}
      <AnimatePresence>
        {showTaalInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowTaalInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full space-y-4"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">{taal.name.en}</h3>
                <button
                  onClick={() => setShowTaalInfo(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Beats (Matras)</p>
                  <p className="font-semibold">{taal.matras}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Tradition</p>
                  <p className="font-semibold">{taal.tradition}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-300">{taal.description}</p>
                </div>
                {taal.used_in && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Used In</p>
                    <div className="flex flex-wrap gap-2">
                      {taal.used_in.slice(0, 3).map((use, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs text-blue-300">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowTaalInfo(false)}
                className="w-full mt-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
