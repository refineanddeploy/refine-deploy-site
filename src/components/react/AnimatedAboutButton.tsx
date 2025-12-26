"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "walking" | "crouching" | "grabbing" | "lifting" | "holding";

export default function AnimatedAboutButton() {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [holdFrame, setHoldFrame] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const soundsPlayed = useRef({ sound: false });
  const fireAudioRef = useRef<HTMLAudioElement | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const initAudio = useCallback(() => {
    if (!audioRef.current || audioRef.current.state === "closed") {
      try {
        audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {}
    }
    if (audioRef.current?.state === "suspended") {
      audioRef.current.resume().then(() => setAudioUnlocked(true)).catch(() => {});
    } else if (audioRef.current?.state === "running") {
      setAudioUnlocked(true);
    }
    return audioRef.current;
  }, []);

  // Start animation on first user interaction (fixes sound not playing on first load)
  useEffect(() => {
    const startOnInteraction = () => {
      if (hasStarted) return;
      setHasStarted(true);
      setAudioUnlocked(true);
    };

    const gestureEvents = ["click", "touchstart", "touchend", "mousedown", "pointerdown"];
    gestureEvents.forEach(e => {
      window.addEventListener(e, startOnInteraction, { passive: true, capture: true });
      document.addEventListener(e, startOnInteraction, { passive: true, capture: true });
    });

    return () => {
      gestureEvents.forEach(e => {
        window.removeEventListener(e, startOnInteraction, { capture: true });
        document.removeEventListener(e, startOnInteraction, { capture: true });
      });
    };
  }, [hasStarted]);

  // Combined animation sound (footsteps + fire)
  const playAnimationSound = useCallback(() => {
    if (fireAudioRef.current) {
      fireAudioRef.current.pause();
      fireAudioRef.current = null;
    }

    const audio = new Audio('/sounds/animation.mp3');
    audio.volume = 0.7;
    fireAudioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    soundsPlayed.current = { sound: false };
    const t = setTimeout(() => { setPhase("walking"); setStepCount(0); }, 200);
    return () => clearTimeout(t);
  }, [animKey, hasStarted]);

  useEffect(() => {
    if (phase !== "walking") return;
    // Play combined sound at start of walking
    if (!soundsPlayed.current.sound) {
      soundsPlayed.current.sound = true;
      playAnimationSound();
    }
    const iv = setInterval(() => { setStepCount(s => s + 1); }, 350);
    const next = setTimeout(() => { clearInterval(iv); setPhase("crouching"); }, 3500);
    return () => { clearInterval(iv); clearTimeout(next); };
  }, [phase, playAnimationSound]);

  useEffect(() => {
    if (phase !== "crouching") return;
    const t = setTimeout(() => setPhase("grabbing"), 500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "grabbing") return;
    const t = setTimeout(() => setPhase("lifting"), 800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "lifting") return;
    const t = setTimeout(() => setPhase("holding"), 700);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "holding") return;
    const iv = setInterval(() => setHoldFrame(f => f + 1), 300);
    return () => clearInterval(iv);
  }, [phase]);

  const replay = useCallback(() => {
    if (audioRef.current) try { audioRef.current.close(); } catch {}
    if (fireAudioRef.current) { fireAudioRef.current.pause(); fireAudioRef.current = null; }
    audioRef.current = null; initAudio();
    soundsPlayed.current = { sound: false };
    setPhase(null); setStepCount(0); setHoldFrame(0); setAnimKey(k => k + 1);
  }, [initAudio]);

  if (!phase) return null;

  const walking = phase === "walking";
  const crouching = phase === "crouching";
  const grabbing = phase === "grabbing";
  const lifting = phase === "lifting";
  const holding = phase === "holding";
  const bent = crouching || grabbing;
  const up = lifting || holding;
  const showFire = crouching || grabbing || lifting || holding;
  const step = stepCount % 2 === 0;
  const dance = holdFrame % 2 === 0;

  // Character height is 80px, container is 120px
  // Button at bottom:75 when up = 75px from bottom = right at head level where hands reach
  const buttonBottom = grabbing ? 15 : up ? 75 : 0;

  return (
    <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
      <div className="flex justify-center">
        {/* Container - characters are 80px tall */}
        <div className="relative" style={{ width: "200px", height: "120px" }}>

          {/* BUTTON - centered between characters */}
          <AnimatePresence>
            {(grabbing || up) && (
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
                initial={{ bottom: 0, opacity: 0, scale: 0.8 }}
                animate={{
                  bottom: buttonBottom,
                  opacity: 1,
                  scale: 1,
                  rotate: holding ? (dance ? -3 : 3) : 0,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.a href="/about" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <div
                    className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap"
                    style={{
                      background: "rgb(var(--color-accent))",
                      color: "#fff",
                      boxShadow: "0 4px 16px -4px rgba(var(--color-accent), 0.5)",
                    }}
                  >
                    More About Us
                  </div>
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MALE CHARACTER - left side (snow clothes) */}
          <motion.div
            key={`m${animKey}`}
            className="absolute bottom-0 left-0"
            initial={{ x: "-50vw" }}
            animate={{ x: 0 }}
            transition={{ duration: walking ? 3.5 : 0.3 }}
          >
            <motion.svg
              viewBox="0 0 60 90"
              style={{ width: "70px", height: "80px" }}
              animate={{ y: walking ? [0, -2, 0] : 0 }}
              transition={{ duration: 0.35, repeat: walking ? Infinity : 0 }}
            >
              {/* Winter Hat/Beanie */}
              <ellipse cx="30" cy="5" rx="11" ry="5" fill="#1E3A5F" />
              <rect x="19" y="3" width="22" height="8" rx="2" fill="#1E3A5F" />
              <circle cx="30" cy="1" r="3" fill="#fff" /> {/* Pom pom */}

              {/* Head */}
              <circle cx="30" cy="14" r="8" fill="#FDBF9C" />
              <circle cx="26" cy="13" r="1.5" fill="#333" />
              <circle cx="34" cy="13" r="1.5" fill="#333" />
              <path d="M26 17 Q30 20 34 17" stroke="#333" strokeWidth="1.5" fill="none" />

              {/* Scarf */}
              <rect x="22" y="21" width="16" height="5" rx="2" fill="#C41E3A" />
              <rect x="35" y="23" width="4" height="12" rx="1" fill="#C41E3A" />

              {/* Winter Coat Body */}
              <motion.rect
                x="18" y="25" width="24" rx="3" fill="#1E3A5F"
                animate={{ height: bent ? 18 : 26 }}
              />
              {/* Coat zipper */}
              <motion.line x1="30" y1="26" x2="30" stroke="#FFD700" strokeWidth="1" animate={{ y2: bent ? 42 : 50 }} />

              {/* RIGHT ARM with coat sleeve */}
              <motion.g style={{ transformOrigin: "42px 27px" }}>
                <motion.line
                  x1="42" y1="27"
                  stroke="#1E3A5F"
                  strokeWidth="7"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 54 : up ? 52 : (walking ? (step ? 50 : 54) : 52),
                    y2: bent ? 38 : up ? 2 : (walking ? (step ? 34 : 30) : 32),
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* Mittens */}
                <motion.circle
                  r="5"
                  fill="#C41E3A"
                  animate={{
                    cx: bent ? 56 : up ? 54 : (walking ? (step ? 52 : 56) : 54),
                    cy: bent ? 40 : up ? 0 : (walking ? (step ? 36 : 32) : 34),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* LEFT ARM with coat sleeve */}
              <motion.g style={{ transformOrigin: "18px 27px" }}>
                <motion.line
                  x1="18" y1="27"
                  stroke="#1E3A5F"
                  strokeWidth="7"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 6 : (holding ? (dance ? 2 : 10) : (walking ? (step ? 10 : 6) : 8)),
                    y2: bent ? 38 : (holding ? (dance ? 12 : 38) : (walking ? (step ? 30 : 34) : 32)),
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* Mittens */}
                <motion.circle
                  r="5"
                  fill="#C41E3A"
                  animate={{
                    cx: bent ? 4 : (holding ? (dance ? 0 : 8) : (walking ? (step ? 8 : 4) : 6)),
                    cy: bent ? 40 : (holding ? (dance ? 10 : 40) : (walking ? (step ? 32 : 36) : 34)),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* Snow Pants */}
              <motion.g animate={{ x: walking ? (step ? -3 : 3) : 0 }}>
                <motion.rect fill="#2C3E50" x="21" width="8" rx="2" animate={{ y: bent ? 42 : 50, height: bent ? 18 : 22 }} />
                {/* Snow Boots */}
                <motion.rect fill="#5D4037" x="20" width="10" rx="2" animate={{ y: bent ? 58 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
              <motion.g animate={{ x: walking ? (step ? 3 : -3) : 0 }}>
                <motion.rect fill="#2C3E50" x="31" width="8" rx="2" animate={{ y: bent ? 42 : 50, height: bent ? 18 : 22 }} />
                {/* Snow Boots */}
                <motion.rect fill="#5D4037" x="30" width="10" rx="2" animate={{ y: bent ? 58 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
            </motion.svg>
          </motion.div>

          {/* FEMALE CHARACTER - right side (snow clothes) */}
          <motion.div
            key={`f${animKey}`}
            className="absolute bottom-0 right-0"
            initial={{ x: "50vw" }}
            animate={{ x: 0 }}
            transition={{ duration: walking ? 3.5 : 0.3 }}
          >
            <motion.svg
              viewBox="0 0 60 90"
              style={{ width: "70px", height: "80px" }}
              animate={{ y: walking ? [0, -2, 0] : 0 }}
              transition={{ duration: 0.35, repeat: walking ? Infinity : 0, delay: 0.175 }}
            >
              {/* Winter Hat with ear flaps */}
              <ellipse cx="30" cy="5" rx="12" ry="5" fill="#E91E63" />
              <rect x="18" y="3" width="24" height="10" rx="2" fill="#E91E63" />
              <rect x="18" y="10" width="6" height="8" rx="2" fill="#E91E63" /> {/* Left ear flap */}
              <rect x="36" y="10" width="6" height="8" rx="2" fill="#E91E63" /> {/* Right ear flap */}
              <ellipse cx="30" cy="1" rx="4" ry="2" fill="#fff" /> {/* Fluffy top */}

              {/* Head */}
              <circle cx="30" cy="14" r="7" fill="#DEB887" />
              <circle cx="27" cy="13" r="1.5" fill="#333" />
              <circle cx="33" cy="13" r="1.5" fill="#333" />
              <path d="M27 17 Q30 19 33 17" stroke="#333" strokeWidth="1.5" fill="none" />

              {/* Scarf */}
              <rect x="21" y="20" width="18" height="5" rx="2" fill="#fff" />
              <rect x="18" y="22" width="5" height="14" rx="1" fill="#fff" />

              {/* Winter Coat Body */}
              <motion.path
                fill="#E91E63"
                animate={{ d: bent ? "M18 24 L14 44 L46 44 L42 24 Z" : "M18 24 L12 52 L48 52 L42 24 Z" }}
              />
              {/* Coat buttons */}
              <circle cx="30" cy="30" r="2" fill="#fff" />
              <circle cx="30" cy="38" r="2" fill="#fff" />
              <motion.circle cx="30" r="2" fill="#fff" animate={{ cy: bent ? 44 : 46 }} />

              {/* LEFT ARM with coat sleeve */}
              <motion.g style={{ transformOrigin: "18px 26px" }}>
                <motion.line
                  x1="18" y1="26"
                  stroke="#E91E63"
                  strokeWidth="7"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 6 : up ? 8 : (walking ? (step ? 10 : 6) : 8),
                    y2: bent ? 38 : up ? 2 : (walking ? (step ? 30 : 34) : 32),
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* White mittens */}
                <motion.circle
                  r="5"
                  fill="#fff"
                  animate={{
                    cx: bent ? 4 : up ? 6 : (walking ? (step ? 8 : 4) : 6),
                    cy: bent ? 40 : up ? 0 : (walking ? (step ? 32 : 36) : 34),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* RIGHT ARM with coat sleeve */}
              <motion.g style={{ transformOrigin: "42px 26px" }}>
                <motion.line
                  x1="42" y1="26"
                  stroke="#E91E63"
                  strokeWidth="7"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 54 : (holding ? (dance ? 58 : 50) : (walking ? (step ? 50 : 54) : 52)),
                    y2: bent ? 38 : (holding ? (dance ? 12 : 38) : (walking ? (step ? 34 : 30) : 32)),
                  }}
                  transition={{ duration: 0.3 }}
                />
                {/* White mittens */}
                <motion.circle
                  r="5"
                  fill="#fff"
                  animate={{
                    cx: bent ? 56 : (holding ? (dance ? 60 : 52) : (walking ? (step ? 52 : 56) : 54)),
                    cy: bent ? 40 : (holding ? (dance ? 10 : 40) : (walking ? (step ? 36 : 32) : 34)),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* Snow Pants */}
              <motion.g animate={{ x: walking ? (step ? -2 : 2) : 0 }}>
                <motion.rect fill="#2C3E50" x="23" width="7" rx="2" animate={{ y: bent ? 44 : 52, height: bent ? 14 : 20 }} />
                {/* Snow Boots */}
                <motion.rect fill="#5D4037" x="22" width="9" rx="2" animate={{ y: bent ? 56 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
              <motion.g animate={{ x: walking ? (step ? 2 : -2) : 0 }}>
                <motion.rect fill="#2C3E50" x="30" width="7" rx="2" animate={{ y: bent ? 44 : 52, height: bent ? 14 : 20 }} />
                {/* Snow Boots */}
                <motion.rect fill="#5D4037" x="29" width="9" rx="2" animate={{ y: bent ? 56 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
            </motion.svg>
          </motion.div>

          {/* Fire Animation - Multiple Flames with Smoke */}
          <AnimatePresence>
            {showFire && (
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                style={{ width: 70, height: 55 }}
              >
                {/* Glow effect - wider for multiple flames */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: 80,
                    height: 50,
                    bottom: -8,
                    background: "radial-gradient(ellipse, rgba(255,120,50,0.5) 0%, rgba(255,80,20,0.25) 40%, transparent 70%)",
                    filter: "blur(10px)",
                  }}
                  animate={{
                    opacity: [0.6, 0.9, 0.7, 0.85, 0.6],
                    scale: [1, 1.1, 0.95, 1.05, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Smoke particles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`smoke-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: 6 + i * 2,
                      height: 6 + i * 2,
                      left: 28 + (i - 1.5) * 6,
                      bottom: 40,
                      background: "rgba(120, 120, 120, 0.3)",
                      filter: "blur(2px)",
                    }}
                    animate={{
                      y: [-5, -35, -60],
                      x: [0, (i - 1.5) * 4, (i - 1.5) * 8],
                      opacity: [0.4, 0.25, 0],
                      scale: [0.8, 1.5, 2.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Left small flame */}
                <motion.svg
                  viewBox="0 0 24 35"
                  style={{ width: 18, height: 28, position: "absolute", left: 5, bottom: 0 }}
                  animate={{
                    scaleX: [1, 1.08, 0.92, 1.05, 1],
                    scaleY: [1, 1.1, 0.94, 1.06, 1],
                  }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                >
                  <motion.path
                    d="M12 2 C12 2 4 12 4 20 C4 28 8 33 12 33 C16 33 20 28 20 20 C20 12 12 2 12 2"
                    fill="url(#fireGradientOuterL)"
                    animate={{
                      d: [
                        "M12 2 C12 2 4 12 4 20 C4 28 8 33 12 33 C16 33 20 28 20 20 C20 12 12 2 12 2",
                        "M12 4 C12 4 3 11 3 19 C3 27 7 33 12 33 C17 33 21 27 21 19 C21 11 12 4 12 4",
                        "M12 3 C12 3 5 13 5 21 C5 29 9 33 12 33 C15 33 19 29 19 21 C19 13 12 3 12 3",
                      ]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.ellipse cx="12" rx="3" fill="url(#fireGradientCoreL)"
                    animate={{ cy: [26, 24, 27, 25, 26], ry: [4, 5, 3, 4.5, 4] }}
                    transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="fireGradientOuterL" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FF4500" />
                      <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                    <linearGradient id="fireGradientCoreL" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFFACD" />
                    </linearGradient>
                  </defs>
                </motion.svg>

                {/* Center main flame (larger) */}
                <motion.svg
                  viewBox="0 0 30 42"
                  style={{ width: 26, height: 38, position: "absolute", left: 22, bottom: 0 }}
                  animate={{
                    scaleX: [1, 1.06, 0.94, 1.03, 1],
                    scaleY: [1, 1.08, 0.95, 1.05, 1],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.path
                    d="M15 2 C15 2 5 14 5 24 C5 34 10 40 15 40 C20 40 25 34 25 24 C25 14 15 2 15 2"
                    fill="url(#fireGradientOuterC)"
                    animate={{
                      d: [
                        "M15 2 C15 2 5 14 5 24 C5 34 10 40 15 40 C20 40 25 34 25 24 C25 14 15 2 15 2",
                        "M15 4 C15 4 3 13 3 23 C3 33 9 40 15 40 C21 40 27 33 27 23 C27 13 15 4 15 4",
                        "M15 3 C15 3 6 15 6 25 C6 35 11 40 15 40 C19 40 24 35 24 25 C24 15 15 3 15 3",
                      ]
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M15 12 C15 12 10 20 10 28 C10 34 12 38 15 38 C18 38 20 34 20 28 C20 20 15 12 15 12"
                    fill="url(#fireGradientInnerC)"
                    animate={{
                      d: [
                        "M15 12 C15 12 10 20 10 28 C10 34 12 38 15 38 C18 38 20 34 20 28 C20 20 15 12 15 12",
                        "M15 14 C15 14 8 19 8 27 C8 33 11 38 15 38 C19 38 22 33 22 27 C22 19 15 14 15 14",
                        "M15 13 C15 13 11 21 11 29 C11 35 13 38 15 38 C17 38 19 35 19 29 C19 21 15 13 15 13",
                      ]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                  />
                  <motion.ellipse cx="15" rx="4" fill="url(#fireGradientCoreC)"
                    animate={{ cy: [32, 30, 33, 31, 32], ry: [5, 6, 4, 5.5, 5] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="fireGradientOuterC" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FF4500" />
                      <stop offset="50%" stopColor="#FF6B35" />
                      <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                    <linearGradient id="fireGradientInnerC" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FF8C00" />
                      <stop offset="60%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFEC8B" />
                    </linearGradient>
                    <linearGradient id="fireGradientCoreC" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFFACD" />
                    </linearGradient>
                  </defs>
                </motion.svg>

                {/* Right small flame */}
                <motion.svg
                  viewBox="0 0 24 35"
                  style={{ width: 18, height: 28, position: "absolute", right: 5, bottom: 0 }}
                  animate={{
                    scaleX: [1, 1.1, 0.9, 1.04, 1],
                    scaleY: [1, 1.12, 0.92, 1.07, 1],
                  }}
                  transition={{ duration: 0.65, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                >
                  <motion.path
                    d="M12 2 C12 2 4 12 4 20 C4 28 8 33 12 33 C16 33 20 28 20 20 C20 12 12 2 12 2"
                    fill="url(#fireGradientOuterR)"
                    animate={{
                      d: [
                        "M12 2 C12 2 4 12 4 20 C4 28 8 33 12 33 C16 33 20 28 20 20 C20 12 12 2 12 2",
                        "M12 3 C12 3 5 11 5 19 C5 27 9 33 12 33 C15 33 19 27 19 19 C19 11 12 3 12 3",
                        "M12 4 C12 4 3 13 3 21 C3 29 7 33 12 33 C17 33 21 29 21 21 C21 13 12 4 12 4",
                      ]
                    }}
                    transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.ellipse cx="12" rx="3" fill="url(#fireGradientCoreR)"
                    animate={{ cy: [26, 24, 27, 25, 26], ry: [4, 5, 3, 4.5, 4] }}
                    transition={{ duration: 0.38, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="fireGradientOuterR" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FF4500" />
                      <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                    <linearGradient id="fireGradientCoreR" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFFACD" />
                    </linearGradient>
                  </defs>
                </motion.svg>

                {/* Sparks */}
                {holding && [...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 2,
                      height: 2,
                      background: "#FFD700",
                      left: 15 + i * 10,
                      bottom: 35,
                      boxShadow: "0 0 4px 1px rgba(255, 200, 50, 0.6)",
                    }}
                    animate={{
                      y: [-5, -20, -35],
                      x: [0, (i - 2) * 6, (i - 2) * 10],
                      opacity: [1, 0.7, 0],
                      scale: [1, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 1.0,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dirt particles */}
          {grabbing && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 3 + Math.random() * 3,
                    height: 3 + Math.random() * 3,
                    background: "rgba(var(--color-text-tertiary), 0.4)",
                    left: `${-15 + Math.random() * 30}px`
                  }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
              ))}
            </div>
          )}

          {/* Replay button */}
          {holding && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={replay}
              className="absolute -right-6 bottom-4 pointer-events-auto
                         w-5 h-5 rounded-full flex items-center justify-center
                         hover:scale-110 active:scale-90 transition-transform"
              style={{
                background: "rgba(var(--color-bg-tertiary), 0.8)",
                color: "rgb(var(--color-text-secondary))",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
