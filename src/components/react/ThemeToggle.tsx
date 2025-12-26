"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";

interface Props {
  variant?: "default" | "compact";
}

export default function ThemeToggle({ variant = "default" }: Props) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const stringControls = useAnimation();
  const ballControls = useAnimation();

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

  // Play realistic light switch click sound - louder on mobile
  const playClickSound = useCallback(() => {
    if (!audioContextRef.current || !audioUnlockedRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Detect mobile for volume boost (1.5x louder on mobile)
    const isMobile = window.innerWidth < 768;
    const volumeMultiplier = isMobile ? 1.5 : 1;

    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / (bufferSize * 0.08));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 3500;
    bandpass.Q.value = 1.5;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 800;

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.8 * volumeMultiplier, now);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    noiseSource.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(mainGain);
    mainGain.connect(ctx.destination);

    const thunk = ctx.createOscillator();
    const thunkGain = ctx.createGain();
    thunk.type = "sine";
    thunk.frequency.setValueAtTime(150, now);
    thunk.frequency.exponentialRampToValueAtTime(80, now + 0.015);
    thunkGain.gain.setValueAtTime(0.3 * volumeMultiplier, now);
    thunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    thunk.connect(thunkGain);
    thunkGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.03);
    thunk.start(now);
    thunk.stop(now + 0.025);
  }, []);

  // Actually toggle the theme
  const doToggle = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      document.body.classList.add("theme-ready");
      return newTheme;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    initAudio();
    playClickSound();
    doToggle();
  }, [initAudio, playClickSound, doToggle]);

  // Handle pull string click - string extends when pulled
  const handlePullClick = useCallback(() => {
    initAudio();

    // Animate string stretching (scaleY from attachment point)
    stringControls.start({
      scaleY: [1, 1.5, 0.9, 1],
      transition: { duration: 0.45, times: [0, 0.3, 0.65, 1], ease: "easeOut" }
    });

    // Animate ball moving down with the extended string
    ballControls.start({
      y: [0, 28, -4, 0],
      transition: { duration: 0.45, times: [0, 0.3, 0.65, 1], ease: "easeOut" }
    });

    playClickSound();
    doToggle();
  }, [initAudio, playClickSound, doToggle, stringControls, ballControls]);

  if (!mounted) {
    return (
      <div
        className={`${variant === "compact" ? "w-14 h-7" : "w-16 h-8"} rounded-full bg-tertiary`}
        aria-hidden="true"
      />
    );
  }

  const isLight = theme === "light";
  const isCompact = variant === "compact";

  // Sizes
  const trackWidth = isCompact ? 56 : 64;
  const trackHeight = isCompact ? 28 : 32;
  const knobSize = isCompact ? 22 : 26;
  const padding = (trackHeight - knobSize) / 2;
  const knobTravel = trackWidth - knobSize - padding * 2;

  // String sizes - hanging from right side of button
  const stringLength = isCompact ? 56 : 80;
  const ballSize = isCompact ? 12 : 16;

  return (
    <div className="relative">
      {/* Toggle Switch */}
      <motion.button
        onClick={toggleTheme}
        className="relative rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
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
              ? "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #5eead4 100%)"
              : "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1)",
            }}
          />
        </motion.div>

        {/* Sun icon (left side) */}
        <div
          className="absolute flex items-center justify-center z-10"
          style={{
            left: padding + 1,
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
            className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"}
            animate={{
              opacity: isLight ? 0 : 0.6,
              color: "#94a3b8",
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
            right: padding + 1,
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
            className={isCompact ? "w-3 h-3" : "w-3.5 h-3.5"}
            animate={{
              opacity: isLight ? 0.6 : 0,
              color: "#0f766e",
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
            boxShadow: "0 2px 6px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)",
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
          <motion.div
            animate={{ rotate: isLight ? 0 : 360 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {isLight ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isCompact ? "w-3 h-3" : "w-4 h-4"}
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
                className={isCompact ? "w-3 h-3" : "w-4 h-4"}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </motion.div>
        </motion.div>
      </motion.button>

      {/* Pull String - Hanging from right side of button */}
      <div
        className="absolute cursor-pointer select-none"
        style={{
          right: isCompact ? 8 : 10,
          top: trackHeight - 2,
          width: ballSize + 4,
          height: stringLength + ballSize + 30,
        }}
        onClick={handlePullClick}
        aria-label="Pull to toggle theme"
        role="button"
      >
        {/* String/cord - stretches from top */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-0"
          style={{
            width: 2,
            height: stringLength,
            background: isLight
              ? "linear-gradient(180deg, #78716c 0%, #57534e 50%, #44403c 100%)"
              : "linear-gradient(180deg, #52525b 0%, #3f3f46 50%, #27272a 100%)",
            borderRadius: 1,
            transformOrigin: "top center",
          }}
          animate={stringControls}
        />

        {/* Metal ball - moves with the string */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: stringLength - 2,
            width: ballSize,
            height: ballSize,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 30% 25%, #ffffff 0%, #e5e5e5 25%, #a3a3a3 60%, #737373 85%, #525252 100%)"
              : "radial-gradient(circle at 30% 25%, #d4d4d8 0%, #a1a1aa 25%, #71717a 60%, #52525b 85%, #3f3f46 100%)",
            boxShadow: isLight
              ? "0 3px 6px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.9)"
              : "0 3px 6px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)",
          }}
          animate={ballControls}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95, y: 8 }}
        >
          {/* Highlight reflection */}
          <div
            className="absolute rounded-full"
            style={{
              top: "12%",
              left: "18%",
              width: "35%",
              height: "30%",
              background: "rgba(255,255,255,0.7)",
              filter: "blur(1px)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
