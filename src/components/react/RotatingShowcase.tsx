"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ShowcaseImage {
  src: string;
  title: string;
  category?: string;
}

interface Props {
  images: ShowcaseImage[];
  interval?: number;
  showCaption?: boolean;
  showControls?: boolean;
}

const FADE_MS = 800;

export default function RotatingShowcase({
  images,
  interval = 3500,
  showCaption = true,
  showControls = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const advance = useCallback((next: number) => {
    setIndex((curr) => {
      setPrev(curr);
      return next;
    });
  }, []);

  const startTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (images.length <= 1) return;
    intervalRef.current = window.setInterval(() => {
      setIndex((curr) => {
        setPrev(curr);
        return (curr + 1) % images.length;
      });
    }, interval);
  }, [images.length, interval]);

  // Auto-rotate
  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [startTimer]);

  // Clear the fade-out copy after the transition completes
  useEffect(() => {
    if (prev === null || prev === index) return;
    const t = window.setTimeout(() => setPrev(null), FADE_MS);
    return () => window.clearTimeout(t);
  }, [prev, index]);

  const goTo = useCallback((next: number) => {
    if (next === index) return;
    advance(next);
    startTimer(); // reset auto-rotate countdown after manual change
  }, [advance, index, startTimer]);

  const goNext = useCallback(() => {
    goTo((index + 1) % images.length);
  }, [goTo, index, images.length]);

  const goPrev = useCallback(() => {
    goTo((index - 1 + images.length) % images.length);
  }, [goTo, index, images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Bottom layer: every image stays mounted so nothing has to load mid-transition. */}
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.title}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{
            opacity: i === index ? 1 : 0,
            zIndex: 0,
          }}
          loading="eager"
          decoding="async"
        />
      ))}

      {/* Top layer: a copy of the previous image, fading out on top of the new one. */}
      {prev !== null && prev !== index && (
        <motion.img
          key={`fade-${prev}-${index}`}
          src={images[prev].src}
          alt={images[prev].title}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ zIndex: 1, pointerEvents: "none" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
          loading="eager"
          decoding="async"
        />
      )}

      {showControls && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9
                       rounded-full flex items-center justify-center text-white
                       transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              zIndex: 3,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9
                       rounded-full flex items-center justify-center text-white
                       transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              zIndex: 3,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                 strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {showCaption && (
        <div
          className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
          style={{ zIndex: 2 }}
        >
          <p className="text-white text-xs sm:text-sm font-semibold leading-tight">
            {images[index].title}
          </p>
          {images[index].category && (
            <p className="text-white/80 text-[10px] sm:text-xs mt-0.5">
              {images[index].category}
            </p>
          )}
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute top-2 right-2 flex gap-1" style={{ zIndex: 2 }}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className="h-1.5 rounded-full transition-all duration-500 hover:opacity-100"
              style={{
                backgroundColor:
                  i === index ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                width: i === index ? "0.875rem" : "0.375rem",
                cursor: "pointer",
                border: "none",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
