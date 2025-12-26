"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Create footstep sound
const playFootstepSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 80 + Math.random() * 40;
  oscillator.type = "sine";
  filter.type = "lowpass";
  filter.frequency.value = 200;

  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  oscillator.start(now);
  oscillator.stop(now + 0.12);
};

export default function AnimatedAboutButton() {
  const [animationPhase, setAnimationPhase] = useState<"hidden" | "walking" | "arrived">("hidden");
  const [stepCount, setStepCount] = useState(0);
  const [walkKey, setWalkKey] = useState(0); // Key to force re-animation on replay
  const audioContextRef = useRef<AudioContext | null>(null);
  const alreadyPlayedRef = useRef(false);

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

  // Initial mount - check if already animated
  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("aboutWalkAnimated");

    if (hasPlayed) {
      alreadyPlayedRef.current = true;
      setAnimationPhase("arrived");
      return;
    }

    // Start walking after page loads
    const timer = setTimeout(() => {
      setAnimationPhase("walking");
      setStepCount(0);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Walking step counter and sound effect
  useEffect(() => {
    if (animationPhase !== "walking") return;

    // Play footsteps every 280ms during the walk
    const stepInterval = setInterval(() => {
      setStepCount(prev => {
        playFootstep();
        return prev + 1;
      });
    }, 280);

    // Stop walking after 4 seconds
    const stopTimer = setTimeout(() => {
      clearInterval(stepInterval);
      setAnimationPhase("arrived");
      sessionStorage.setItem("aboutWalkAnimated", "true");
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(stopTimer);
    };
  }, [animationPhase, playFootstep]);

  const handleReplay = () => {
    sessionStorage.removeItem("aboutWalkAnimated");
    alreadyPlayedRef.current = false;
    setWalkKey(prev => prev + 1); // Force new animation
    setAnimationPhase("walking");
    setStepCount(0);
  };

  const isWalking = animationPhase === "walking";
  const leftLegForward = stepCount % 2 === 0;

  // Skip initial animation if already played before
  const shouldSkipInitialAnimation = alreadyPlayedRef.current && animationPhase === "arrived";

  // Don't render until ready
  if (animationPhase === "hidden") return null;

  return (
    <div className="relative flex items-end gap-2">
      {/* Main walking group - walks from LEFT to position */}
      <motion.div
        key={walkKey}
        className="flex items-end"
        initial={shouldSkipInitialAnimation ? { x: 0 } : { x: -600 }}
        animate={{ x: 0 }}
        transition={{
          duration: isWalking ? 4 : 0,
          ease: "linear"
        }}
      >
        {/* Left Person (Male) - body bounces while walking */}
        <motion.div
          className="relative z-10 flex-shrink-0"
          animate={isWalking ? { y: [0, -4, 0] } : { y: 0 }}
          transition={{ duration: 0.28, repeat: isWalking ? Infinity : 0, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 40 80"
            fill="none"
            className="w-8 h-16 sm:w-10 sm:h-20 lg:w-11 lg:h-22"
          >
            {/* Head */}
            <circle cx="20" cy="10" r="7" fill="#FDBF9C" />
            {/* Hair */}
            <path
              d="M13 8C13 4 16 1 20 1C24 1 27 4 27 8C27 6 24 4 20 4C16 4 13 6 13 8Z"
              fill="#3D2314"
            />
            {/* Body */}
            <path
              d="M10 20C10 17 14 15 20 15C26 15 30 17 30 20L31 48H9L10 20Z"
              style={{ fill: "rgb(var(--color-accent))" }}
            />
            {/* Left arm up holding button */}
            <path
              d="M9 22L4 12L7 10L12 20Z"
              style={{ fill: "rgb(var(--color-accent))" }}
            />
            <circle cx="5" cy="10" r="3.5" fill="#FDBF9C" />
            {/* Right arm relaxed */}
            <path
              d="M31 22L35 40L32 41L28 23Z"
              style={{ fill: "rgb(var(--color-accent))" }}
            />
            <circle cx="34" cy="42" r="3" fill="#FDBF9C" />

            {/* Legs with walking animation */}
            <motion.path
              fill="#2D3748"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M12 48L5 75L13 75L18 48Z"
                    : "M12 48L19 75L27 75L18 48Z"
                  : "M12 48L10 75L18 75L16 48Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />
            <motion.path
              fill="#2D3748"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M22 48L29 75L37 75L28 48Z"
                    : "M22 48L15 75L23 75L22 48Z"
                  : "M22 48L24 75L32 75L26 48Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />

            {/* Shoes */}
            <motion.ellipse
              cy="77"
              rx="6"
              ry="2.5"
              fill="#1A202C"
              animate={{ cx: isWalking ? (leftLegForward ? 9 : 23) : 14 }}
              transition={{ duration: 0.14 }}
            />
            <motion.ellipse
              cy="77"
              rx="6"
              ry="2.5"
              fill="#1A202C"
              animate={{ cx: isWalking ? (leftLegForward ? 33 : 19) : 28 }}
              transition={{ duration: 0.14 }}
            />
          </svg>
        </motion.div>

        {/* The Button being carried - bounces with walking */}
        <motion.a
          href="/about"
          className="relative z-20 -mx-4 flex-shrink-0"
          style={{ marginTop: "-24px" }}
          animate={isWalking
            ? { y: [0, -5, 0], rotate: [-12, -8, -12] }
            : { y: 0, rotate: -12 }
          }
          transition={{
            duration: 0.28,
            repeat: isWalking ? Infinity : 0,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.1,
            rotate: 0,
            y: -8,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-full
                       font-semibold text-xs sm:text-sm
                       whitespace-nowrap cursor-pointer
                       border border-white/20"
            style={{
              background: "rgb(var(--color-accent))",
              color: "#ffffff",
              boxShadow: `
                0 10px 40px -10px rgba(var(--color-accent), 0.5),
                0 4px 12px rgba(0,0,0,0.15),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
            }}
          >
            More About Us
          </div>
        </motion.a>

        {/* Right Person (Female) - body bounces offset from left person */}
        <motion.div
          className="relative z-10 flex-shrink-0"
          animate={isWalking ? { y: [0, -4, 0] } : { y: 0 }}
          transition={{ duration: 0.28, repeat: isWalking ? Infinity : 0, ease: "easeInOut", delay: 0.14 }}
        >
          <svg
            viewBox="0 0 40 80"
            fill="none"
            className="w-8 h-16 sm:w-10 sm:h-20 lg:w-11 lg:h-22"
          >
            {/* Head */}
            <circle cx="20" cy="10" r="6.5" fill="#E8C4A0" />
            {/* Hair */}
            <path d="M13 8C13 3 16 0 20 0C24 0 27 3 27 8C27 6 24 5 20 5C16 5 13 6 13 8Z" fill="#1A1A1A" />
            <ellipse cx="20" cy="3" rx="5" ry="3" fill="#1A1A1A" />
            <path d="M13 8C12 15 12 22 14 28L9 22L13 8Z" fill="#1A1A1A" />
            <path d="M27 8C28 15 28 22 26 28L31 22L27 8Z" fill="#1A1A1A" />
            {/* Earrings */}
            <circle cx="13" cy="12" r="1.5" fill="#F59E0B" />
            <circle cx="27" cy="12" r="1.5" fill="#F59E0B" />
            {/* Body */}
            <path d="M10 19C10 16 14 14 20 14C26 14 30 16 30 19L31 44H9L10 19Z" fill="#BE185D" />
            {/* Right arm up holding button */}
            <path d="M31 21L36 11L33 9L28 19Z" fill="#BE185D" />
            <circle cx="35" cy="9" r="3" fill="#E8C4A0" />
            {/* Left arm relaxed */}
            <path d="M9 21L5 39L8 40L12 22Z" fill="#BE185D" />
            <circle cx="6" cy="41" r="2.5" fill="#E8C4A0" />
            {/* Skirt */}
            <path d="M9 44L5 60H35L31 44H9Z" fill="#374151" />

            {/* Legs with walking animation */}
            <motion.path
              fill="#E8C4A0"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M12 60L6 74L12 74L15 60Z"
                    : "M12 60L18 74L24 74L17 60Z"
                  : "M12 60L10 74L16 74L14 60Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />
            <motion.path
              fill="#E8C4A0"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M25 60L31 74L37 74L29 60Z"
                    : "M25 60L19 74L25 74L25 60Z"
                  : "M25 60L27 74L33 74L28 60Z"
              }}
              transition={{ duration: 0.14, ease: "easeInOut" }}
            />

            {/* Heels */}
            <motion.path
              fill="#BE185D"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M5 74L13 74L12 79L6 79Z"
                    : "M17 74L25 74L24 79L18 79Z"
                  : "M9 74L17 74L16 79L10 79Z"
              }}
              transition={{ duration: 0.14 }}
            />
            <motion.path
              fill="#BE185D"
              animate={{
                d: isWalking
                  ? leftLegForward
                    ? "M30 74L38 74L37 79L31 79Z"
                    : "M18 74L26 74L25 79L19 79Z"
                  : "M26 74L34 74L33 79L27 79Z"
              }}
              transition={{ duration: 0.14 }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Replay button */}
      {animationPhase === "arrived" && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          onClick={handleReplay}
          className="p-2 rounded-full transition-all hover:scale-110 active:scale-95 flex-shrink-0"
          style={{
            background: "rgba(var(--color-accent), 0.12)",
            color: "rgb(var(--color-accent))"
          }}
          title="Replay walking animation"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 sm:w-5 sm:h-5"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </motion.button>
      )}

      {/* Ground shadow */}
      <motion.div
        className="absolute -bottom-1 left-0 right-8 h-2 rounded-full pointer-events-none"
        style={{
          background: "rgba(var(--color-text-primary), 0.06)",
          filter: "blur(3px)"
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{
          opacity: animationPhase === "arrived" ? 0.5 : 0.2,
          scaleX: animationPhase === "hidden" ? 0 : 1
        }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}
