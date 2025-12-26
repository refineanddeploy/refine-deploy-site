"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Create LOUD footstep sound
const playFootstepSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 100 + Math.random() * 50;
  oscillator.type = "sine";
  filter.type = "lowpass";
  filter.frequency.value = 300;

  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.6, now + 0.01); // Much louder
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  oscillator.start(now);
  oscillator.stop(now + 0.15);
};

export default function AnimatedAboutButton() {
  const [animationPhase, setAnimationPhase] = useState<"hidden" | "walking" | "dancing">("hidden");
  const [stepCount, setStepCount] = useState(0);
  const [danceCount, setDanceCount] = useState(0);
  const [walkKey, setWalkKey] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playFootstep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      playFootstepSound(ctx);
    } catch {
      // Audio not supported
    }
  }, []);

  // Start walking on mount (every page load)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase("walking");
      setStepCount(0);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Walking step counter and sound effect
  useEffect(() => {
    if (animationPhase !== "walking") return;

    const stepInterval = setInterval(() => {
      setStepCount(prev => {
        playFootstep();
        return prev + 1;
      });
    }, 280);

    // Stop walking after 4 seconds, start dancing
    const stopTimer = setTimeout(() => {
      clearInterval(stepInterval);
      setAnimationPhase("dancing");
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(stopTimer);
    };
  }, [animationPhase, playFootstep]);

  // Dancing animation counter (keeps going forever)
  useEffect(() => {
    if (animationPhase !== "dancing") return;

    const danceInterval = setInterval(() => {
      setDanceCount(prev => prev + 1);
    }, 400);

    return () => clearInterval(danceInterval);
  }, [animationPhase]);

  const handleReplay = () => {
    setWalkKey(prev => prev + 1);
    setAnimationPhase("walking");
    setStepCount(0);
    setDanceCount(0);
  };

  const isWalking = animationPhase === "walking";
  const isDancing = animationPhase === "dancing";
  const leftLegForward = stepCount % 2 === 0;
  const danceLeft = danceCount % 2 === 0;

  if (animationPhase === "hidden") return null;

  return (
    <div className="fixed top-24 sm:top-28 lg:top-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
      {/* Main walking/dancing group */}
      <motion.div
        key={walkKey}
        className="flex items-end justify-center"
        initial={{ x: "-100vw" }}
        animate={{ x: 0 }}
        transition={{
          duration: isWalking ? 4 : 0,
          ease: "linear"
        }}
      >
        {/* Left Person (Male) */}
        <motion.div
          className="relative z-10 flex-shrink-0"
          animate={
            isWalking
              ? { y: [0, -4, 0], rotate: 0 }
              : isDancing
                ? { y: [0, -8, 0], rotate: danceLeft ? -5 : 5 }
                : { y: 0 }
          }
          transition={{
            duration: isDancing ? 0.4 : 0.28,
            repeat: (isWalking || isDancing) ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <svg
            viewBox="0 0 40 90"
            fill="none"
            className="w-10 h-20 sm:w-12 sm:h-24 lg:w-14 lg:h-28"
          >
            {/* Head */}
            <circle cx="20" cy="12" r="7" fill="#FDBF9C" />
            {/* Hair */}
            <path
              d="M13 10C13 6 16 3 20 3C24 3 27 6 27 10C27 8 24 6 20 6C16 6 13 8 13 10Z"
              fill="#3D2314"
            />
            {/* Body */}
            <path
              d="M10 22C10 19 14 17 20 17C26 17 30 19 30 22L31 50H9L10 22Z"
              style={{ fill: "rgb(var(--color-accent))" }}
            />

            {/* Arms - up when dancing, one up when walking */}
            <motion.path
              style={{ fill: "rgb(var(--color-accent))" }}
              animate={{
                d: isDancing
                  ? danceLeft
                    ? "M9 24L2 8L5 6L12 22Z"
                    : "M9 24L0 12L3 10L12 22Z"
                  : "M9 24L4 14L7 12L12 22Z"
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.circle
              fill="#FDBF9C"
              r="3.5"
              animate={{
                cx: isDancing ? (danceLeft ? 3 : 1) : 5,
                cy: isDancing ? (danceLeft ? 6 : 10) : 12
              }}
              transition={{ duration: 0.2 }}
            />

            <motion.path
              style={{ fill: "rgb(var(--color-accent))" }}
              animate={{
                d: isDancing
                  ? danceLeft
                    ? "M31 24L40 12L37 10L28 22Z"
                    : "M31 24L38 8L35 6L28 22Z"
                  : "M31 24L35 42L32 43L28 25Z"
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.circle
              fill="#FDBF9C"
              r="3"
              animate={{
                cx: isDancing ? (danceLeft ? 39 : 37) : 34,
                cy: isDancing ? (danceLeft ? 10 : 6) : 44
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Legs */}
            <motion.path
              fill="#2D3748"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M12 50L5 80L13 80L18 50Z"
                    : "M12 50L19 80L27 80L18 50Z"
                  : isDancing
                    ? danceLeft
                      ? "M12 50L6 80L14 80L18 50Z"
                      : "M12 50L18 80L26 80L18 50Z"
                    : "M12 50L10 80L18 80L16 50Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />
            <motion.path
              fill="#2D3748"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M22 50L29 80L37 80L28 50Z"
                    : "M22 50L15 80L23 80L22 50Z"
                  : isDancing
                    ? danceLeft
                      ? "M22 50L28 80L36 80L28 50Z"
                      : "M22 50L16 80L24 80L22 50Z"
                    : "M22 50L24 80L32 80L26 50Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />

            {/* Shoes */}
            <motion.ellipse
              cy="82"
              rx="6"
              ry="2.5"
              fill="#1A202C"
              animate={{
                cx: isWalking
                  ? (leftLegForward ? 9 : 23)
                  : isDancing
                    ? (danceLeft ? 10 : 22)
                    : 14
              }}
              transition={{ duration: 0.14 }}
            />
            <motion.ellipse
              cy="82"
              rx="6"
              ry="2.5"
              fill="#1A202C"
              animate={{
                cx: isWalking
                  ? (leftLegForward ? 33 : 19)
                  : isDancing
                    ? (danceLeft ? 32 : 20)
                    : 28
              }}
              transition={{ duration: 0.14 }}
            />
          </svg>
        </motion.div>

        {/* The Button/Sign being held */}
        <motion.a
          href="/about"
          className="relative z-20 -mx-6 flex-shrink-0"
          animate={
            isWalking
              ? { y: [0, -5, 0], rotate: [-12, -8, -12], marginTop: "-20px" }
              : isDancing
                ? { y: [-40, -48, -40], rotate: [0, -3, 0, 3, 0], marginTop: "-20px" }
                : { y: -40, rotate: 0, marginTop: "-20px" }
          }
          transition={{
            duration: isDancing ? 0.8 : 0.28,
            repeat: (isWalking || isDancing) ? Infinity : 0,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.1,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="px-5 py-2.5 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-full
                       font-bold text-sm sm:text-base lg:text-lg
                       whitespace-nowrap cursor-pointer
                       border-2 border-white/30"
            style={{
              background: "rgb(var(--color-accent))",
              color: "#ffffff",
              boxShadow: `
                0 15px 50px -10px rgba(var(--color-accent), 0.6),
                0 5px 15px rgba(0,0,0,0.2),
                inset 0 2px 0 rgba(255,255,255,0.25)
              `,
            }}
          >
            More About Us
          </div>
        </motion.a>

        {/* Right Person (Female) */}
        <motion.div
          className="relative z-10 flex-shrink-0"
          animate={
            isWalking
              ? { y: [0, -4, 0], rotate: 0 }
              : isDancing
                ? { y: [0, -8, 0], rotate: danceLeft ? 5 : -5 }
                : { y: 0 }
          }
          transition={{
            duration: isDancing ? 0.4 : 0.28,
            repeat: (isWalking || isDancing) ? Infinity : 0,
            ease: "easeInOut",
            delay: 0.14
          }}
        >
          <svg
            viewBox="0 0 40 90"
            fill="none"
            className="w-10 h-20 sm:w-12 sm:h-24 lg:w-14 lg:h-28"
          >
            {/* Head */}
            <circle cx="20" cy="12" r="6.5" fill="#E8C4A0" />
            {/* Hair */}
            <path d="M13 10C13 5 16 2 20 2C24 2 27 5 27 10C27 8 24 7 20 7C16 7 13 8 13 10Z" fill="#1A1A1A" />
            <ellipse cx="20" cy="5" rx="5" ry="3" fill="#1A1A1A" />
            <path d="M13 10C12 17 12 24 14 30L9 24L13 10Z" fill="#1A1A1A" />
            <path d="M27 10C28 17 28 24 26 30L31 24L27 10Z" fill="#1A1A1A" />
            {/* Earrings */}
            <circle cx="13" cy="14" r="1.5" fill="#F59E0B" />
            <circle cx="27" cy="14" r="1.5" fill="#F59E0B" />
            {/* Body */}
            <path d="M10 21C10 18 14 16 20 16C26 16 30 18 30 21L31 46H9L10 21Z" fill="#BE185D" />

            {/* Arms - up when dancing */}
            <motion.path
              fill="#BE185D"
              animate={{
                d: isDancing
                  ? danceLeft
                    ? "M9 23L0 12L3 10L12 21Z"
                    : "M9 23L2 8L5 6L12 21Z"
                  : "M9 23L5 41L8 42L12 24Z"
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.circle
              fill="#E8C4A0"
              r="2.5"
              animate={{
                cx: isDancing ? (danceLeft ? 1 : 3) : 6,
                cy: isDancing ? (danceLeft ? 10 : 6) : 43
              }}
              transition={{ duration: 0.2 }}
            />

            <motion.path
              fill="#BE185D"
              animate={{
                d: isDancing
                  ? danceLeft
                    ? "M31 23L38 8L35 6L28 21Z"
                    : "M31 23L40 12L37 10L28 21Z"
                  : "M31 23L36 13L33 11L28 21Z"
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.circle
              fill="#E8C4A0"
              r="3"
              animate={{
                cx: isDancing ? (danceLeft ? 37 : 39) : 35,
                cy: isDancing ? (danceLeft ? 6 : 10) : 11
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Skirt */}
            <path d="M9 46L5 62H35L31 46H9Z" fill="#374151" />

            {/* Legs */}
            <motion.path
              fill="#E8C4A0"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M12 62L6 78L12 78L15 62Z"
                    : "M12 62L18 78L24 78L17 62Z"
                  : isDancing
                    ? danceLeft
                      ? "M12 62L7 78L13 78L15 62Z"
                      : "M12 62L17 78L23 78L17 62Z"
                    : "M12 62L10 78L16 78L14 62Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />
            <motion.path
              fill="#E8C4A0"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M25 62L31 78L37 78L29 62Z"
                    : "M25 62L19 78L25 78L25 62Z"
                  : isDancing
                    ? danceLeft
                      ? "M25 62L30 78L36 78L29 62Z"
                      : "M25 62L20 78L26 78L25 62Z"
                    : "M25 62L27 78L33 78L28 62Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />

            {/* Heels */}
            <motion.path
              fill="#BE185D"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M5 78L13 78L12 83L6 83Z"
                    : "M17 78L25 78L24 83L18 83Z"
                  : isDancing
                    ? danceLeft
                      ? "M6 78L14 78L13 83L7 83Z"
                      : "M16 78L24 78L23 83L17 83Z"
                    : "M9 78L17 78L16 83L10 83Z"
              }}
              transition={{ duration: 0.14 }}
            />
            <motion.path
              fill="#BE185D"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M30 78L38 78L37 83L31 83Z"
                    : "M18 78L26 78L25 83L19 83Z"
                  : isDancing
                    ? danceLeft
                      ? "M29 78L37 78L36 83L30 83Z"
                      : "M19 78L27 78L26 83L20 83Z"
                    : "M26 78L34 78L33 83L27 83Z"
              }}
              transition={{ duration: 0.14 }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Replay button with text */}
      {isDancing && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleReplay}
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
          style={{
            background: "rgba(var(--color-accent), 0.1)",
            color: "rgb(var(--color-accent))",
            border: "1px solid rgba(var(--color-accent), 0.2)"
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          <span className="text-sm font-medium">Watch again</span>
        </motion.button>
      )}

      {/* Ground shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 rounded-full pointer-events-none"
        style={{
          width: "200px",
          background: "rgba(var(--color-text-primary), 0.08)",
          filter: "blur(4px)"
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{
          opacity: isDancing ? 0.6 : 0.3,
          scaleX: 1
        }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}
