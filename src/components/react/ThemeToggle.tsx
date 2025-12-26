"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  variant?: "default" | "compact";
}

export default function ThemeToggle({ variant = "default" }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
    setTheme(currentTheme || "light");
  }, []);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    audioUnlockedRef.current = true;
  }, []);

  // Play satisfying click sound
  const playClickSound = useCallback(() => {
    if (!audioContextRef.current || !audioUnlockedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Create a satisfying mechanical click
    // First click - attack
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1800, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.03);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.05);

    // Second part - the "snap" of the switch
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(150, now + 0.02);
    gain2.gain.setValueAtTime(0.08, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.08);

    // Subtle resonance
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(400, now + 0.01);
    gain3.gain.setValueAtTime(0.05, now + 0.01);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.01);
    osc3.stop(now + 0.1);
  }, []);

  const toggleTheme = () => {
    initAudio();
    playClickSound();

    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.classList.add("theme-ready");
  };

  // Placeholder during SSR
  if (!mounted) {
    return (
      <div
        className={`${variant === "compact" ? "w-16 h-8" : "w-20 h-10"} rounded-full bg-tertiary`}
        aria-hidden="true"
      />
    );
  }

  const isLight = theme === "light";
  const isCompact = variant === "compact";

  // Sizes
  const trackWidth = isCompact ? 64 : 80;
  const trackHeight = isCompact ? 32 : 40;
  const knobSize = isCompact ? 26 : 32;
  const padding = (trackHeight - knobSize) / 2;
  const knobTravel = trackWidth - knobSize - padding * 2;

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative rounded-full cursor-pointer outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{
        width: trackWidth,
        height: trackHeight,
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      role="switch"
      aria-checked={!isLight}
    >
      {/* Track background */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        animate={{
          background: isLight
            ? "linear-gradient(135deg, #ccfbf1 0%, #5eead4 50%, #14b8a6 100%)"
            : "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Inner shadow for depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1), inset 0 -1px 2px rgba(255,255,255,0.1)",
          }}
        />
      </motion.div>

      {/* Sun icon (left side) */}
      <div
        className="absolute flex items-center justify-center z-10"
        style={{
          left: padding + 2,
          top: "50%",
          transform: "translateY(-50%)",
          width: knobSize - 4,
          height: knobSize - 4,
        }}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isCompact ? "w-3.5 h-3.5" : "w-4 h-4"}
          animate={{
            opacity: isLight ? 0 : 0.7,
            scale: isLight ? 0.8 : 1,
            color: isLight ? "#14b8a6" : "#94a3b8",
          }}
          transition={{ duration: 0.3 }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </motion.svg>
      </div>

      {/* Moon icon (right side) */}
      <div
        className="absolute flex items-center justify-center z-10"
        style={{
          right: padding + 2,
          top: "50%",
          transform: "translateY(-50%)",
          width: knobSize - 4,
          height: knobSize - 4,
        }}
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isCompact ? "w-3.5 h-3.5" : "w-4 h-4"}
          animate={{
            opacity: isLight ? 0.7 : 0,
            scale: isLight ? 1 : 0.8,
            color: isLight ? "#0f766e" : "#c4b5fd",
          }}
          transition={{ duration: 0.3 }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </motion.svg>
      </div>

      {/* Sliding knob */}
      <motion.div
        className="absolute rounded-full z-20 flex items-center justify-center"
        style={{
          width: knobSize,
          height: knobSize,
          top: padding,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)",
        }}
        animate={{
          x: isLight ? padding : padding + knobTravel,
          background: isLight
            ? "linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%)"
            : "linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 100%)",
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
        }}
      >
        {/* Icon inside knob */}
        <motion.div
          animate={{
            rotate: isLight ? 0 : 360,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          {isLight ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isCompact ? "w-4 h-4" : "w-5 h-5"}
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isCompact ? "w-4 h-4" : "w-5 h-5"}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}
