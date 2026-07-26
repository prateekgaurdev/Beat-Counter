import { useState, useRef, useEffect } from 'react';
import { useMetronome } from './hooks/useMetronome';
import { Play, Square, Volume2, VolumeX, Settings, Music, ChevronDown, Info, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { thaats } from './data/thaats';
import { raags } from './data/raags';
import { synth } from './engine/synth';

function App() {
    const {
        taals, taal, setTaal,
        bpm, setBpm,
        isPlaying, stopRequested, togglePlay,
        soundOn, setSoundOn,
        soundPack, setSoundPack,
        subdivision, setSubdivision,
        currentBeat, avartan, currentBol
    } = useMetronome('teentaal');

    const [isEditingBpm, setIsEditingBpm] = useState(false);
    const [bpmInputValue, setBpmInputValue] = useState(bpm);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [activeTab, setActiveTab] = useState('taal'); // 'taal', 'raag', 'riyaz'
    
    const tapTimesRef = useRef([]);

    // Raag Explorer State
    const [selectedThaat, setSelectedThaat] = useState('all');
    const [raagSearch, setRaagSearch] = useState('');
    
    // Riyaz Studio State
    const [tanpuraOn, setTanpuraOn] = useState(false);
    const [tanpuraTonic, setTanpuraTonic] = useState(146.83); // D
    const [practiceSeconds, setPracticeSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Theme State
    const [isLightMode, setIsLightMode] = useState(() => {
        return localStorage.getItem('theme') === 'light';
    });

    useEffect(() => {
        if (isLightMode) {
            document.documentElement.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    }, [isLightMode]);

    useEffect(() => {
        setBpmInputValue(bpm);
    }, [bpm]);

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => setPracticeSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    useEffect(() => {
        if (tanpuraOn) {
            synth.startTanpura(tanpuraTonic);
        } else {
            synth.stopTanpura();
        }
    }, [tanpuraOn, tanpuraTonic]);

    const formatTime = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

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

    // Render Vibhag visualization
    const renderVisualizer = () => {
        if (!taal) return null;
        
        const elements = [];
        let beatCounter = 1;
        
        taal.vibhags.forEach((vibhag, vIndex) => {
            const vibhagBeats = [];
            for (let i = 0; i < vibhag.beats; i++) {
                const isCurrent = currentBeat !== '--' && currentBeat === beatCounter;
                let circleClass = "w-8 h-8 md:w-10 md:h-10 rounded-full border-[1.5px] transition-all duration-150 flex items-center justify-center ";
                
                if (vibhag.type === 'sam' && i === 0) {
                    circleClass += isCurrent ? "bg-primary border-primary shadow-[0_0_15px_rgba(var(--rgb-primary),0.5)] text-background" : "bg-primary/10 border-primary/40 text-primary";
                } else if (vibhag.type === 'tali' && i === 0) {
                    circleClass += isCurrent ? "bg-secondary border-secondary shadow-[0_0_10px_rgba(var(--rgb-secondary),0.5)] text-background" : "bg-secondary/10 border-secondary/40 text-secondary";
                } else if (vibhag.type === 'khali' && i === 0) {
                    circleClass += isCurrent ? "bg-surfaceHover border-textMuted text-textMain" : "bg-transparent border-dashed border-textMuted/60 text-textMuted";
                } else {
                    circleClass += isCurrent ? "bg-textMain border-textMain shadow-[0_0_10px_rgba(var(--rgb-text-main),0.2)] text-background" : "bg-surface border-borderMain text-textMuted shadow-sm";
                }

                vibhagBeats.push(
                    <div key={`beat-${beatCounter}`} className="flex flex-col items-center gap-3">
                        <motion.div 
                            className={circleClass}
                            animate={{
                                scale: isCurrent ? 1.15 : 1,
                                opacity: isCurrent ? 1 : 0.8
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 15
                            }}
                        >
                            {i === 0 && vibhag.type === 'khali' && <span className="text-sm font-bold opacity-70">०</span>}
                            {i === 0 && vibhag.type !== 'khali' && <span className="text-sm font-bold opacity-0">X</span>}
                        </motion.div>
                        <span className={`text-sm md:text-base transition-all ${taal.tradition === 'Hindustani' ? 'font-devanagari font-bold' : 'font-sans font-bold'} ${isCurrent ? 'text-primary scale-110 drop-shadow-md' : 'text-textMuted'}`}>
                            {taal.tradition === 'Hindustani' ? taal.theka_devanagari[beatCounter - 1] : taal.theka[beatCounter - 1]}
                        </span>
                    </div>
                );
                beatCounter++;
            }
            
            elements.push(
                <div key={`vibhag-${vIndex}`} className="flex items-center gap-3 md:gap-5 p-3 md:p-4 bg-surface/60 rounded-3xl border border-borderFaint shadow-sm backdrop-blur-sm">
                    {vibhagBeats}
                </div>
            );
        });

        return elements;
    };

    return (
        <div className="min-h-screen bg-background text-textMain flex flex-col items-center justify-center p-4 selection:bg-primary/30 font-sans">
            
            <header className="fixed top-0 w-full p-4 flex flex-col md:flex-row justify-between items-center max-w-5xl z-30 bg-background/90 backdrop-blur-md border-b border-borderFaint">
                <div className="flex items-center justify-between w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Music className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-wider">TAAL<span className="text-primary font-light">FORGE</span></h1>
                    </div>
                    
                    <button 
                        onClick={() => setIsLightMode(!isLightMode)}
                        className="md:hidden p-2 rounded-full hover:bg-surfaceHover text-textMuted hover:text-textMain transition-colors mb-4"
                        title="Toggle Theme"
                    >
                        {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                </div>
                
                <nav className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto px-4 md:px-0">
                    {[
                        { id: 'taal', label: 'Taal Lab', icon: Play },
                        { id: 'raag', label: 'Raag Explorer', icon: Music },
                        { id: 'riyaz', label: 'Riyaz Studio', icon: Settings },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                                activeTab === tab.id ? 'bg-primary text-background' : 'text-textMuted hover:text-textMain hover:bg-surfaceHover'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                    
                    <button 
                        onClick={() => setIsLightMode(!isLightMode)}
                        className="hidden md:flex items-center justify-center ml-2 p-2 rounded-full hover:bg-surfaceHover text-textMuted hover:text-textMain transition-colors"
                        title="Toggle Theme"
                    >
                        {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                </nav>
            </header>

            <main className="w-full max-w-5xl flex flex-col items-center gap-12 mt-32 px-4">
                
                {/* TAAL LAB */}
                {activeTab === 'taal' && (
                    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-300">
                        {/* Taal Selector & Sound Kit */}
                        <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl">
                            <div className="relative group z-10 w-full flex gap-2">
                                <div className="relative w-full">
                                    <select 
                                        className="w-full bg-surface border border-borderMain text-xl font-bold py-4 px-6 rounded-2xl appearance-none cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-ellipsis"
                                        value={taal.id}
                                        onChange={(e) => setTaal(taals.find(t => t.id === e.target.value))}
                                    >
                                        <optgroup label="Hindustani Classical">
                                            {taals.filter(t => t.tradition === 'Hindustani').map(t => (
                                                <option key={t.id} value={t.id}>{t.name.en} • {t.name.hi} ({t.maatras})</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Carnatic Sapta-Taala">
                                            {taals.filter(t => t.tradition === 'Carnatic').map(t => (
                                                <option key={t.id} value={t.id}>{t.name.en} ({t.maatras})</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none group-hover:text-primary transition-colors" />
                                </div>
                                <button 
                                    className="bg-surface border border-borderMain p-4 rounded-2xl hover:border-primary/50 hover:text-primary transition-colors flex-shrink-0"
                                    onClick={() => setShowInfoModal(true)}
                                    title="Taal Information"
                                >
                                    <Info />
                                </button>
                            </div>
                            <div className="relative w-full md:w-48 flex-shrink-0">
                                <select 
                                    className="w-full bg-surface border border-borderMain py-4 px-6 rounded-2xl appearance-none cursor-pointer hover:border-primary/50 transition-colors focus:outline-none text-textMuted hover:text-textMain text-center"
                                    value={soundPack}
                                    onChange={(e) => setSoundPack(e.target.value)}
                                >
                                    <option value="tabla">Tabla Kit</option>
                                    <option value="pakhawaj">Pakhawaj</option>
                                    <option value="mridangam">Mridangam</option>
                                    <option value="click">Classic Click</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none w-4 h-4" />
                            </div>
                        </div>

                        {/* Main Visualizer */}
                        <div className="w-full flex flex-wrap justify-center gap-4 md:gap-6 my-4 min-h-[100px]">
                            {renderVisualizer()}
                        </div>

                        {/* Counters & Timer */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center w-full">
                            <div>
                                <p className="text-textMuted text-sm font-medium tracking-widest uppercase mb-1">Beat</p>
                                <p className="text-5xl font-bold tabular-nums text-primary">{currentBeat}</p>
                            </div>
                            <div className="min-w-[120px]">
                                <p className="text-textMuted text-sm font-medium tracking-widest uppercase mb-1">Bol</p>
                                <p className="text-5xl font-bold font-devanagari text-primary drop-shadow-sm">{currentBol?.hi || '--'}</p>
                            </div>
                            <div>
                                <p className="text-textMuted text-sm font-medium tracking-widest uppercase mb-1">Avartan</p>
                                <p className="text-5xl font-bold tabular-nums text-secondary">{avartan}</p>
                            </div>
                            <div className="relative group">
                                <p className="text-textMuted text-sm font-medium tracking-widest uppercase mb-1">Timer</p>
                                <p 
                                    className={`text-5xl font-bold tabular-nums cursor-pointer transition-colors ${isTimerRunning ? 'text-green-400' : 'text-textMuted hover:text-textMain'}`}
                                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                                    title="Click to start/pause timer"
                                >
                                    {formatTime(practiceSeconds)}
                                </p>
                                <button 
                                    onClick={() => { setIsTimerRunning(false); setPracticeSeconds(0); }}
                                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-textMuted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Tempo Control & Laya Ratio */}
                        <div className="flex flex-col items-center w-full max-w-md gap-6 glass-panel p-6">
                            <div className="flex items-center justify-between w-full">
                                <button 
                                    className="w-12 h-12 flex justify-center items-center rounded-full bg-surfaceHover hover:bg-surfaceHover/80 text-xl font-bold transition-all active:scale-95"
                                    onClick={() => setBpm(Math.max(20, bpm - 1))}
                                >−</button>
                                
                                <div className="flex flex-col items-center justify-center">
                                    {isEditingBpm ? (
                                        <input 
                                            type="number" 
                                            autoFocus
                                            className="bg-transparent text-4xl font-bold text-center w-24 focus:outline-none focus:border-b-2 focus:border-primary tabular-nums"
                                            value={bpmInputValue} 
                                            onChange={(e) => setBpmInputValue(e.target.value)} 
                                            onBlur={handleBpmInputBlur}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleBpmInputBlur(); }}
                                        />
                                    ) : (
                                        <div className="text-4xl font-bold tabular-nums cursor-pointer hover:text-primary transition-colors" onClick={() => setIsEditingBpm(true)}>
                                            {bpm}
                                        </div>
                                    )}
                                    <p className="text-textMuted text-xs font-bold tracking-widest uppercase mt-1">BPM</p>
                                </div>

                                <button 
                                    className="w-12 h-12 flex justify-center items-center rounded-full bg-surfaceHover hover:bg-surfaceHover/80 text-xl font-bold transition-all active:scale-95"
                                    onClick={() => setBpm(Math.min(400, bpm + 1))}
                                >+</button>
                            </div>

                            <input 
                                type="range" 
                                min={taal.bpm_range[0]} 
                                max={taal.bpm_range[1]} 
                                value={bpm} 
                                onChange={(e) => setBpm(parseInt(e.target.value, 10))} 
                                className="w-full h-2 bg-surfaceHover rounded-full appearance-none cursor-pointer accent-primary"
                            />

                            {/* Laya (Subdivision) Selector */}
                            <div className="flex bg-surfaceHover rounded-lg p-1 w-full max-w-[250px]">
                                {[
                                    { val: 1, label: '1x' },
                                    { val: 2, label: '2x (Dugun)' },
                                    { val: 3, label: '3x (Tigun)' },
                                    { val: 4, label: '4x (Chaugun)' },
                                ].map(l => (
                                    <button
                                        key={l.val}
                                        onClick={() => setSubdivision(l.val)}
                                        className={`flex-1 text-xs py-1.5 rounded-md font-bold transition-colors ${
                                            subdivision === l.val ? 'bg-primary text-background' : 'text-textMuted hover:text-textMain'
                                        }`}
                                        title={l.label}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-6 mt-4">
                            <button 
                                className={`w-14 h-14 flex items-center justify-center rounded-full transition-colors border ${soundOn ? 'bg-surface border-borderMain text-textMain' : 'bg-surfaceHover border-transparent text-textMuted'}`}
                                onClick={() => setSoundOn(!soundOn)}
                                title="Toggle Sound"
                            >
                                {soundOn ? <Volume2 /> : <VolumeX />}
                            </button>

                            <button 
                                className={`w-24 h-24 flex items-center justify-center rounded-full transition-all duration-300 shadow-xl ${
                                    (isPlaying && !stopRequested) 
                                    ? 'bg-red-500/10 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-textMain shadow-red-500/20' 
                                    : 'bg-primary border-2 border-primary text-background hover:bg-primary/90 hover:scale-105 shadow-primary/20'
                                }`}
                                onClick={togglePlay}
                            >
                                {(isPlaying && !stopRequested) ? <Square fill="currentColor" className="w-8 h-8" /> : <Play fill="currentColor" className="w-10 h-10 ml-1" />}
                            </button>

                            <button 
                                className="w-14 h-14 flex items-center justify-center rounded-full bg-surface border border-borderMain hover:border-primary/50 transition-colors text-sm font-bold tracking-widest active:bg-primary/20"
                                onClick={handleTapTempo}
                            >
                                TAP
                            </button>
                        </div>
                        
                        {stopRequested && <p className="text-primary text-sm animate-pulse">Stopping at Sam...</p>}
                    </div>
                )}

                {/* RAAG EXPLORER */}
                {activeTab === 'raag' && (
                    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center max-w-2xl">
                            <h2 className="text-3xl font-bold mb-4">Raag Explorer</h2>
                            <p className="text-textMuted mb-6">Browse an extensive database of 70+ Hindustani raags, including complex Jod (compound) raags. Discover their aroh, avroh, pakad, and traditional time of rendition.</p>
                            
                            <div className="relative w-full max-w-md mx-auto">
                                <input
                                    type="search"
                                    placeholder="Search Raag (e.g., Jog, Bhairav...)"
                                    value={raagSearch}
                                    onChange={(e) => setRaagSearch(e.target.value)}
                                    className="w-full bg-surface border border-borderMain py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-textMain"
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            <button 
                                onClick={() => setSelectedThaat('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedThaat === 'all' ? 'bg-primary text-background' : 'bg-surface border border-borderMain hover:border-primary/50'}`}
                            >
                                All Thaats
                            </button>
                            {thaats.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setSelectedThaat(t.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedThaat === t.id ? 'bg-primary text-background' : 'bg-surface border border-borderMain hover:border-primary/50'}`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {raags
                                .filter(r => (selectedThaat === 'all' || r.thaat === selectedThaat) && r.name.toLowerCase().includes(raagSearch.toLowerCase()))
                                .map(r => (
                                <div key={r.id} className="glass-panel p-6 hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-primary">{r.name}</h3>
                                            <span className="text-xs text-textMuted uppercase tracking-widest">{thaats.find(t => t.id === r.thaat)?.name} Thaat</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-textMuted block text-xs mb-1">Aroh</span>
                                            <span className="font-devanagari font-medium">{r.aroh}</span>
                                        </div>
                                        <div>
                                            <span className="text-textMuted block text-xs mb-1">Avroh</span>
                                            <span className="font-devanagari font-medium">{r.avroh}</span>
                                        </div>
                                        <div>
                                            <span className="text-textMuted block text-xs mb-1">Pakad</span>
                                            <span className="font-devanagari text-secondary">{r.pakad}</span>
                                        </div>
                                        <div className="pt-3 flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-surfaceHover rounded text-xs">Vadi: {r.vadi}</span>
                                            <span className="px-2 py-1 bg-surfaceHover rounded text-xs">Samvadi: {r.samvadi}</span>
                                            <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-xs">{r.time}</span>
                                            <span className="px-2 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded text-xs">{r.rasa}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RIYAZ STUDIO */}
                {activeTab === 'riyaz' && (
                    <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center max-w-2xl mb-4">
                            <h2 className="text-3xl font-bold mb-4">Riyaz Studio</h2>
                            <p className="text-textMuted">Tanpura drone + Sargam trainer for daily practice. Runs independently from the Taal Lab engine.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl">
                            
                            {/* Tanpura Control */}
                            <div className="glass-panel p-8 flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                                    <Music className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Tanpura Drone</h3>
                                    <p className="text-textMuted text-sm mb-6">Select your tonic (Sa) and turn on the drone.</p>
                                    
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-textMuted text-sm font-bold uppercase tracking-widest">Tonic (Sa)</span>
                                            <select 
                                                className="bg-surface border border-borderMain py-2 px-4 rounded-xl focus:outline-none focus:border-primary"
                                                value={tanpuraTonic}
                                                onChange={(e) => setTanpuraTonic(parseFloat(e.target.value))}
                                            >
                                                <option value="130.81">C</option>
                                                <option value="138.59">C#</option>
                                                <option value="146.83">D</option>
                                                <option value="155.56">D#</option>
                                                <option value="164.81">E</option>
                                                <option value="174.61">F</option>
                                                <option value="185.00">F#</option>
                                                <option value="196.00">G</option>
                                                <option value="207.65">G#</option>
                                                <option value="220.00">A</option>
                                                <option value="233.08">A#</option>
                                                <option value="246.94">B</option>
                                            </select>
                                        </div>
                                        
                                        <button 
                                            onClick={() => setTanpuraOn(!tanpuraOn)}
                                            className={`px-8 py-4 rounded-full font-bold transition-all ${
                                                tanpuraOn 
                                                ? 'bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500 hover:text-textMain' 
                                                : 'bg-primary text-background hover:bg-primary/90'
                                            }`}
                                        >
                                            {tanpuraOn ? 'Stop Tanpura' : 'Start Tanpura'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Practice Timer */}
                            <div className="glass-panel p-8 flex flex-col items-center justify-center text-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-2">
                                    <Settings className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Practice Timer</h3>
                                    <p className="text-textMuted text-sm mb-4">Track your daily riyaz duration.</p>
                                    
                                    <div className="text-6xl font-bold tabular-nums text-secondary mb-6">
                                        {formatTime(practiceSeconds)}
                                    </div>
                                    
                                    <div className="flex gap-4 justify-center">
                                        <button 
                                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                                            className={`px-6 py-3 rounded-full font-bold transition-colors ${
                                                isTimerRunning
                                                ? 'bg-red-500/20 text-red-500 border border-red-500'
                                                : 'bg-surface border border-borderMain hover:border-secondary hover:text-secondary'
                                            }`}
                                        >
                                            {isTimerRunning ? 'Pause' : 'Start'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsTimerRunning(false);
                                                setPracticeSeconds(0);
                                            }}
                                            className="px-6 py-3 rounded-full font-bold bg-surface border border-borderMain hover:border-borderStrong transition-colors"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Sargam Keys */}
                            <div className="glass-panel p-8 lg:col-span-2">
                                <div className="mb-6 text-center">
                                    <h3 className="text-xl font-bold mb-2">Sargam Trainer</h3>
                                    <p className="text-textMuted text-sm">Tap a swara to hear it relative to your selected tonic ({tanpuraTonic} Hz). Great for tuning your pitch.</p>
                                </div>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {[
                                        { label: 'S', ratio: 1 }, { label: 'r', ratio: 1.0595 }, { label: 'R', ratio: 1.1225 },
                                        { label: 'g', ratio: 1.1892 }, { label: 'G', ratio: 1.2599 }, { label: 'M', ratio: 1.3348 },
                                        { label: 'm', ratio: 1.4142 }, { label: 'P', ratio: 1.4983 }, { label: 'd', ratio: 1.5874 },
                                        { label: 'D', ratio: 1.6818 }, { label: 'n', ratio: 1.7818 }, { label: 'N', ratio: 1.8877 },
                                        { label: "S'", ratio: 2 }
                                    ].map(note => (
                                        <button
                                            key={note.label}
                                            onClick={() => synth.playSargamNote(tanpuraTonic * note.ratio)}
                                            className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-surface border border-borderMain rounded-xl font-devanagari font-bold text-lg md:text-xl hover:bg-primary hover:text-background hover:border-primary transition-all active:scale-95"
                                        >
                                            {note.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>
            <AnimatePresence>
                {showInfoModal && (
                    <>
                        <motion.div 
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowInfoModal(false)}
                        />
                        <motion.div 
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface border border-borderMain p-6 md:p-8 rounded-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
                            initial={{ opacity: 0, scale: 0.95, y: '-45%', x: '-50%' }}
                            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                            exit={{ opacity: 0, scale: 0.95, y: '-45%', x: '-50%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-primary mb-1">
                                        {taal.name.en} {taal.tradition === 'Hindustani' && <span className="text-textMuted text-xl font-devanagari ml-2">{taal.name.hi}</span>}
                                    </h2>
                                    <p className="text-secondary font-medium tracking-wide uppercase text-sm">
                                        {taal.tradition} Tradition
                                    </p>
                                </div>
                                <button 
                                    className="p-2 hover:bg-surfaceHover rounded-full transition-colors"
                                    onClick={() => setShowInfoModal(false)}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6 text-textMuted">
                                <div className="bg-surfaceHover/50 p-4 rounded-xl border border-borderFaint">
                                    <p className="text-sm uppercase tracking-widest font-bold text-textMain mb-2">Theka Structure</p>
                                    <p className="text-lg text-primary font-medium tracking-wider">{taal.theka_display}</p>
                                    {taal.anga_structure && (
                                        <p className="text-sm mt-2 text-secondary">Anga: {taal.anga_structure}</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-textMain font-bold mb-2">Description</h3>
                                    <p className="leading-relaxed">{taal.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-surfaceHover/30 p-4 rounded-xl">
                                        <h3 className="text-textMain font-bold mb-2 text-sm uppercase">Category</h3>
                                        <p>{taal.category}</p>
                                    </div>
                                    <div className="bg-surfaceHover/30 p-4 rounded-xl">
                                        <h3 className="text-textMain font-bold mb-2 text-sm uppercase">Typical Laya (Tempo)</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {taal.typical_laya.map(l => (
                                                <span key={l} className="px-2 py-1 bg-surfaceHover rounded-md text-xs capitalize">{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-textMain font-bold mb-2 text-sm uppercase">Used In</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {taal.used_in.map(use => (
                                            <span key={use} className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm">
                                                {use}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
