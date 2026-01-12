import { useRef, useCallback, useEffect, useState } from "react";

const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 8000];

interface WebAudioState {
  isInitialized: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isBackgroundPlayEnabled: boolean;
  hasWakeLock: boolean;
}

export const useWebAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const equalizerNodesRef = useRef<BiquadFilterNode[]>([]);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
  const [state, setState] = useState<WebAudioState>({
    isInitialized: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isBackgroundPlayEnabled: true,
    hasWakeLock: false,
  });

  // Initialize Web Audio API
  const initialize = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();

      // Create audio element with background playback settings
      audioElementRef.current = new Audio();
      audioElementRef.current.crossOrigin = "anonymous";
      // Enable background playback on mobile
      audioElementRef.current.setAttribute('x-webkit-airplay', 'allow');
      audioElementRef.current.preload = 'auto';
      // Prevent audio from being interrupted
      (audioElementRef.current as any).mozAudioChannelType = 'content';

      // Create source node from audio element
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(
        audioElementRef.current
      );

      // Create gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();

      // Create analyser node for visualizations
      analyserNodeRef.current = audioContextRef.current.createAnalyser();
      analyserNodeRef.current.fftSize = 256;

      // Create equalizer bands (biquad filters)
      equalizerNodesRef.current = FREQUENCIES.map((freq, index) => {
        const filter = audioContextRef.current!.createBiquadFilter();
        
        if (index === 0) {
          filter.type = "lowshelf";
        } else if (index === FREQUENCIES.length - 1) {
          filter.type = "highshelf";
        } else {
          filter.type = "peaking";
        }
        
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        
        return filter;
      });

      // Connect the audio graph
      // Source -> EQ Bands -> Gain -> Analyser -> Destination
      let currentNode: AudioNode = sourceNodeRef.current;
      
      equalizerNodesRef.current.forEach((eqNode) => {
        currentNode.connect(eqNode);
        currentNode = eqNode;
      });

      currentNode.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserNodeRef.current);
      analyserNodeRef.current.connect(audioContextRef.current.destination);

      // Set up event listeners
      audioElementRef.current.addEventListener("timeupdate", () => {
        setState((prev) => ({
          ...prev,
          currentTime: audioElementRef.current?.currentTime || 0,
        }));
      });

      audioElementRef.current.addEventListener("loadedmetadata", () => {
        setState((prev) => ({
          ...prev,
          duration: audioElementRef.current?.duration || 0,
        }));
      });

      audioElementRef.current.addEventListener("play", () => {
        setState((prev) => ({ ...prev, isPlaying: true }));
      });

      audioElementRef.current.addEventListener("pause", () => {
        setState((prev) => ({ ...prev, isPlaying: false }));
      });

      audioElementRef.current.addEventListener("ended", () => {
        setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
      });

      setState((prev) => ({ ...prev, isInitialized: true }));
    } catch (error) {
      console.error("Failed to initialize Web Audio:", error);
    }
  }, []);

  // Resume audio context (required after user interaction)
  const resumeContext = useCallback(async () => {
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }
  }, []);

  // Load audio source
  const loadSource = useCallback(async (url: string) => {
    if (!audioElementRef.current) {
      await initialize();
    }

    await resumeContext();

    if (audioElementRef.current) {
      audioElementRef.current.src = url;
      audioElementRef.current.load();
    }
  }, [initialize, resumeContext]);

  // Playback controls
  const play = useCallback(async () => {
    await resumeContext();
    await audioElementRef.current?.play();
  }, [resumeContext]);

  const pause = useCallback(() => {
    audioElementRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
  }, []);

  // Volume control
  const setVolume = useCallback((volume: number) => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = normalizedVolume;
    }
    if (audioElementRef.current) {
      audioElementRef.current.volume = normalizedVolume;
    }
    setState((prev) => ({ ...prev, volume: normalizedVolume }));
  }, []);

  // Equalizer control
  const setEqualizerBands = useCallback((bands: number[]) => {
    equalizerNodesRef.current.forEach((node, index) => {
      if (bands[index] !== undefined) {
        // Convert -12 to +12 dB range to actual gain values
        node.gain.value = bands[index];
      }
    });
  }, []);

  // Get frequency data for visualizations
  const getFrequencyData = useCallback(() => {
    if (!analyserNodeRef.current) return new Uint8Array(0);
    
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNodeRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  // Get waveform data for visualizations
  const getWaveformData = useCallback(() => {
    if (!analyserNodeRef.current) return new Uint8Array(0);
    
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNodeRef.current.getByteTimeDomainData(dataArray);
    return dataArray;
  }, []);

  // Request wake lock for background playback
  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && state.isBackgroundPlayEnabled) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setState(prev => ({ ...prev, hasWakeLock: true }));
        
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake Lock released');
          setState(prev => ({ ...prev, hasWakeLock: false }));
        });
        
        console.log('Wake Lock acquired for background playback');
      } catch (err) {
        console.log('Wake Lock request failed:', err);
      }
    }
  }, [state.isBackgroundPlayEnabled]);

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setState(prev => ({ ...prev, hasWakeLock: false }));
    }
  }, []);

  // Toggle background playback
  const toggleBackgroundPlay = useCallback(() => {
    setState(prev => ({
      ...prev,
      isBackgroundPlayEnabled: !prev.isBackgroundPlayEnabled,
    }));
  }, []);

  // Handle visibility change to maintain background playback
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && state.isPlaying) {
        // Re-acquire wake lock when returning to foreground
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isPlaying, requestWakeLock]);

  // Manage wake lock based on playback state
  useEffect(() => {
    if (state.isPlaying && state.isBackgroundPlayEnabled) {
      requestWakeLock();
    } else if (!state.isPlaying) {
      releaseWakeLock();
    }
  }, [state.isPlaying, state.isBackgroundPlayEnabled, requestWakeLock, releaseWakeLock]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    loadSource,
    play,
    pause,
    stop,
    seek,
    setVolume,
    setEqualizerBands,
    getFrequencyData,
    getWaveformData,
    requestWakeLock,
    releaseWakeLock,
    toggleBackgroundPlay,
    audioElement: audioElementRef.current,
    analyserNode: analyserNodeRef.current,
  };
};
