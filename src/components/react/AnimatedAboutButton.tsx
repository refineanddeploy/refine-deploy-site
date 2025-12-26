"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "walking" | "crouching" | "grabbing" | "lifting" | "holding";

export default function AnimatedAboutButton() {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [holdFrame, setHoldFrame] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const soundsPlayed = useRef({ dig: false, lift: false, celebrate: false });

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

  // Unlock audio on user interaction
  // Note: Only click, touch, and keydown count as "user gestures" for browser autoplay policy
  useEffect(() => {
    const unlock = async () => {
      if (audioUnlocked) return;

      // Create fresh context if needed
      if (!audioRef.current || audioRef.current.state === "closed") {
        try {
          audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch {}
      }

      const ctx = audioRef.current;
      if (!ctx) return;

      // Resume if suspended
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch {}
      }

      // Play silent sound to fully unlock
      if (ctx.state === "running") {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0.001;
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.01);
          setAudioUnlocked(true);
        } catch {}
      }
    };

    // These are the only events browsers consider "user gestures" for audio
    const gestureEvents = ["click", "touchstart", "touchend", "keydown", "mousedown", "pointerdown"];
    gestureEvents.forEach(e => {
      window.addEventListener(e, unlock, { passive: true, capture: true });
      document.addEventListener(e, unlock, { passive: true, capture: true });
    });

    initAudio();

    return () => {
      gestureEvents.forEach(e => {
        window.removeEventListener(e, unlock, { capture: true });
        document.removeEventListener(e, unlock, { capture: true });
      });
    };
  }, [initAudio, audioUnlocked]);

  // Mario-style step - small boing
  const playStep = useCallback(() => {
    const ctx = initAudio(); if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }, [initAudio]);

  // Mario-style dig - brick break
  const playDig = useCallback(() => {
    const ctx = initAudio(); if (!ctx) return;
    const now = ctx.currentTime;

    // Quick descending blip
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }, [initAudio]);

  // Mario-style lift - power up sound
  const playLift = useCallback(() => {
    const ctx = initAudio(); if (!ctx) return;
    const now = ctx.currentTime;

    // Ascending arpeggio like Mario power-up
    const notes = [196, 247, 294, 370, 440]; // G3, B3, D4, F#4, A4
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const startTime = now + i * 0.06;
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  }, [initAudio]);

  // Mario-style celebrate - coin sound
  const playCelebrate = useCallback(() => {
    const ctx = initAudio(); if (!ctx) return;
    const now = ctx.currentTime;

    // Classic coin sound - B5 then E6
    const notes = [988, 1319]; // B5, E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }, [initAudio]);

  useEffect(() => {
    soundsPlayed.current = { dig: false, lift: false, celebrate: false };
    const t = setTimeout(() => { setPhase("walking"); setStepCount(0); }, 200);
    return () => clearTimeout(t);
  }, [animKey]);

  useEffect(() => {
    if (phase !== "walking") return;
    playStep();
    const iv = setInterval(() => { setStepCount(s => s + 1); playStep(); }, 350);
    const next = setTimeout(() => { clearInterval(iv); setPhase("crouching"); }, 3500);
    return () => { clearInterval(iv); clearTimeout(next); };
  }, [phase, playStep]);

  useEffect(() => {
    if (phase !== "crouching") return;
    const t = setTimeout(() => setPhase("grabbing"), 500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "grabbing") return;
    if (!soundsPlayed.current.dig) { soundsPlayed.current.dig = true; playDig(); }
    const t = setTimeout(() => setPhase("lifting"), 800);
    return () => clearTimeout(t);
  }, [phase, playDig]);

  useEffect(() => {
    if (phase !== "lifting") return;
    if (!soundsPlayed.current.lift) { soundsPlayed.current.lift = true; playLift(); }
    const t = setTimeout(() => setPhase("holding"), 700);
    return () => clearTimeout(t);
  }, [phase, playLift]);

  useEffect(() => {
    if (phase !== "holding") return;
    if (!soundsPlayed.current.celebrate) { soundsPlayed.current.celebrate = true; playCelebrate(); }
    const iv = setInterval(() => setHoldFrame(f => f + 1), 300);
    return () => clearInterval(iv);
  }, [phase, playCelebrate]);

  const replay = useCallback(() => {
    if (audioRef.current) try { audioRef.current.close(); } catch {}
    audioRef.current = null; initAudio();
    soundsPlayed.current = { dig: false, lift: false, celebrate: false };
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

          {/* MALE CHARACTER - left side */}
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
              {/* Head */}
              <circle cx="30" cy="12" r="9" fill="#FDBF9C" />
              <path d="M21 10 C21 3 39 3 39 10" fill="#5D4037" />
              <circle cx="26" cy="11" r="1.5" fill="#333" />
              <circle cx="34" cy="11" r="1.5" fill="#333" />
              <path d="M26 16 Q30 19 34 16" stroke="#333" strokeWidth="1.5" fill="none" />

              {/* Body */}
              <motion.rect
                x="20" y="22" width="20" rx="3"
                style={{ fill: "rgb(var(--color-accent))" }}
                animate={{ height: bent ? 18 : 26 }}
              />

              {/* RIGHT ARM - REACHES UP to hold button */}
              <motion.g style={{ transformOrigin: "40px 24px" }}>
                <motion.line
                  x1="40" y1="24"
                  stroke="rgb(var(--color-accent))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 52 : up ? 50 : (walking ? (step ? 48 : 52) : 50),
                    y2: bent ? 36 : up ? 0 : (walking ? (step ? 32 : 28) : 30),
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  r="5"
                  fill="#FDBF9C"
                  animate={{
                    cx: bent ? 54 : up ? 52 : (walking ? (step ? 50 : 54) : 52),
                    cy: bent ? 38 : up ? -2 : (walking ? (step ? 34 : 30) : 32),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* LEFT ARM - waves during celebration */}
              <motion.g style={{ transformOrigin: "20px 24px" }}>
                <motion.line
                  x1="20" y1="24"
                  stroke="rgb(var(--color-accent))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 8 : (holding ? (dance ? 4 : 12) : (walking ? (step ? 12 : 8) : 10)),
                    y2: bent ? 36 : (holding ? (dance ? 10 : 36) : (walking ? (step ? 28 : 32) : 30)),
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  r="5"
                  fill="#FDBF9C"
                  animate={{
                    cx: bent ? 6 : (holding ? (dance ? 2 : 10) : (walking ? (step ? 10 : 6) : 8)),
                    cy: bent ? 38 : (holding ? (dance ? 8 : 38) : (walking ? (step ? 30 : 34) : 32)),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* Legs */}
              <motion.g animate={{ x: walking ? (step ? -3 : 3) : 0 }}>
                <motion.rect fill="#455A64" x="22" width="7" rx="2" animate={{ y: bent ? 40 : 48, height: bent ? 20 : 24 }} />
                <motion.rect fill="#333" x="21" width="9" rx="2" animate={{ y: bent ? 58 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
              <motion.g animate={{ x: walking ? (step ? 3 : -3) : 0 }}>
                <motion.rect fill="#455A64" x="31" width="7" rx="2" animate={{ y: bent ? 40 : 48, height: bent ? 20 : 24 }} />
                <motion.rect fill="#333" x="30" width="9" rx="2" animate={{ y: bent ? 58 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
            </motion.svg>
          </motion.div>

          {/* FEMALE CHARACTER - right side */}
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
              {/* Head */}
              <circle cx="30" cy="12" r="8" fill="#DEB887" />
              <ellipse cx="30" cy="7" rx="10" ry="6" fill="#2C1810" />
              <path d="M20 7 Q18 20 24 32" fill="#2C1810" />
              <path d="M40 7 Q42 20 36 32" fill="#2C1810" />
              <circle cx="26" cy="11" r="1.5" fill="#333" />
              <circle cx="34" cy="11" r="1.5" fill="#333" />
              <path d="M26 16 Q30 19 34 16" stroke="#333" strokeWidth="1.5" fill="none" />

              {/* Body - dress */}
              <motion.path
                fill="#E91E63"
                animate={{ d: bent ? "M20 22 L16 42 L44 42 L40 22 Z" : "M20 22 L14 52 L46 52 L40 22 Z" }}
              />

              {/* LEFT ARM - REACHES UP to hold button */}
              <motion.g style={{ transformOrigin: "20px 24px" }}>
                <motion.line
                  x1="20" y1="24"
                  stroke="#E91E63"
                  strokeWidth="6"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 8 : up ? 10 : (walking ? (step ? 12 : 8) : 10),
                    y2: bent ? 36 : up ? 0 : (walking ? (step ? 28 : 32) : 30),
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  r="5"
                  fill="#DEB887"
                  animate={{
                    cx: bent ? 6 : up ? 8 : (walking ? (step ? 10 : 6) : 8),
                    cy: bent ? 38 : up ? -2 : (walking ? (step ? 30 : 34) : 32),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* RIGHT ARM - waves during celebration */}
              <motion.g style={{ transformOrigin: "40px 24px" }}>
                <motion.line
                  x1="40" y1="24"
                  stroke="#E91E63"
                  strokeWidth="6"
                  strokeLinecap="round"
                  animate={{
                    x2: bent ? 52 : (holding ? (dance ? 56 : 48) : (walking ? (step ? 48 : 52) : 50)),
                    y2: bent ? 36 : (holding ? (dance ? 10 : 36) : (walking ? (step ? 32 : 28) : 30)),
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.circle
                  r="5"
                  fill="#DEB887"
                  animate={{
                    cx: bent ? 54 : (holding ? (dance ? 58 : 50) : (walking ? (step ? 50 : 54) : 52)),
                    cy: bent ? 38 : (holding ? (dance ? 8 : 38) : (walking ? (step ? 34 : 30) : 32)),
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.g>

              {/* Legs */}
              <motion.g animate={{ x: walking ? (step ? -2 : 2) : 0 }}>
                <motion.rect fill="#DEB887" x="24" width="6" rx="2" animate={{ y: bent ? 42 : 52, height: bent ? 16 : 20 }} />
                <motion.rect fill="#E91E63" x="23" width="8" rx="2" animate={{ y: bent ? 56 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
              <motion.g animate={{ x: walking ? (step ? 2 : -2) : 0 }}>
                <motion.rect fill="#DEB887" x="30" width="6" rx="2" animate={{ y: bent ? 42 : 52, height: bent ? 16 : 20 }} />
                <motion.rect fill="#E91E63" x="29" width="8" rx="2" animate={{ y: bent ? 56 : 70, height: bent ? 12 : 14 }} />
              </motion.g>
            </motion.svg>
          </motion.div>

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
