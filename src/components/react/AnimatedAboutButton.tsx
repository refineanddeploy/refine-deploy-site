"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";

// Realistic footstep sound
const createFootstepSound = (audioContext: AudioContext) => {
  // Create nodes
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  // Connect
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Footstep thud - low frequency
  oscillator.frequency.value = 60 + Math.random() * 30;
  oscillator.type = "sine";

  filter.type = "lowpass";
  filter.frequency.value = 150;

  // Quick attack, fast decay for a "step" sound
  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  oscillator.start(now);
  oscillator.stop(now + 0.12);
};

export default function AnimatedAboutButton() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [leftLegForward, setLeftLegForward] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const walkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  const playFootstep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      createFootstepSound(audioContextRef.current);
    } catch {
      // Audio not supported
    }
  }, []);

  const startWalking = useCallback(() => {
    setIsWalking(true);

    // Alternate legs and play footsteps
    walkIntervalRef.current = setInterval(() => {
      setLeftLegForward(prev => !prev);
      playFootstep();
    }, 350); // Step every 350ms for a slow walk
  }, [playFootstep]);

  const stopWalking = useCallback(() => {
    setIsWalking(false);
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const hasPlayed = sessionStorage.getItem("aboutWalkAnimated");

    if (hasPlayed) {
      setHasAnimated(true);
      setIsVisible(true);
      return;
    }

    // Start after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      runWalkAnimation();
    }, 800);

    return () => {
      clearTimeout(timer);
      stopWalking();
    };
  }, []);

  const runWalkAnimation = async () => {
    startWalking();

    // Walk slowly across - takes about 4 seconds
    await controls.start({
      x: 0,
      transition: {
        duration: 4,
        ease: "linear",
      },
    });

    stopWalking();
    setHasAnimated(true);
    sessionStorage.setItem("aboutWalkAnimated", "true");
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="relative inline-flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Walking group - starts from far right */}
      <motion.div
        className="relative flex items-end"
        initial={{ x: hasAnimated ? 0 : "calc(100vw - 100%)" }}
        animate={controls}
      >
        {/* Left Person */}
        <motion.div className="relative z-10">
          <svg
            viewBox="0 0 40 80"
            fill="none"
            className="w-8 h-16 sm:w-10 sm:h-20 lg:w-12 lg:h-24"
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
            {/* Hand */}
            <circle cx="5" cy="10" r="3.5" fill="#FDBF9C" />

            {/* Legs - Animated walking */}
            <motion.g
              animate={isWalking ? {
                d: leftLegForward
                  ? "M9 48L4 75H14L16 48Z M24 48L29 75H19L17 48Z"
                  : "M9 48L14 75H4L6 48Z M24 48L19 75H29L27 48Z"
              } : {}}
            >
              {/* Left leg */}
              <motion.path
                d={leftLegForward ? "M9 48L4 75H14L16 48Z" : "M9 48L14 75H4L6 48Z"}
                fill="#2D3748"
                animate={isWalking ? {
                  d: leftLegForward
                    ? "M9 48L4 75H14L16 48Z"
                    : "M9 48L14 75H4L6 48Z"
                } : {}}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              />
              {/* Right leg */}
              <motion.path
                d={leftLegForward ? "M24 48L29 75H19L17 48Z" : "M24 48L19 75H29L27 48Z"}
                fill="#2D3748"
                animate={isWalking ? {
                  d: leftLegForward
                    ? "M24 48L29 75H19L17 48Z"
                    : "M24 48L19 75H29L27 48Z"
                } : {}}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              />
            </motion.g>

            {/* Shoes */}
            <motion.ellipse
              cx={leftLegForward ? "9" : "9"}
              cy="77"
              rx="5"
              ry="2"
              fill="#1A202C"
              animate={isWalking ? { cx: leftLegForward ? 6 : 12 } : { cx: 9 }}
              transition={{ duration: 0.35 }}
            />
            <motion.ellipse
              cx={leftLegForward ? "24" : "24"}
              cy="77"
              rx="5"
              ry="2"
              fill="#1A202C"
              animate={isWalking ? { cx: leftLegForward ? 27 : 21 } : { cx: 24 }}
              transition={{ duration: 0.35 }}
            />
          </svg>

          {/* Body bounce while walking */}
          <motion.div
            className="absolute inset-0"
            animate={isWalking ? { y: [0, -2, 0] } : { y: 0 }}
            transition={{ duration: 0.35, repeat: isWalking ? Infinity : 0 }}
          />
        </motion.div>

        {/* The Button being carried */}
        <motion.a
          href="/about"
          className="relative z-20 -mx-2"
          style={{ marginTop: "-32px" }}
          animate={isWalking
            ? { y: [0, -3, 0], rotate: [-8, -5, -8] }
            : { y: 0, rotate: -8 }
          }
          transition={{
            duration: 0.35,
            repeat: isWalking ? Infinity : 0,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.08,
            rotate: 0,
            y: -6,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className="px-4 py-2.5 sm:px-6 sm:py-3 lg:px-7 lg:py-3.5 rounded-full
                       font-semibold text-xs sm:text-sm lg:text-base
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

        {/* Right Person */}
        <motion.div className="relative z-10">
          <svg
            viewBox="0 0 40 80"
            fill="none"
            className="w-8 h-16 sm:w-10 sm:h-20 lg:w-12 lg:h-24"
          >
            {/* Head */}
            <circle cx="20" cy="10" r="6.5" fill="#E8C4A0" />
            {/* Hair - long */}
            <path
              d="M13 8C13 3 16 0 20 0C24 0 27 3 27 8C27 6 24 5 20 5C16 5 13 6 13 8Z"
              fill="#1A1A1A"
            />
            <ellipse cx="20" cy="3" rx="5" ry="3" fill="#1A1A1A" />
            {/* Hair sides */}
            <path d="M13 8C12 15 12 22 14 28L9 22L13 8Z" fill="#1A1A1A" />
            <path d="M27 8C28 15 28 22 26 28L31 22L27 8Z" fill="#1A1A1A" />
            {/* Earrings */}
            <circle cx="13" cy="12" r="1.5" fill="#F59E0B" />
            <circle cx="27" cy="12" r="1.5" fill="#F59E0B" />
            {/* Body - Blouse */}
            <path
              d="M10 19C10 16 14 14 20 14C26 14 30 16 30 19L31 44H9L10 19Z"
              fill="#BE185D"
            />
            {/* Right arm up holding button */}
            <path
              d="M31 21L36 11L33 9L28 19Z"
              fill="#BE185D"
            />
            {/* Hand */}
            <circle cx="35" cy="9" r="3" fill="#E8C4A0" />
            {/* Skirt */}
            <path d="M9 44L5 60H35L31 44H9Z" fill="#374151" />

            {/* Legs */}
            <motion.path
              d="M12 60L10 74H17L15 60Z"
              fill="#E8C4A0"
              animate={isWalking ? {
                d: leftLegForward
                  ? "M12 60L7 74H14L15 60Z"
                  : "M12 60L17 74H10L11 60Z"
              } : {}}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
            <motion.path
              d="M23 60L25 74H32L28 60Z"
              fill="#E8C4A0"
              animate={isWalking ? {
                d: leftLegForward
                  ? "M23 60L28 74H35L30 60Z"
                  : "M23 60L18 74H25L24 60Z"
              } : {}}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />

            {/* Heels */}
            <motion.path
              d="M9 74L15 74L14 78L10 78Z"
              fill="#BE185D"
              animate={isWalking ? {
                d: leftLegForward
                  ? "M6 74L12 74L11 78L7 78Z"
                  : "M15 74L21 74L20 78L16 78Z"
              } : {}}
              transition={{ duration: 0.35 }}
            />
            <motion.path
              d="M24 74L30 74L29 78L25 78Z"
              fill="#BE185D"
              animate={isWalking ? {
                d: leftLegForward
                  ? "M27 74L33 74L32 78L28 78Z"
                  : "M17 74L23 74L22 78L18 78Z"
              } : {}}
              transition={{ duration: 0.35 }}
            />
          </svg>

          {/* Body bounce while walking - offset from left person */}
          <motion.div
            className="absolute inset-0"
            animate={isWalking ? { y: [0, -2, 0] } : { y: 0 }}
            transition={{
              duration: 0.35,
              repeat: isWalking ? Infinity : 0,
              delay: 0.175 // Offset for natural walking
            }}
          />
        </motion.div>
      </motion.div>

      {/* Shadow that follows */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 rounded-full pointer-events-none"
        style={{
          width: "90%",
          background: "rgba(var(--color-text-primary), 0.1)"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hasAnimated ? 1 : 0.6 }}
        transition={{ delay: 0.5 }}
      />
    </motion.div>
  );
}
