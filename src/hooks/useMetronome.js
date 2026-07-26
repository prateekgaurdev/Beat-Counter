import { useState, useEffect, useRef, useCallback } from 'react';
import { engine } from '../engine/MetronomeEngine';

export function useMetronome(initialTaals, initialTaalId = 'teentaal') {
    const [taal, setTaal] = useState(initialTaals.find(t => t.id === initialTaalId) || initialTaals[0]);
    const [bpm, setBpm] = useState(taal.default_bpm);
    const [isPlaying, setIsPlaying] = useState(false);
    const [soundOn, setSoundOn] = useState(true);
    const [stopRequested, setStopRequested] = useState(false);
    
    const [subdivision, setSubdivision] = useState(1);
    
    // UI state for current beat
    const [currentBeat, setCurrentBeat] = useState('--');
    const [avartan, setAvartan] = useState(0);
    const [currentBol, setCurrentBol] = useState({ en: '', hi: '' });

    const [soundPack, setSoundPack] = useState('tabla');

    const notesInQueue = useRef([]);
    const animationFrameId = useRef(null);

    // Initialize engine
    useEffect(() => {
        engine.init();

        const handleBeat = (data) => {
            if (data.stopped) {
                setIsPlaying(false);
                setStopRequested(false);
                setCurrentBeat('--');
                setCurrentBol({ en: '', hi: '' });
            } else {
                notesInQueue.current.push(data);
            }
        };

        engine.onBeat(handleBeat);

        return () => {
            engine.stop(true);
        };
    }, []);

    // Sync state to engine
    useEffect(() => {
        engine.setTaal(taal);
    }, [taal]);

    useEffect(() => {
        engine.setBpm(bpm);
    }, [bpm]);

    useEffect(() => {
        engine.soundOn = soundOn;
    }, [soundOn]);

    useEffect(() => {
        engine.setSubdivision(subdivision);
    }, [subdivision]);

    useEffect(() => {
        engine.setSoundPack(soundPack);
    }, [soundPack]);

    // UI sync loop
    useEffect(() => {
        const draw = () => {
            const currentTime = engine.audioContext ? engine.audioContext.currentTime : 0;

            let currentNoteToDraw = null;

            while (notesInQueue.current.length && notesInQueue.current[0].time <= currentTime) {
                currentNoteToDraw = notesInQueue.current[0];
                notesInQueue.current.splice(0, 1);
            }

            if (currentNoteToDraw) {
                setCurrentBeat(currentNoteToDraw.beat + 1); // 1-indexed for display
                setAvartan(currentNoteToDraw.avartan);
                setCurrentBol({ en: currentNoteToDraw.bol, hi: currentNoteToDraw.bol_hi });
            }

            animationFrameId.current = requestAnimationFrame(draw);
        };

        animationFrameId.current = requestAnimationFrame(draw);

        return () => cancelAnimationFrame(animationFrameId.current);
    }, []);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            engine.stop(false); // Stop on avartan end
            setStopRequested(true);
        } else {
            engine.start();
            setIsPlaying(true);
            setStopRequested(false);
            setCurrentBeat(1);
            setAvartan(0);
        }
    }, [isPlaying]);

    const stopPlayImmediate = useCallback(() => {
        engine.stop(true);
        setIsPlaying(false);
        setStopRequested(false);
        setCurrentBeat('--');
    }, []);

    return {
        taal,
        setTaal,
        bpm,
        setBpm,
        isPlaying,
        stopRequested,
        togglePlay,
        stopPlayImmediate,
        soundPack,
        setSoundPack,
        soundOn,
        setSoundOn,
        subdivision,
        setSubdivision,
        currentBeat,
        avartan,
        currentBol
    };
}
