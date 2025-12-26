"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Realistic footstep sound using layered noise
const playRealisticFootstep = (audioContext: AudioContext) => {
  const now = audioContext.currentTime;

  // Layer 1: Low thump (heel strike)
  const thump = audioContext.createOscillator();
  const thumpGain = audioContext.createGain();
  const thumpFilter = audioContext.createBiquadFilter();

  thump.type = "sine";
  thump.frequency.setValueAtTime(80, now);
  thump.frequency.exponentialRampToValueAtTime(40, now + 0.1);

  thumpFilter.type = "lowpass";
  thumpFilter.frequency.value = 150;

  thumpGain.gain.setValueAtTime(0, now);
  thumpGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  thump.connect(thumpFilter);
  thumpFilter.connect(thumpGain);
  thumpGain.connect(audioContext.destination);

  thump.start(now);
  thump.stop(now + 0.15);

  // Layer 2: Mid click (sole contact)
  const click = audioContext.createOscillator();
  const clickGain = audioContext.createGain();
  const clickFilter = audioContext.createBiquadFilter();

  click.type = "triangle";
  click.frequency.value = 200 + Math.random() * 100;

  clickFilter.type = "bandpass";
  clickFilter.frequency.value = 400;
  clickFilter.Q.value = 2;

  clickGain.gain.setValueAtTime(0, now + 0.01);
  clickGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  click.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(audioContext.destination);

  click.start(now + 0.01);
  click.stop(now + 0.1);

  // Layer 3: High texture (floor friction)
  const bufferSize = audioContext.sampleRate * 0.05;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const noise = audioContext.createBufferSource();
  const noiseGain = audioContext.createGain();
  const noiseFilter = audioContext.createBiquadFilter();

  noise.buffer = noiseBuffer;
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 2000;

  noiseGain.gain.setValueAtTime(0, now + 0.015);
  noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.025);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);

  noise.start(now + 0.015);
};

