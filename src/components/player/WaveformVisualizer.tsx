import React, { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  isPlaying: boolean;
  progress: number;
  onSeek: (progress: number) => void;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  progress,
  onSeek,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);
  
  // Generate random but consistent waveform data
  const waveformData = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const baseHeight = 0.3 + Math.sin(i * 0.2) * 0.3;
      const noise = Math.random() * 0.4;
      return Math.min(1, Math.max(0.1, baseHeight + noise));
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const ctx = gsap.context(() => {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        
        gsap.to(bar, {
          scaleY: waveformData[i] * (0.8 + Math.random() * 0.4),
          duration: 0.15 + Math.random() * 0.1,
          ease: "power2.out",
          repeat: -1,
          yoyo: true,
          delay: i * 0.02,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isPlaying, waveformData]);

  useEffect(() => {
    if (isPlaying) return;
    
    // Reset bars when paused
    barsRef.current.forEach((bar, i) => {
      if (!bar) return;
      gsap.to(bar, {
        scaleY: waveformData[i] * 0.6,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }, [isPlaying, waveformData]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = (x / rect.width) * 100;
    onSeek(newProgress);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={cn(
        "relative h-16 flex items-center gap-[2px] cursor-pointer group",
        className
      )}
    >
      {waveformData.map((height, i) => {
        const isPlayed = (i / waveformData.length) * 100 <= progress;
        
        return (
          <div
            key={i}
            ref={(el) => { if (el) barsRef.current[i] = el; }}
            className={cn(
              "flex-1 rounded-full transition-colors duration-200 origin-center",
              isPlayed 
                ? "bg-gradient-to-t from-primary to-accent" 
                : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
            )}
            style={{
              height: `${height * 100}%`,
              transform: `scaleY(${height * 0.6})`,
            }}
          />
        );
      })}
      
      {/* Progress indicator */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-primary rounded-full shadow-lg glow-primary transition-all"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
};
