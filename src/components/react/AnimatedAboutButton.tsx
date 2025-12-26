"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Sound effects
const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

const playFootstep = (ctx: AudioContext) => {
  const now = ctx.currentTime;

  // Thump
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.15);

  // Click
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  click.type = "triangle";
  click.frequency.value = 250;
  clickGain.gain.setValueAtTime(0, now + 0.01);
  clickGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  click.connect(clickGain);
  clickGain.connect(ctx.destination);
  click.start(now + 0.01);
  click.stop(now + 0.1);
};

const playDigSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;

  // Scraping/digging noise
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 800;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
};

const playLiftSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;

  // Whoosh/lift sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.4);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.5);

  // Add shimmer
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(600, now);
  osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.15, now + 0.1);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.4);
};

const playCelebrateSound = (ctx: AudioContext) => {
  const now = ctx.currentTime;

  // Happy chime
  [400, 500, 600, 800].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.35);
  });
};

type Phase = "hidden" | "walking" | "pulling" | "lifting" | "celebrating";

export default function AnimatedAboutButton() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [stepCount, setStepCount] = useState(0);
  const [celebrateFrame, setCelebrateFrame] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const soundsPlayedRef = useRef({ dig: false, lift: false, celebrate: false });

  const getAudio = useCallback(() => {
    if (!audioRef.current || audioRef.current.state === "closed") {
      audioRef.current = createAudioContext();
    }
    if (audioRef.current.state === "suspended") {
      audioRef.current.resume();
    }
    return audioRef.current;
  }, []);

  const playStepSound = useCallback(() => {
    try {
      playFootstep(getAudio());
    } catch {}
  }, [getAudio]);

  // Start animation on mount and when animKey changes
  useEffect(() => {
    soundsPlayedRef.current = { dig: false, lift: false, celebrate: false };
    const timer = setTimeout(() => {
      setPhase("walking");
      setStepCount(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [animKey]);

  // Walking phase - footsteps
  useEffect(() => {
    if (phase !== "walking") return;

    const interval = setInterval(() => {
      setStepCount(s => {
        playStepSound();
        return s + 1;
      });
    }, 280);

    const nextPhase = setTimeout(() => {
      clearInterval(interval);
      setPhase("pulling");
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(nextPhase);
    };
  }, [phase, playStepSound]);

  // Pulling phase - dig sound
  useEffect(() => {
    if (phase !== "pulling") return;

    if (!soundsPlayedRef.current.dig) {
      soundsPlayedRef.current.dig = true;
      try {
        playDigSound(getAudio());
      } catch {}
    }

    const nextPhase = setTimeout(() => {
      setPhase("lifting");
    }, 1200);

    return () => clearTimeout(nextPhase);
  }, [phase, getAudio]);

  // Lifting phase - lift sound
  useEffect(() => {
    if (phase !== "lifting") return;

    if (!soundsPlayedRef.current.lift) {
      soundsPlayedRef.current.lift = true;
      try {
        playLiftSound(getAudio());
      } catch {}
    }

    const nextPhase = setTimeout(() => {
      setPhase("celebrating");
    }, 800);

    return () => clearTimeout(nextPhase);
  }, [phase, getAudio]);

  // Celebrating phase - celebrate sound + dance
  useEffect(() => {
    if (phase !== "celebrating") return;

    if (!soundsPlayedRef.current.celebrate) {
      soundsPlayedRef.current.celebrate = true;
      try {
        playCelebrateSound(getAudio());
      } catch {}
    }

    const interval = setInterval(() => {
      setCelebrateFrame(f => f + 1);
    }, 400);

    return () => clearInterval(interval);
  }, [phase, getAudio]);

  const replay = useCallback(() => {
    setPhase("hidden");
    setStepCount(0);
    setCelebrateFrame(0);
    setAnimKey(k => k + 1);
  }, []);

  if (phase === "hidden") return null;

  const isWalking = phase === "walking";
  const isPulling = phase === "pulling";
  const isLifting = phase === "lifting";
  const isCelebrating = phase === "celebrating";
  const leftFoot = stepCount % 2 === 0;
  const danceLeft = celebrateFrame % 2 === 0;

  // Button visibility and position based on phase
  const buttonVisible = isPulling || isLifting || isCelebrating;
  const buttonY = isPulling ? 60 : isLifting ? 0 : isCelebrating ? -20 : 60;

  return (
    <div className="fixed top-24 sm:top-28 lg:top-32 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="relative flex items-end justify-center" style={{ minWidth: "280px", minHeight: "160px" }}>

          {/* LEFT Person (Male) - comes from LEFT */}
          <motion.div
            key={`male-${animKey}`}
            className="absolute bottom-0"
            initial={{ x: -200 }}
            animate={{
              x: isWalking ? -20 : 0,
              y: isPulling ? 10 : 0
            }}
            transition={{
              x: { duration: isWalking ? 2.5 : 0.3, ease: "linear" },
              y: { duration: 0.3 }
            }}
            style={{ left: "20px" }}
          >
            <motion.div
              animate={
                isWalking ? { y: [0, -3, 0] }
                : isPulling ? { y: [0, 5, 0], rotate: [0, -5, 0] }
                : isLifting ? { y: [0, -3, 0] }
                : isCelebrating ? { y: [0, -6, 0], rotate: danceLeft ? -5 : 5 }
                : {}
              }
              transition={{
                duration: isPulling ? 0.4 : isCelebrating ? 0.4 : 0.28,
                repeat: (isWalking || isPulling || isCelebrating) ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <svg viewBox="0 0 60 110" className="w-12 h-24 sm:w-14 sm:h-28">
                {/* Right arm - reaches to button */}
                <motion.path
                  style={{ fill: "rgb(var(--color-accent))" }}
                  animate={{
                    d: isPulling ? "M42 35L70 70L66 74L38 39Z"
                      : isLifting ? "M42 35L68 20L64 16L38 31Z"
                      : isCelebrating ? (danceLeft ? "M42 35L72 15L68 11L38 31Z" : "M42 35L70 20L66 16L38 31Z")
                      : "M42 35L55 55L51 58L38 38Z"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  fill="#FDBF9C"
                  r="5"
                  animate={{
                    cx: isPulling ? 69 : isLifting ? 67 : isCelebrating ? (danceLeft ? 71 : 69) : 54,
                    cy: isPulling ? 72 : isLifting ? 18 : isCelebrating ? (danceLeft ? 13 : 18) : 57
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Left arm - relaxed or helping */}
                <motion.path
                  style={{ fill: "rgb(var(--color-accent))" }}
                  animate={{
                    d: isPulling ? "M18 35L-5 60L-1 64L22 39Z"
                      : isCelebrating ? (danceLeft ? "M18 35L-8 55L-4 59L22 39Z" : "M18 35L-5 50L-1 54L22 39Z")
                      : "M18 35L5 58L9 61L22 38Z"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  fill="#FDBF9C"
                  r="4"
                  animate={{
                    cx: isPulling ? -4 : isCelebrating ? (danceLeft ? -7 : -4) : 6,
                    cy: isPulling ? 62 : isCelebrating ? (danceLeft ? 57 : 52) : 60
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Head */}
                <circle cx="30" cy="18" r="10" fill="#FDBF9C" />
                <path d="M20 15c0-6 5-11 10-11s10 5 10 11c0-3-5-6-10-6s-10 3-10 6z" fill="#4A3728" />
                <circle cx="26" cy="18" r="2" fill="#2D3748" />
                <circle cx="34" cy="18" r="2" fill="#2D3748" />
                <path d="M26 24c2 2.5 6 2.5 8 0" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Body */}
                <motion.path
                  style={{ fill: "rgb(var(--color-accent))" }}
                  animate={{
                    d: isPulling ? "M18 30c0-3 5-6 12-6s12 3 12 6l2 30h-28l2-30z"
                      : "M18 30c0-3 5-6 12-6s12 3 12 6l2 35h-28l2-35z"
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Legs */}
                <motion.path
                  fill="#3D4852"
                  animate={{
                    d: isWalking ? (leftFoot ? "M22 65l-10 38h12l8-38z" : "M22 65l6 38h12l-8-38z")
                      : isPulling ? "M22 60l-4 42h12l2-42z"
                      : isCelebrating ? (danceLeft ? "M22 65l-5 38h12l3-38z" : "M22 65l5 38h-4l3-38z")
                      : "M22 65l0 38h12l-2-38z"
                  }}
                  transition={{ duration: 0.15 }}
                />
                <motion.path
                  fill="#3D4852"
                  animate={{
                    d: isWalking ? (leftFoot ? "M38 65l10 38h-12l-8-38z" : "M38 65l-6 38h-12l8-38z")
                      : isPulling ? "M38 60l4 42h-12l-2-42z"
                      : isCelebrating ? (danceLeft ? "M38 65l5 38h-12l-3-38z" : "M38 65l-5 38h4l-3-38z")
                      : "M38 65l0 38h-12l2-38z"
                  }}
                  transition={{ duration: 0.15 }}
                />

                {/* Shoes */}
                <motion.ellipse
                  fill="#1A202C"
                  ry="4"
                  rx="8"
                  animate={{
                    cx: isWalking ? (leftFoot ? 14 : 30) : isPulling ? 20 : isCelebrating ? (danceLeft ? 19 : 25) : 22,
                    cy: isPulling ? 104 : 105
                  }}
                  transition={{ duration: 0.15 }}
                />
                <motion.ellipse
                  fill="#1A202C"
                  ry="4"
                  rx="8"
                  animate={{
                    cx: isWalking ? (leftFoot ? 46 : 30) : isPulling ? 40 : isCelebrating ? (danceLeft ? 41 : 35) : 38,
                    cy: isPulling ? 104 : 105
                  }}
                  transition={{ duration: 0.15 }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* THE BUTTON/SIGN - emerges from ground */}
          {buttonVisible && (
            <motion.a
              href="/about"
              className="absolute z-20"
              style={{ left: "50%", transform: "translateX(-50%)" }}
              initial={{ y: 80, opacity: 0, scale: 0.8 }}
              animate={{
                y: buttonY,
                opacity: 1,
                scale: 1,
                rotate: isCelebrating ? (danceLeft ? -3 : 3) : 0
              }}
              transition={{
                y: { duration: isPulling ? 1 : 0.6, ease: "easeOut" },
                rotate: { duration: 0.4, repeat: isCelebrating ? Infinity : 0 }
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
            >
              <motion.div
                animate={isCelebrating ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 0.4, repeat: Infinity }}
                className="px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-full
                           font-bold text-sm sm:text-base lg:text-lg
                           whitespace-nowrap cursor-pointer
                           border-2 border-white/20"
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
              </motion.div>
            </motion.a>
          )}

          {/* RIGHT Person (Female) - comes from RIGHT */}
          <motion.div
            key={`female-${animKey}`}
            className="absolute bottom-0"
            initial={{ x: 200 }}
            animate={{
              x: isWalking ? 20 : 0,
              y: isPulling ? 10 : 0
            }}
            transition={{
              x: { duration: isWalking ? 2.5 : 0.3, ease: "linear" },
              y: { duration: 0.3 }
            }}
            style={{ right: "20px" }}
          >
            <motion.div
              animate={
                isWalking ? { y: [0, -3, 0] }
                : isPulling ? { y: [0, 5, 0], rotate: [0, 5, 0] }
                : isLifting ? { y: [0, -3, 0] }
                : isCelebrating ? { y: [0, -6, 0], rotate: danceLeft ? 5 : -5 }
                : {}
              }
              transition={{
                duration: isPulling ? 0.4 : isCelebrating ? 0.4 : 0.28,
                repeat: (isWalking || isPulling || isCelebrating) ? Infinity : 0,
                ease: "easeInOut",
                delay: 0.14
              }}
            >
              <svg viewBox="0 0 60 110" className="w-12 h-24 sm:w-14 sm:h-28">
                {/* Left arm - reaches to button */}
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isPulling ? "M18 35L-10 70L-6 74L22 39Z"
                      : isLifting ? "M18 35L-8 20L-4 16L22 31Z"
                      : isCelebrating ? (danceLeft ? "M18 35L-10 20L-6 16L22 31Z" : "M18 35L-12 15L-8 11L22 31Z")
                      : "M18 35L5 55L9 58L22 38Z"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  fill="#E8C4A0"
                  r="4"
                  animate={{
                    cx: isPulling ? -9 : isLifting ? -7 : isCelebrating ? (danceLeft ? -9 : -11) : 6,
                    cy: isPulling ? 72 : isLifting ? 18 : isCelebrating ? (danceLeft ? 18 : 13) : 57
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Right arm - relaxed or helping */}
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isPulling ? "M42 35L65 60L61 64L38 39Z"
                      : isCelebrating ? (danceLeft ? "M42 35L65 50L61 54L38 39Z" : "M42 35L68 55L64 59L38 39Z")
                      : "M42 35L55 58L51 61L38 38Z"
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  fill="#E8C4A0"
                  r="4"
                  animate={{
                    cx: isPulling ? 64 : isCelebrating ? (danceLeft ? 64 : 67) : 54,
                    cy: isPulling ? 62 : isCelebrating ? (danceLeft ? 52 : 57) : 60
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Head */}
                <circle cx="30" cy="18" r="9" fill="#E8C4A0" />
                <ellipse cx="30" cy="11" rx="9" ry="6" fill="#1A1A1A" />
                <path d="M21 14c-1 10-1 18 2 28l-6-10 4-18z" fill="#1A1A1A" />
                <path d="M39 14c1 10 1 18-2 28l6-10-4-18z" fill="#1A1A1A" />
                <circle cx="21" cy="20" r="2.5" fill="#F59E0B" />
                <circle cx="39" cy="20" r="2.5" fill="#F59E0B" />
                <circle cx="26" cy="18" r="2" fill="#2D3748" />
                <circle cx="34" cy="18" r="2" fill="#2D3748" />
                <path d="M26 24c2 2.5 6 2.5 8 0" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Body */}
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isPulling ? "M18 30c0-3 5-6 12-6s12 3 12 6l2 26h-28l2-26z"
                      : "M18 30c0-3 5-6 12-6s12 3 12 6l2 28h-28l2-28z"
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* Skirt */}
                <motion.path
                  fill="#4B5563"
                  animate={{
                    d: isPulling ? "M16 56l-5 18h38l-5-18z" : "M16 58l-5 18h38l-5-18z"
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Legs */}
                <motion.path
                  fill="#E8C4A0"
                  animate={{
                    d: isWalking ? (leftFoot ? "M22 76l-8 26h10l6-26z" : "M22 76l5 26h10l-7-26z")
                      : isPulling ? "M22 74l-3 28h10l1-28z"
                      : isCelebrating ? (danceLeft ? "M22 76l-4 26h10l2-26z" : "M22 76l4 26h-4l2-26z")
                      : "M22 76l0 26h10l-2-26z"
                  }}
                  transition={{ duration: 0.15 }}
                />
                <motion.path
                  fill="#E8C4A0"
                  animate={{
                    d: isWalking ? (leftFoot ? "M38 76l8 26h-10l-6-26z" : "M38 76l-5 26h-10l7-26z")
                      : isPulling ? "M38 74l3 28h-10l-1-28z"
                      : isCelebrating ? (danceLeft ? "M38 76l4 26h-10l-2-26z" : "M38 76l-4 26h4l-2-26z")
                      : "M38 76l0 26h-10l2-26z"
                  }}
                  transition={{ duration: 0.15 }}
                />

                {/* Heels */}
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isWalking ? (leftFoot ? "M12 102h12l-1 6h-10z" : "M25 102h12l-1 6h-10z")
                      : isPulling ? "M17 102h12l-1 6h-10z"
                      : isCelebrating ? (danceLeft ? "M16 102h12l-1 6h-10z" : "M24 102h12l-1 6h-10z")
                      : "M20 102h12l-1 6h-10z"
                  }}
                  transition={{ duration: 0.15 }}
                />
                <motion.path
                  fill="#DB2777"
                  animate={{
                    d: isWalking ? (leftFoot ? "M44 102h12l-1 6h-10z" : "M31 102h12l-1 6h-10z")
                      : isPulling ? "M39 102h12l-1 6h-10z"
                      : isCelebrating ? (danceLeft ? "M40 102h12l-1 6h-10z" : "M32 102h12l-1 6h-10z")
                      : "M36 102h12l-1 6h-10z"
                  }}
                  transition={{ duration: 0.15 }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Ground/dirt particles when pulling */}
          {isPulling && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + Math.random() * 4,
                    height: 4 + Math.random() * 4,
                    background: "rgba(var(--color-text-tertiary), 0.4)",
                    left: `${40 + Math.random() * 20}%`,
                    bottom: 10
                  }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{
                    y: [-20, -40 - Math.random() * 30],
                    x: (Math.random() - 0.5) * 40,
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 0.3
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Replay button - on the SIDE */}
        {isCelebrating && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={replay}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
                       transition-all hover:scale-105 active:scale-95 self-center mt-8"
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

      {/* Shadow */}
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
        style={{
          width: "200px",
          height: "10px",
          background: "rgba(var(--color-text-primary), 0.08)",
          filter: "blur(5px)"
        }}
        animate={{ opacity: isCelebrating ? 0.7 : 0.4, scaleX: isCelebrating ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
