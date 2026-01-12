import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseGSAPAnimationsOptions {
  scope?: React.RefObject<HTMLElement>;
  enabled?: boolean;
}

export const useGSAPAnimations = (options: UseGSAPAnimationsOptions = {}) => {
  const { scope, enabled = true } = options;
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const ctx = gsap.context(() => {
      // Default animations will be added by child components
    }, scope?.current || document.body);

    contextRef.current = ctx;

    return () => ctx.revert();
  }, [enabled, scope]);

  const addAnimation = useCallback(
    (animation: () => gsap.core.Tween | gsap.core.Timeline) => {
      if (contextRef.current) {
        return contextRef.current.add(animation);
      }
      return animation();
    },
    []
  );

  return { context: contextRef, addAnimation };
};

// Page load animations
export const usePageLoadAnimations = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Hero background fade
      tl.fromTo(
        ".hero-background",
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.2 }
      );

      // Header slide down
      tl.fromTo(
        ".header-content",
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.8"
      );

      // Cards stagger up
      tl.fromTo(
        ".stagger-card",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
        "-=0.4"
      );

      // Mini player slide up last
      tl.fromTo(
        ".mini-player",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.2"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
};

// Parallax scroll effect
export const useParallaxScroll = (
  elementRef: React.RefObject<HTMLElement>,
  speed: number = 0.5
) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        yPercent: -30 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: elementRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => ctx.revert();
  }, [elementRef, speed]);
};

// Floating orbs animation
export const useFloatingAnimation = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".floating-orb").forEach((orb, i) => {
        gsap.to(orb, {
          y: `random(-30, 30)`,
          x: `random(-20, 20)`,
          duration: `random(4, 7)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
};

// Card hover glow effect
export const useCardHoverAnimation = () => {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(card, {
      "--mouse-x": `${x}px`,
      "--mouse-y": `${y}px`,
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  return { handleMouseMove };
};

// Album rotation animation
export const useAlbumRotation = (
  discRef: React.RefObject<HTMLElement>,
  isPlaying: boolean
) => {
  const rotationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!discRef.current) return;

    if (isPlaying) {
      if (rotationRef.current) {
        gsap.to(rotationRef.current, {
          timeScale: 1,
          duration: 0.5,
          ease: "power2.out",
        });
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
      if (rotationRef.current) {
        gsap.to(rotationRef.current, {
          timeScale: 0,
          duration: 1.5,
          ease: "power2.out",
          onComplete: () => rotationRef.current?.pause(),
        });
      }
    }

    return () => {
      if (rotationRef.current) {
        rotationRef.current.kill();
        rotationRef.current = null;
      }
    };
  }, [isPlaying, discRef]);

  return rotationRef;
};

// Progress bar beat pulse
export const useBeatPulse = (
  elementRef: React.RefObject<HTMLElement>,
  isPlaying: boolean
) => {
  useEffect(() => {
    if (!elementRef.current || !isPlaying) return;

    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        scale: 1.02,
        duration: 0.3,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    });

    return () => ctx.revert();
  }, [elementRef, isPlaying]);
};

// Scroll-triggered section animations
export const useSectionAnimations = (containerRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate sections as they enter viewport
      gsap.utils.toArray<HTMLElement>(".animate-section").forEach((section) => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Horizontal scroll cards
      gsap.utils.toArray<HTMLElement>(".horizontal-scroll-container").forEach(
        (container) => {
          const cards = container.querySelectorAll(".scroll-card");

          gsap.fromTo(
            cards,
            { x: 100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: container,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef]);
};

// Master timeline for complex animations
export const createMasterTimeline = () => {
  const master = gsap.timeline({
    paused: true,
    defaults: { ease: "power3.out" },
  });

  return {
    timeline: master,
    addScene: (
      label: string,
      animation: gsap.core.Tween | gsap.core.Timeline,
      position?: string | number
    ) => {
      master.add(animation, position);
      if (label) master.addLabel(label, position);
      return master;
    },
    play: (from?: string | number) => {
      if (from) {
        master.play(from);
      } else {
        master.play();
      }
    },
    pause: () => master.pause(),
    reverse: () => master.reverse(),
    seek: (position: string | number) => master.seek(position),
  };
};

// Reduced motion fallback
export const useReducedMotion = () => {
  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (prefersReducedMotion) {
      gsap.globalTimeline.timeScale(0);
    }
  }, [prefersReducedMotion]);

  return prefersReducedMotion;
};
