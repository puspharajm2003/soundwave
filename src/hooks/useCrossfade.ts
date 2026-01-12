import { useState, useCallback, useRef, useEffect } from "react";

interface CrossfadeState {
  enabled: boolean;
  duration: number; // in seconds
}

export const useCrossfade = () => {
  const [crossfadeState, setCrossfadeState] = useState<CrossfadeState>(() => {
    const saved = localStorage.getItem("crossfade-settings");
    if (saved) {
      return JSON.parse(saved);
    }
    return { enabled: false, duration: 5 };
  });

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("crossfade-settings", JSON.stringify(crossfadeState));
  }, [crossfadeState]);

  const updateSettings = useCallback((enabled: boolean, duration: number) => {
    setCrossfadeState({ enabled, duration });
  }, []);

  const startCrossfade = useCallback(
    (currentAudio: HTMLAudioElement, nextAudio: HTMLAudioElement, onComplete: () => void) => {
      if (!crossfadeState.enabled) {
        onComplete();
        return;
      }

      currentAudioRef.current = currentAudio;
      nextAudioRef.current = nextAudio;

      const fadeSteps = 20;
      const stepDuration = (crossfadeState.duration * 1000) / fadeSteps;
      let step = 0;

      // Start next audio at volume 0
      nextAudio.volume = 0;
      nextAudio.play().catch(console.error);

      fadeIntervalRef.current = setInterval(() => {
        step++;
        const progress = step / fadeSteps;

        // Fade out current
        if (currentAudio) {
          currentAudio.volume = Math.max(0, 1 - progress);
        }

        // Fade in next
        if (nextAudio) {
          nextAudio.volume = Math.min(1, progress);
        }

        if (step >= fadeSteps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
          if (currentAudio) {
            currentAudio.pause();
            currentAudio.volume = 1;
          }
          onComplete();
        }
      }, stepDuration);
    },
    [crossfadeState.enabled, crossfadeState.duration]
  );

  const cancelCrossfade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = 1;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = 1;
    }
  }, []);

  // Calculate when to start crossfade based on song duration
  const getCrossfadeStartTime = useCallback(
    (songDuration: number) => {
      if (!crossfadeState.enabled) return songDuration;
      return Math.max(0, songDuration - crossfadeState.duration);
    },
    [crossfadeState.enabled, crossfadeState.duration]
  );

  return {
    crossfadeEnabled: crossfadeState.enabled,
    crossfadeDuration: crossfadeState.duration,
    updateSettings,
    startCrossfade,
    cancelCrossfade,
    getCrossfadeStartTime,
  };
};