export default function AnimatedAboutButton() {
  const [phase, setPhase] = useState<"hidden" | "walking" | "celebrating">("hidden");
  const [step, setStep] = useState(0);
  const [celebrateFrame, setCelebrateFrame] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);

  const playStep = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioRef.current.state === "suspended") {
        audioRef.current.resume();
      }
      playRealisticFootstep(audioRef.current);
    } catch {}
  }, []);

  // Start on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("walking");
      setStep(0);
    }, 600);
    return () => clearTimeout(timer);
  }, [animKey]);

  // Walking footsteps
  useEffect(() => {
    if (phase !== "walking") return;

    const interval = setInterval(() => {
      setStep(s => {
        playStep();
        return s + 1;
      });
    }, 320);

    const stopTimer = setTimeout(() => {
      clearInterval(interval);
      setPhase("celebrating");
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimer);
    };
  }, [phase, playStep]);

  // Celebration animation
  useEffect(() => {
    if (phase !== "celebrating") return;
    const interval = setInterval(() => {
      setCelebrateFrame(f => f + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [phase]);

  const replay = () => {
    setAnimKey(k => k + 1);
    setPhase("walking");
    setStep(0);
    setCelebrateFrame(0);
  };

  if (phase === "hidden") return null;

  const isWalking = phase === "walking";
  const isCelebrating = phase === "celebrating";
  const leftFoot = step % 2 === 0;
  const celebrateLeft = celebrateFrame % 2 === 0;

  return (
    <div className="fixed top-20 sm:top-24 lg:top-28 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3">
        {/* Main group */}
        <motion.div
          key={animKey}
          className="flex flex-col items-center"
          initial={{ x: "-50vw", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            x: { duration: isWalking ? 3.5 : 0, ease: [0.25, 0.46, 0.45, 0.94] },
            opacity: { duration: 0.4 }
          }}
        >
          {/* Sign ABOVE the people */}
          <motion.a
            href="/about"
            className="relative z-20 mb-1"
            animate={
              isWalking
                ? { y: [0, -3, 0], rotate: [-2, 2, -2] }
                : isCelebrating
                  ? { y: [0, -6, 0], rotate: [-3, 3, -3], scale: [1, 1.02, 1] }
                  : {}
            }
            transition={{
              duration: isCelebrating ? 0.5 : 0.32,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.96 }}
          >
            <div
              className="px-5 py-2.5 sm:px-7 sm:py-3 lg:px-9 lg:py-4 rounded-full
                         font-bold text-sm sm:text-base lg:text-lg
                         whitespace-nowrap cursor-pointer
                         border-2 border-white/20 backdrop-blur-sm"
              style={{
                background: "rgb(var(--color-accent))",
                color: "#ffffff",
                boxShadow: `
                  0 8px 32px -8px rgba(var(--color-accent), 0.5),
                  0 4px 12px rgba(0,0,0,0.15),
                  inset 0 1px 0 rgba(255,255,255,0.2)
                `,
              }}
            >
              More About Us
            </div>
          </motion.a>

          {/* People holding sign up */}
          <div className="flex items-end justify-center -mt-1">
            {/* Left Person (Male) */}
            <motion.div
              className="relative"
              animate={
                isWalking
                  ? { y: [0, -2, 0] }
                  : isCelebrating
                    ? { y: [0, -4, 0], rotate: celebrateLeft ? -3 : 3 }
                    : {}
              }
              transition={{
                duration: isCelebrating ? 0.5 : 0.32,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg viewBox="0 0 50 100" className="w-10 h-20 sm:w-12 sm:h-24 lg:w-14 lg:h-28">
                {/* Arms reaching UP to hold sign */}
                <motion.path
                  style={{ fill: "rgb(var(--color-accent))" }}
                  animate={{
                    d: isCelebrating
                      ? celebrateLeft
                        ? "M12 28L8 8L12 6L16 26Z"
                        : "M12 28L6 10L10 8L16 26Z"
                      : "M12 28L10 10L14 8L16 26Z"
                  }}
                  transition={{ duration: 0.25 }}
                />
                <motion.circle
                  fill="#FDBF9C"
                  r="4"
                  animate={{
                    cx: isCelebrating ? (celebrateLeft ? 9 : 7) : 11,
                    cy: isCelebrating ? (celebrateLeft ? 5 : 7) : 7
                  }}
                  transition={{ duration: 0.25 }}
                />

                <motion.path
                  style={{ fill: "rgb(var(--color-accent))" }}
                  animate={{
                    d: isCelebrating
                      ? celebrateLeft
                        ? "M38 28L44 10L40 8L34 26Z"
                        : "M38 28L42 8L38 6L34 26Z"
                      : "M38 28L40 10L36 8L34 26Z"
                  }}
                  transition={{ duration: 0.25 }}
                />
                <motion.circle
                  fill="#FDBF9C"
                  r="4"
                  animate={{
                    cx: isCelebrating ? (celebrateLeft ? 43 : 41) : 39,
                    cy: isCelebrating ? (celebrateLeft ? 7 : 5) : 7
                  }}
                  transition={{ duration: 0.25 }}
                />

                {/* Head */}
                <circle cx="25" cy="22" r="8" fill="#FDBF9C" />
                {/* Hair */}
                <path d="M17 20c0-5 4-9 8-9s8 4 8 9c0-2-4-5-8-5s-8 3-8 5z" fill="#4A3728" />
                {/* Eyes */}
                <circle cx="22" cy="22" r="1.5" fill="#2D3748" />
                <circle cx="28" cy="22" r="1.5" fill="#2D3748" />
                {/* Smile */}
                <path d="M22 26c1.5 2 4.5 2 6 0" stroke="#2D3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* Body */}
                <path
                  d="M15 32c0-3 4-5 10-5s10 2 10 5l1 28h-22l1-28z"
                  style={{ fill: "rgb(var(--color-accent))" }}
                />

                {/* Legs with realistic walking */}
                <motion.path
                  fill="#3D4852"
                  animate={{
                    d: isWalking
                      ? leftFoot
                        ? "M18 60l-8 32h10l6-32z"
                        : "M18 60l4 32h10l-6-32z"
                      : isCelebrating
                        ? celebrateLeft
                          ? "M18 60l-4 32h10l2-32z"
                          : "M18 60l4 32h-2l2-32z"
                        : "M18 60l0 32h10l-2-32z"
                  }}
                  transition={{ duration: 0.16, ease: "easeInOut" }}
                />
                <motion.path
                  fill="#3D4852"
                  animate={{
                    d: isWalking
                      ? leftFoot
                        ? "M32 60l8 32h-10l-6-32z"
                        : "M32 60l-4 32h-10l6-32z"
                      : isCelebrating
                        ? celebrateLeft
                          ? "M32 60l4 32h-10l-2-32z"
                          : "M32 60l-4 32h2l-2-32z"
                        : "M32 60l0 32h-10l2-32z"
                  }}
                  transition={{ duration: 0.16, ease: "easeInOut" }}
                />

                {/* Shoes */}
                <motion.ellipse
                  fill="#1A202C"
                  ry="3"
                  rx="7"
                  animate={{
                    cx: isWalking ? (leftFoot ? 12 : 24) : isCelebrating ? (celebrateLeft ? 16 : 18) : 18,
                    cy: 94
                  }}
                  transition={{ duration: 0.16 }}
                />
                <motion.ellipse
                  fill="#1A202C"
                  ry="3"
                  rx="7"
                  animate={{
                    cx: isWalking ? (leftFoot ? 38 : 26) : isCelebrating ? (celebrateLeft ? 34 : 32) : 32,
                    cy: 94
                  }}
                  transition={{ duration: 0.16 }}
                />
              </svg>
            </motion.div>

            {/* Right Person (Female) */}
            <motion.div
              className="relative -ml-3"
              animate={
                isWalking
                  ? { y: [0, -2, 0] }
                  : isCelebrating
                    ? { y: [0, -4, 0], rotate: celebrateLeft ? 3 : -3 }
                    : {}
              }
              transition={{
                duration: isCelebrating ? 0.5 : 0.32,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.16
              }}
            >
              <svg viewBox="0 0 50 100" className="w-10 h-20 sm:w-12 sm:h-24 lg:w-14 lg:h-28">
                {/* Arms reaching UP */}
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isCelebrating
                      ? celebrateLeft
                        ? "M12 28L6 10L10 8L16 26Z"
                        : "M12 28L8 8L12 6L16 26Z"
                      : "M12 28L10 10L14 8L16 26Z"
                  }}
                  transition={{ duration: 0.25 }}
                />
                <motion.circle
                  fill="#E8C4A0"
                  r="3.5"
                  animate={{
                    cx: isCelebrating ? (celebrateLeft ? 7 : 9) : 11,
                    cy: isCelebrating ? (celebrateLeft ? 7 : 5) : 7
                  }}
                  transition={{ duration: 0.25 }}
                />

                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isCelebrating
                      ? celebrateLeft
                        ? "M38 28L42 8L38 6L34 26Z"
                        : "M38 28L44 10L40 8L34 26Z"
                      : "M38 28L40 10L36 8L34 26Z"
                  }}
                  transition={{ duration: 0.25 }}
                />
                <motion.circle
                  fill="#E8C4A0"
                  r="3.5"
                  animate={{
                    cx: isCelebrating ? (celebrateLeft ? 41 : 43) : 39,
                    cy: isCelebrating ? (celebrateLeft ? 5 : 7) : 7
                  }}
                  transition={{ duration: 0.25 }}
                />

                {/* Head */}
                <circle cx="25" cy="22" r="7.5" fill="#E8C4A0" />
                {/* Hair */}
                <ellipse cx="25" cy="16" rx="8" ry="5" fill="#1A1A1A" />
                <path d="M17 18c-1 8-1 14 1 22l-5-8 4-14z" fill="#1A1A1A" />
                <path d="M33 18c1 8 1 14-1 22l5-8-4-14z" fill="#1A1A1A" />
                {/* Earrings */}
                <circle cx="17" cy="24" r="2" fill="#F59E0B" />
                <circle cx="33" cy="24" r="2" fill="#F59E0B" />
                {/* Eyes */}
                <circle cx="22" cy="22" r="1.5" fill="#2D3748" />
                <circle cx="28" cy="22" r="1.5" fill="#2D3748" />
                {/* Smile */}
                <path d="M22 26c1.5 2 4.5 2 6 0" stroke="#2D3748" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                {/* Body */}
                <path d="M15 32c0-3 4-5 10-5s10 2 10 5l1 24h-22l1-24z" fill="#DB2777" />
                {/* Skirt */}
                <path d="M14 56l-4 16h30l-4-16z" fill="#4B5563" />

                {/* Legs */}
                <motion.path
                  fill="#E8C4A0"
                  animate={{
                    d: isWalking
                      ? leftFoot
                        ? "M18 72l-6 20h8l4-20z"
                        : "M18 72l4 20h8l-6-20z"
                      : isCelebrating
                        ? celebrateLeft
                          ? "M18 72l-3 20h8l1-20z"
                          : "M18 72l3 20h-2l1-20z"
                        : "M18 72l0 20h8l-2-20z"
                  }}
                  transition={{ duration: 0.16, ease: "easeInOut" }}
                />
                <motion.path
                  fill="#E8C4A0"
                  animate={{
                    d: isWalking
                      ? leftFoot
                        ? "M32 72l6 20h-8l-4-20z"
                        : "M32 72l-4 20h-8l6-20z"
                      : isCelebrating
                        ? celebrateLeft
                          ? "M32 72l3 20h-8l-1-20z"
                          : "M32 72l-3 20h2l-1-20z"
                        : "M32 72l0 20h-8l2-20z"
                  }}
                  transition={{ duration: 0.16, ease: "easeInOut" }}
                />

                {/* Heels */}
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isWalking
                      ? leftFoot
                        ? "M10 92h10l-1 6h-8z"
                        : "M20 92h10l-1 6h-8z"
                      : isCelebrating
                        ? celebrateLeft
                          ? "M13 92h10l-1 6h-8z"
                          : "M17 92h10l-1 6h-8z"
                        : "M16 92h10l-1 6h-8z"
                  }}
                  transition={{ duration: 0.16 }}
                />
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isWalking
                      ? leftFoot
                        ? "M36 92h10l-1 6h-8z"
                        : "M26 92h10l-1 6h-8z"
                      : isCelebrating
                        ? celebrateLeft
                          ? "M33 92h10l-1 6h-8z"
                          : "M29 92h10l-1 6h-8z"
                        : "M30 92h10l-1 6h-8z"
                  }}
                  transition={{ duration: 0.16 }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Replay button - on the SIDE */}
        {isCelebrating && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={replay}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
                       transition-all hover:scale-105 active:scale-95 self-center"
            style={{
              background: "rgba(var(--color-bg-tertiary), 0.9)",
              color: "rgb(var(--color-text-secondary))",
              border: "1px solid rgba(var(--color-border), 0.3)",
              backdropFilter: "blur(8px)"
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Watch again</span>
          </motion.button>
        )}
      </div>

      {/* Shadow underneath */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: "120px",
          height: "8px",
          background: "rgba(var(--color-text-primary), 0.06)",
          filter: "blur(4px)"
        }}
        initial={{ opacity: 0, scaleX: 0.5 }}
        animate={{ opacity: 0.6, scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </div>
  );
}
