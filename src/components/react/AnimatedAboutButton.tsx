"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";

// Soft footstep sound using Web Audio API
const createFootstepSound = (audioContext: AudioContext, isLeft: boolean) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Soft thud sound
  oscillator.frequency.value = isLeft ? 65 : 75;
  oscillator.type = "sine";

  filter.type = "lowpass";
  filter.frequency.value = 200;

  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.08);
};

export default function AnimatedAboutButton() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const footstepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  const playFootsteps = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      let stepCount = 0;
      const maxSteps = 10;
      let isLeft = true;

      footstepIntervalRef.current = setInterval(() => {
        if (stepCount < maxSteps && audioContextRef.current) {
          createFootstepSound(audioContextRef.current, isLeft);
          isLeft = !isLeft;
          stepCount++;
        } else {
          if (footstepIntervalRef.current) {
            clearInterval(footstepIntervalRef.current);
          }
        }
      }, 220);
    } catch {
      // Audio not supported
    }
  }, []);

  const stopFootsteps = useCallback(() => {
    if (footstepIntervalRef.current) {
      clearInterval(footstepIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("aboutAnimated");

    if (hasPlayed) {
      setHasAnimated(true);
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      startAnimation();
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopFootsteps();
    };
  }, []);

  const startAnimation = async () => {
    playFootsteps();

    await controls.start({
      x: 0,
      transition: {
        type: "spring",
        stiffness: 35,
        damping: 14,
        mass: 1,
      },
    });

    stopFootsteps();
    setHasAnimated(true);
    sessionStorage.setItem("aboutAnimated", "true");
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="relative inline-flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main animated container */}
      <motion.div
        className="relative flex items-end"
        initial={{ x: hasAnimated ? 0 : 200 }}
        animate={controls}
      >
        {/* Left Person - Minimal elegant style */}
        <motion.div
          className="relative z-10"
          animate={hasAnimated ? {} : { y: [0, -2, 0] }}
          transition={{
            duration: 0.22,
            repeat: hasAnimated ? 0 : 10,
            ease: "easeInOut",
          }}
        >
          <svg
            viewBox="0 0 32 64"
            fill="none"
            className="w-6 h-12 sm:w-8 sm:h-16 lg:w-10 lg:h-20"
          >
            {/* Head */}
            <circle cx="16" cy="8" r="6" fill="#FDBF9C" />
            {/* Hair */}
            <path
              d="M10 6.5C10 3.5 12.5 1 16 1C19.5 1 22 3.5 22 6.5C22 5 19.5 3.5 16 3.5C12.5 3.5 10 5 10 6.5Z"
              fill="#3D2314"
            />
            {/* Neck */}
            <rect x="14" y="13" width="4" height="3" fill="#FDBF9C" />
            {/* Body */}
            <path
              d="M8 18C8 16 11 14 16 14C21 14 24 16 24 18L25 42H7L8 18Z"
              style={{ fill: "rgb(var(--color-accent))" }}
            />
            {/* Arm reaching up */}
            <path
              d="M7 20L3 12L6 11L10 19Z"
              style={{ fill: "rgb(var(--color-accent))" }}
            />
            {/* Hand */}
            <circle cx="4" cy="10" r="3" fill="#FDBF9C" />
            {/* Pants */}
            <path d="M7 42L5 62H12L14 42H18L20 62H27L25 42H7Z" fill="#2D3748" />
            {/* Shoes */}
            <ellipse cx="8.5" cy="63" rx="4" ry="1.5" fill="#1A202C" />
            <ellipse cx="23.5" cy="63" rx="4" ry="1.5" fill="#1A202C" />
          </svg>
        </motion.div>

        {/* The Button */}
        <motion.a
          href="/about"
          className="relative z-20 -mx-1"
          style={{ marginTop: "-24px" }}
          animate={hasAnimated ? { rotate: -6 } : {
            y: [0, -1.5, 0],
            rotate: [-6, -4, -6, -8, -6],
          }}
          transition={{
            duration: 0.22,
            repeat: hasAnimated ? 0 : 10,
            ease: "easeInOut",
          }}
          whileHover={{
            scale: 1.06,
            rotate: 0,
            y: -4,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="px-3 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-full
                       font-semibold text-[10px] sm:text-xs lg:text-sm
                       whitespace-nowrap cursor-pointer
                       border border-white/20"
            style={{
              background: "rgb(var(--color-accent))",
              color: "#ffffff",
              boxShadow: `
                0 8px 32px -8px rgba(var(--color-accent), 0.5),
                0 2px 8px rgba(0,0,0,0.1),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
            }}
          >
            More About Us
          </div>
        </motion.a>

        {/* Right Person - Minimal elegant style */}
        <motion.div
          className="relative z-10"
          animate={hasAnimated ? {} : { y: [0, -2, 0] }}
          transition={{
            duration: 0.22,
            repeat: hasAnimated ? 0 : 10,
            ease: "easeInOut",
            delay: 0.11,
          }}
        >
          <svg
            viewBox="0 0 32 64"
            fill="none"
            className="w-6 h-12 sm:w-8 sm:h-16 lg:w-10 lg:h-20"
          >
            {/* Head */}
            <circle cx="16" cy="8" r="5.5" fill="#E8C4A0" />
            {/* Hair */}
            <path
              d="M10 7C10 3 13 0 16 0C19 0 22 3 22 7C22 5 20 4 16 4C12 4 10 5 10 7Z"
              fill="#1A1A1A"
            />
            <ellipse cx="16" cy="2" rx="4" ry="2.5" fill="#1A1A1A" />
            {/* Earrings */}
            <circle cx="10" cy="9" r="1" fill="#F59E0B" />
            <circle cx="22" cy="9" r="1" fill="#F59E0B" />
            {/* Neck */}
            <rect x="14" y="12" width="4" height="3" fill="#E8C4A0" />
            {/* Body - Blouse */}
            <path
              d="M8 17C8 15 11 13 16 13C21 13 24 15 24 17L25 38H7L8 17Z"
              fill="#BE185D"
            />
            {/* Arm reaching up */}
            <path
              d="M25 19L29 11L26 10L22 18Z"
              fill="#BE185D"
            />
            {/* Hand */}
            <circle cx="28" cy="9" r="2.5" fill="#E8C4A0" />
            {/* Skirt */}
            <path d="M7 38L4 52H28L25 38H7Z" fill="#374151" />
            {/* Legs */}
            <rect x="10" y="52" width="4" height="10" fill="#E8C4A0" />
            <rect x="18" y="52" width="4" height="10" fill="#E8C4A0" />
            {/* Heels */}
            <path d="M9 62L14 62L14 64L10 64L9 62Z" fill="#BE185D" />
            <path d="M18 62L23 62L22 64L18 64L18 62Z" fill="#BE185D" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Subtle shadow */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 rounded-full"
        style={{
          width: "80%",
          background: "rgba(var(--color-text-primary), 0.08)"
        }}
        initial={{ scaleX: hasAnimated ? 1 : 0.5, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: hasAnimated ? 0 : 2, duration: 0.3 }}
      />
    </motion.div>
  );
}
