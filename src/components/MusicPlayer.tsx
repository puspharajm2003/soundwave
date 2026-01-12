import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Heart,
  ListMusic,
  Download
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useSettings } from "@/context/SettingsContext"; // Added import
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isExpanded, onToggleExpand }) => {
  const {
    currentSong,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
    pauseSong,
    resumeSong,
    nextSong,
    prevSong,
    setProgress,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { settings } = useSettings(); // Get settings

  const [isMuted, setIsMuted] = React.useState(false);
  const [prevVolume, setPrevVolume] = React.useState(volume);
  const [isLiked, setIsLiked] = React.useState(false);

  // Simulate progress for demo
  React.useEffect(() => {
    if (isPlaying && currentSong) {
      const interval = setInterval(() => {
        setProgress(Math.min(progress + 1, currentSong.duration));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, progress, currentSong, setProgress]);

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  if (!currentSong) return null;

  const progressPercent = (progress / currentSong.duration) * 100;

  return (
    <AnimatePresence mode="wait">
      {isExpanded ? (
        <motion.div
          key="expanded"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Background with album art blur */}
          <div
            className="absolute inset-0 opacity-30 blur-3xl scale-110"
            style={{
              backgroundImage: `url(${currentSong.thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

          {/* Content optimized for different layouts */}
          <div className={cn(
            "relative z-10 flex flex-col h-full",
            settings.playerLayout.style === "compact" ? "p-6" : "p-6 md:p-12"
          )}>
            {/* Header - Hidden in Minimal/Immersive unless hovered/interacted */}
            <div className={cn(
              "flex items-center justify-between mb-8",
              settings.playerLayout.style === "immersive" && "opacity-0 hover:opacity-100 transition-opacity"
            )}>
              <button
                onClick={onToggleExpand}
                className="p-2 glass-button rounded-full"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <span className="text-sm text-muted-foreground uppercase tracking-widest">
                {settings.playerLayout.style === "minimal" ? "" : "Now Playing"}
              </span>
              <button className="p-2 glass-button rounded-full">
                <ListMusic className="w-6 h-6" />
              </button>
            </div>

            {/* Album Art - Sizes based on layout */}
            <div className="flex-1 flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className={cn(
                  "relative rounded-full overflow-hidden album-glow",
                  settings.playerLayout.albumArtSize === "small" && "w-48 h-48 md:w-64 md:h-64",
                  settings.playerLayout.albumArtSize === "medium" && "w-64 h-64 md:w-80 md:h-80",
                  settings.playerLayout.albumArtSize === "large" && "w-72 h-72 md:w-96 md:h-96 lg:w-[30rem] lg:h-[30rem]",
                  !isPlaying && "animate-none"
                )}
                style={{ animationPlayState: isPlaying ? "running" : "paused" }}
              >
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-background/90 backdrop-blur-sm" />
                </div>
              </motion.div>
            </div>

            {/* Song Info */}
            <div className="text-center mb-8">
              <motion.h2
                key={currentSong.id + "-title"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-display font-bold mb-2"
              >
                {currentSong.title}
              </motion.h2>
              <motion.p
                key={currentSong.id + "-artist"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-lg"
              >
                {currentSong.artist}
              </motion.p>
            </div>

            {/* Progress and Waveform */}
            <div className="mb-6 space-y-4">
              {settings.playerLayout.showWaveform && (
                <div className="h-12 w-full flex items-center justify-center gap-1 opacity-50">
                  {/* Placeholder for waveform visualization */}
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full transition-all duration-300"
                      style={{
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        opacity: isPlaying ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
              )}

              <div>
                <Slider
                  value={[progressPercent]}
                  max={100}
                  step={0.1}
                  onValueChange={([val]) => setProgress((val / 100) * currentSong.duration)}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(currentSong.duration)}</span>
                </div>
              </div>
            </div>

            {/* Controls - Hide extra controls in Minimal mode */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {settings.playerLayout.style !== "minimal" && (
                <button
                  onClick={toggleShuffle}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={prevSong}
                className="p-3 text-foreground hover:text-primary transition-colors"
              >
                <SkipBack className="w-8 h-8" />
              </button>

              <button
                onClick={isPlaying ? pauseSong : resumeSong}
                className="p-6 bg-primary text-primary-foreground rounded-full glow-primary hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="p-3 text-foreground hover:text-primary transition-colors"
              >
                <SkipForward className="w-8 h-8" />
              </button>

              {settings.playerLayout.style !== "minimal" && (
                <button
                  onClick={toggleRepeat}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    repeat !== "none" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {repeat === "one" ? (
                    <Repeat1 className="w-5 h-5" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Bottom Actions - Hidden in specific layouts if needed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                </button>
                {settings.playerLayout.style !== "minimal" && (
                  <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Download className="w-6 h-6" />
                  </button>
                )}
              </div>

              {settings.playerLayout.style !== "minimal" && (
                <div className="flex items-center gap-3 w-32">
                  <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
                    {volume === 0 || isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <Slider
                    value={[volume]}
                    max={100}
                    onValueChange={([val]) => {
                      setVolume(val);
                      setIsMuted(false);
                    }}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="mini"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-28 lg:bottom-0 left-4 right-4 lg:left-0 lg:right-0 z-40 glass-card border-t border-glass-border safe-area-bottom rounded-2xl lg:rounded-none"
        >
          {/* Progress line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-4 p-4">
            {/* Album Art */}
            <button onClick={onToggleExpand} className="relative group">
              <motion.img
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover"
                style={{ animationPlayState: isPlaying ? "running" : "paused" }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronUp className="w-6 h-6" />
              </div>
            </button>

            {/* Song Info */}
            <div className="flex-1 min-w-0" onClick={onToggleExpand}>
              <h4 className="font-medium truncate">{currentSong.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isLiked ? "text-destructive" : "text-muted-foreground"
                )}
              >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  isPlaying ? pauseSong() : resumeSong();
                }}
                className="p-3 bg-primary text-primary-foreground rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSong();
                }}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
