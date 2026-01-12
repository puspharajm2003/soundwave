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
            if (currentSong) saveHistory(currentSong.id);
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

            // Check if offline/downloaded
            if (currentSong.isDownloaded) {
                try {
                    const blob = await getSongData(currentSong.id);
                    if (blob) {
                        src = URL.createObjectURL(blob);
                    } else {
                        console.warn("Downloaded song structure found but blob missing in DB.");
                    }
                } catch (e) {
                    console.error("Failed to load offline song", e);
                }
            }

            // If no offline blob, check for streamUrl
            if (!src) {
                if ((currentSong as any).streamUrl) {
                    src = (currentSong as any).streamUrl;
                } else {
                    // Try to get YouTube ID from property OR extract from ID
                    let videoId = currentSong.youtubeId;
                    if (!videoId && currentSong.id.startsWith("yt-")) {
                        videoId = currentSong.id.replace("yt-", "");
                    }

                    if (videoId) {
                        try {
                            const { toast } = await import("sonner");
                            // toast.loading(`Loading stream for: ${currentSong.title}`);

                            const { supabase } = await import("@/integrations/supabase/client");
                            const { data, error } = await supabase.functions.invoke('youtube-audio', {
                                body: { videoId: videoId, action: 'stream' }
                            });

                            if (!error && data?.success && data.data.audioUrl) {
                                src = data.data.audioUrl;
                            } else {
                                console.error("Stream fetch failed:", error || data?.error);
                                toast.error("Could not load audio stream", {
                                    description: "Please check your connection or try another song."
                                });
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
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Sync Playback error:", e);
                    }
                }
            } else {
                if (isPlaying) pauseSong();
            }
        };

        loadSong();
    }, [currentSong]);

    return null;
};
