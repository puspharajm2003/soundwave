import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface RotatingAlbumArtProps {
  src: string;
  alt: string;
  isPlaying: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export const RotatingAlbumArt: React.FC<RotatingAlbumArtProps> = ({
  src,
  alt,
  isPlaying,
  size = "large",
  className,
}) => {
  const discRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<gsap.core.Tween | null>(null);

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-32 h-32 md:w-48 md:h-48",
    large: "w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96",
  };

  useEffect(() => {
    if (!discRef.current) return;

    if (isPlaying) {
      // Resume or start rotation
      if (rotationRef.current) {
        rotationRef.current.resume();
      } else {
        rotationRef.current = gsap.to(discRef.current, {
          rotation: "+=360",
          duration: 20,
          ease: "none",
          repeat: -1,
        });
      }
    } else {
      // Decelerate and pause
      if (rotationRef.current) {
        gsap.to(rotationRef.current, {
          timeScale: 0,
          duration: 1.5,
          ease: "power2.out",
          onComplete: () => {
            rotationRef.current?.pause();
          },
        });
      }
    }

    return () => {
      if (rotationRef.current) {
        rotationRef.current.kill();
        rotationRef.current = null;
      }
    };
  }, [isPlaying]);

  // Restart animation with new speed when resuming
  useEffect(() => {
    if (isPlaying && rotationRef.current) {
      gsap.to(rotationRef.current, {
        timeScale: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [isPlaying]);

  return (
    <div className={cn("relative", className)}>
      {/* Glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-3xl opacity-50 transition-opacity duration-500",
          isPlaying ? "opacity-60" : "opacity-30"
        )}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Vinyl disc */}
      <div
        ref={discRef}
        className={cn(
          "relative rounded-full overflow-hidden album-glow",
          sizeClasses[size]
        )}
      >
        {/* Album art */}
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />

        {/* Vinyl grooves overlay */}
        <div className="absolute inset-0 rounded-full">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-20">
            {[...Array(15)].map((_, i) => (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={10 + i * 2.5}
                fill="none"
                stroke="hsl(var(--foreground))"
                strokeWidth="0.3"
              />
            ))}
          </svg>
        </div>

        {/* Center hole */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className={cn(
              "rounded-full bg-background/90 backdrop-blur-sm border-4 border-muted",
              size === "large" ? "w-16 h-16 md:w-20 md:h-20" : 
              size === "medium" ? "w-10 h-10" : "w-3 h-3"
            )}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-muted to-muted-foreground/20" />
          </div>
        </div>

        {/* Shine effect */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none"
        />
      </div>

      {/* Playing indicator pulses */}
      {isPlaying && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
        </>
      )}
    </div>
  );
};
