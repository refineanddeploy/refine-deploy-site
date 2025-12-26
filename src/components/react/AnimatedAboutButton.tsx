"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "walking" | "crouching" | "grabbing" | "lifting" | "holding";

// Global singleton audio to prevent double playing
let globalAudio: HTMLAudioElement | null = null;
let globalAudioPlaying = false;
let globalAudioContext: AudioContext | null = null;
let globalGainNode: GainNode | null = null;
let preloadedAudio: HTMLAudioElement | null = null;

export default function AnimatedAboutButton() {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [holdFrame, setHoldFrame] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const soundsPlayed = useRef({ sound: false });

  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Preload audio on mount for faster playback
  useEffect(() => {
    if (!preloadedAudio) {
      preloadedAudio = new Audio('/sounds/animation.mp3');
      preloadedAudio.preload = 'auto';
      preloadedAudio.load();
    }
    // Also pre-initialize AudioContext on first user interaction
    const initContext = () => {
      if (!globalAudioContext || globalAudioContext.state === 'closed') {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
      }
    };
    window.addEventListener('touchstart', initContext, { once: true });
    window.addEventListener('click', initContext, { once: true });
    return () => {
      window.removeEventListener('touchstart', initContext);
      window.removeEventListener('click', initContext);
    };
  }, []);

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

  // Stop any playing audio (global singleton)
  const stopSound = useCallback(() => {
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio = null;
    }
    globalAudioPlaying = false;
  }, []);

  // Combined animation sound (footsteps + fire) - singleton with Web Audio API for iOS volume control
  const playAnimationSound = useCallback(() => {
    // Prevent double playing from multiple component instances
    if (globalAudioPlaying) return;
    stopSound();
    globalAudioPlaying = true;

    const audio = new Audio('/sounds/animation.mp3');
    globalAudio = audio;

    // Use Web Audio API for volume control (works on iOS)
    const isMobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const targetVolume = isMobile ? 0.22 : 0.5;

    try {
      // Create or reuse AudioContext
      if (!globalAudioContext || globalAudioContext.state === 'closed') {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume if suspended (required for iOS)
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
      }

      // Create gain node for volume control
      globalGainNode = globalAudioContext.createGain();
      globalGainNode.gain.value = targetVolume;

      // Connect audio element to Web Audio API
      const source = globalAudioContext.createMediaElementSource(audio);
      source.connect(globalGainNode);
      globalGainNode.connect(globalAudioContext.destination);

    } catch (e) {
      // Fallback to regular volume (won't work on iOS but better than nothing)
      audio.volume = targetVolume;
    }

    audio.onended = () => { globalAudioPlaying = false; };
    audio.play().catch(() => { globalAudioPlaying = false; });
  }, [stopSound]);

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
    const iv = setInterval(() => setHoldFrame(f => f + 1), 600);
    return () => clearInterval(iv);
  }, [phase]);

  const replay = useCallback(() => {
    // Stop current audio immediately
    stopSound();
    globalAudioPlaying = false;
    if (audioRef.current) try { audioRef.current.close(); } catch {}
    audioRef.current = null;
    initAudio();
    soundsPlayed.current = { sound: false };
    setPhase(null);
    setStepCount(0);
    setHoldFrame(0);
    setAnimKey(k => k + 1);
  }, [initAudio, stopSound]);

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

          {/* Fire Animation - Multiple Flames with Smoke and Real Light */}
          <AnimatePresence>
            {showFire && (
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
                style={{ width: 50, height: 55 }}
              >
                {/* Large ambient light - teal glow (visible in both modes) */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                  style={{
                    width: 280,
                    height: 280,
                    bottom: -80,
                    background: isDark
                      ? "radial-gradient(ellipse, rgba(45,212,191,0.55) 0%, rgba(20,184,166,0.3) 25%, rgba(13,148,136,0.12) 50%, transparent 70%)"
                      : "radial-gradient(ellipse, rgba(45,212,191,0.5) 0%, rgba(20,184,166,0.25) 25%, rgba(13,148,136,0.1) 50%, transparent 70%)",
                    filter: "blur(20px)",
                  }}
                  animate={{
                    opacity: isDark ? [0.85, 1, 0.9, 1, 0.85] : [0.85, 1, 0.9, 1, 0.85],
                    scale: [1, 1.08, 0.96, 1.04, 1],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Core bright teal glow (visible in both modes) */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: 80,
                    height: 55,
                    bottom: -8,
                    background: isDark
                      ? "radial-gradient(ellipse, rgba(94,234,212,0.95) 0%, rgba(45,212,191,0.65) 40%, transparent 70%)"
                      : "radial-gradient(ellipse, rgba(45,212,191,0.85) 0%, rgba(20,184,166,0.55) 40%, transparent 70%)",
                    filter: "blur(8px)",
                  }}
                  animate={{
                    opacity: isDark ? [0.9, 1, 0.92, 1, 0.9] : [0.9, 1, 0.92, 1, 0.9],
                    scale: [1, 1.15, 0.95, 1.1, 1],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Smoke particles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`smoke-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: 6 + i * 2,
                      height: 6 + i * 2,
                      left: 20 + (i - 1.5) * 5,
                      bottom: 40,
                      background: "rgba(100, 100, 100, 0.25)",
                      filter: "blur(2px)",
                    }}
                    animate={{
                      y: [-5, -35, -60],
                      x: [0, (i - 1.5) * 3, (i - 1.5) * 6],
                      opacity: [0.35, 0.2, 0],
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

                {/* Combined flames SVG - all flames in one touching group */}
                <motion.svg
                  viewBox="0 0 50 45"
                  style={{ width: 50, height: 45, position: "absolute", left: 0, bottom: 0 }}
                >
                  {/* Left flame */}
                  <motion.path
                    d="M12 8 C12 8 5 18 5 28 C5 36 8 42 12 42 C16 42 19 36 19 28 C19 18 12 8 12 8"
                    fill="url(#fireGradOuter)"
                    animate={{
                      d: [
                        "M12 8 C12 8 5 18 5 28 C5 36 8 42 12 42 C16 42 19 36 19 28 C19 18 12 8 12 8",
                        "M12 10 C12 10 4 17 4 27 C4 35 7 42 12 42 C17 42 20 35 20 27 C20 17 12 10 12 10",
                        "M12 9 C12 9 6 19 6 29 C6 37 9 42 12 42 C15 42 18 37 18 29 C18 19 12 9 12 9",
                      ]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.ellipse cx="12" rx="3" fill="url(#fireGradCore)"
                    animate={{ cy: [35, 33, 36, 34, 35], ry: [4, 5, 3, 4.5, 4] }}
                    transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Center main flame (taller) */}
                  <motion.path
                    d="M25 2 C25 2 14 16 14 28 C14 38 19 44 25 44 C31 44 36 38 36 28 C36 16 25 2 25 2"
                    fill="url(#fireGradOuter)"
                    animate={{
                      d: [
                        "M25 2 C25 2 14 16 14 28 C14 38 19 44 25 44 C31 44 36 38 36 28 C36 16 25 2 25 2",
                        "M25 4 C25 4 12 15 12 27 C12 37 18 44 25 44 C32 44 38 37 38 27 C38 15 25 4 25 4",
                        "M25 3 C25 3 15 17 15 29 C15 39 20 44 25 44 C30 44 35 39 35 29 C35 17 25 3 25 3",
                      ]
                    }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                  />
                  <motion.path
                    d="M25 14 C25 14 19 22 19 30 C19 36 22 40 25 40 C28 40 31 36 31 30 C31 22 25 14 25 14"
                    fill="url(#fireGradInner)"
                    animate={{
                      d: [
                        "M25 14 C25 14 19 22 19 30 C19 36 22 40 25 40 C28 40 31 36 31 30 C31 22 25 14 25 14",
                        "M25 16 C25 16 17 21 17 29 C17 35 21 40 25 40 C29 40 33 35 33 29 C33 21 25 16 25 16",
                        "M25 15 C25 15 20 23 20 31 C20 37 23 40 25 40 C27 40 30 37 30 31 C30 23 25 15 25 15",
                      ]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                  />
                  <motion.ellipse cx="25" rx="4" fill="url(#fireGradCore)"
                    animate={{ cy: [35, 33, 36, 34, 35], ry: [4, 5.5, 3.5, 5, 4] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Right flame */}
                  <motion.path
                    d="M38 8 C38 8 31 18 31 28 C31 36 34 42 38 42 C42 42 45 36 45 28 C45 18 38 8 38 8"
                    fill="url(#fireGradOuter)"
                    animate={{
                      d: [
                        "M38 8 C38 8 31 18 31 28 C31 36 34 42 38 42 C42 42 45 36 45 28 C45 18 38 8 38 8",
                        "M38 10 C38 10 30 17 30 27 C30 35 33 42 38 42 C43 42 46 35 46 27 C46 17 38 10 38 10",
                        "M38 9 C38 9 32 19 32 29 C32 37 35 42 38 42 C41 42 44 37 44 29 C44 19 38 9 38 9",
                      ]
                    }}
                    transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.ellipse cx="38" rx="3" fill="url(#fireGradCore)"
                    animate={{ cy: [35, 33, 36, 34, 35], ry: [4, 5, 3, 4.5, 4] }}
                    transition={{ duration: 0.38, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Shared gradients */}
                  <defs>
                    <linearGradient id="fireGradOuter" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FF4500" />
                      <stop offset="50%" stopColor="#FF6B35" />
                      <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                    <linearGradient id="fireGradInner" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FF8C00" />
                      <stop offset="60%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FFEC8B" />
                    </linearGradient>
                    <linearGradient id="fireGradCore" x1="0%" y1="100%" x2="0%" y2="0%">
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
                      left: 10 + i * 8,
                      bottom: 38,
                      boxShadow: "0 0 6px 2px rgba(255, 200, 50, 0.8)",
                    }}
                    animate={{
                      y: [-5, -20, -35],
                      x: [0, (i - 2) * 5, (i - 2) * 8],
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
