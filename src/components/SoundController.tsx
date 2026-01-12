import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { getSongData, saveHistory } from '@/lib/db';

export const SoundController: React.FC = () => {
    const {
        currentSong,
        isPlaying,
        volume,
        progress,
        pauseSong,
        nextSong,
        setProgress,
    } = usePlayer();

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isSeekingRef = useRef(false);

    // Initialize Audio Element
    useEffect(() => {
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audioRef.current = audio;

        const handleEnded = () => {
            if (currentSong) saveHistory(currentSong);
            nextSong();
        };

        const handleTimeUpdate = () => {
            if (audioRef.current && !isSeekingRef.current) {
                // Only update context if we are not manually seeking
                if (Math.abs(audioRef.current.currentTime - progress) > 1) {
                    // console.log("Updating progress", audioRef.current.currentTime);
                    setProgress(audioRef.current.currentTime);
                }
            }
        };

        const handleError = (e: any) => {
            console.error("Audio error:", e);
            pauseSong();
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('error', handleError);
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    // Handle Play/Pause
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Ignore NotAllowedError (user hasn't interacted yet)
                    if (error.name !== 'NotAllowedError') {
                        console.error("Playback failed:", error);
                        pauseSong();
                    } else {
                        console.log("Auto-play prevented by browser policy");
                        pauseSong();
                    }
                });
            }
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    // Handle Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // Handle Song Change
    useEffect(() => {
        const loadSong = async () => {
            if (!audioRef.current || !currentSong) return;

            // Reset
            audioRef.current.pause();
            audioRef.current.src = "";

            let src = "";

            // Check if offline/downloaded - ONLY if truly downloaded
            if (currentSong.isDownloaded) {
                try {
                    const offlineData = await getSongData(currentSong.id);
                    if (offlineData?.blob) {
                        src = URL.createObjectURL(offlineData.blob);
                    } else {
                        // Mark as not downloaded if blob is missing to prevent future attempts? 
                        // For now just warn and fall back
                        console.warn("Downloaded song structure found but blob missing in DB.");
                    }
                } catch (e) {
                    console.error("Failed to load offline song", e);
                }
            }

            // If no offline blob, check for streamUrl
            if (!src) {
                if (currentSong.streamUrl) {
                    src = currentSong.streamUrl;
                } else if ((currentSong as any).streamUrl) {
                    // Fallback for legacy typings if any
                    src = (currentSong as any).streamUrl;
                } else {
                    // Try to get YouTube ID from property OR extract from ID
                    let videoId = currentSong.youtubeId;
                    if (!videoId && currentSong.id.startsWith("yt-")) {
                        videoId = currentSong.id.replace("yt-", "");
                    }

                    if (videoId) {
                        try {
                            // Only load toast if we are actually fetching from network (slow)
                            // const { toast } = await import("sonner");

                            const { supabase } = await import("@/integrations/supabase/client");
                            const { data, error } = await supabase.functions.invoke('youtube-audio', {
                                body: { videoId: videoId, action: 'stream' }
                            });

                            if (!error && data?.success && data.data.audioUrl) {
                                src = data.data.audioUrl;
                            } else {
                                console.error("Stream fetch failed:", error || data?.error);
                                // Optional: Notify user but avoid spamming if it's a playlist skip
                            }
                        } catch (err) {
                            console.error("Error fetching audio stream:", err);
                        }
                    }
                }
            }

            if (src) {
                audioRef.current.src = src;
                if (isPlaying) {
                    try {
                        const playPromise = audioRef.current.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                if (error.name !== 'NotAllowedError') {
                                    console.error("Playback failed:", error);
                                    pauseSong();
                                } else {
                                    // Browser policy blocked auto-play. 
                                    // Pause UI to match state, but don't error out loudly.
                                    console.log("Auto-play prevented by browser policy");
                                    pauseSong();
                                    const { toast } = require("sonner");
                                    toast.info("Click play to start audio");
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Sync Playback error:", e);
                    }
                }
            } else {
                console.error("No valid audio source found for:", currentSong.title);
                if (isPlaying) pauseSong();
            }
        };

        loadSong();
    }, [currentSong]);

    return null;
};
