"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  navLinks: NavLink[];
}

export default function MobileMenu({ navLinks }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Force solid background on the panel via setProperty('important') —
  // beats any cached CSS, framer-motion inline-style merge, or theme race
  useEffect(() => {
    if (!isOpen) return;
    const el = panelRef.current;
    if (!el) return;
    el.style.setProperty("background-color", isDark ? "#111827" : "#ffffff", "important");
    el.style.setProperty("backdrop-filter", "none", "important");
    el.style.setProperty("-webkit-backdrop-filter", "none", "important");
  }, [isOpen, isDark]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Hamburger Button - Animated */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 flex flex-col items-center justify-center gap-1.5 rounded-full
                   bg-tertiary border border-theme
                   relative z-[60] press-effect"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <motion.span
          className="w-5 h-0.5 bg-current rounded-full block"
          animate={isOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
        <motion.span
          className="w-5 h-0.5 bg-current rounded-full block"
          animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        />
        <motion.span
          className="w-5 h-0.5 bg-current rounded-full block"
          animate={isOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        />
      </button>

      {/* Mobile Menu Overlay — portaled to <body> so it escapes any
          ancestor containing-block trap (e.g. backdrop-filter on the header) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
            {/* Backdrop with blur */}
            <motion.div
              className="fixed inset-0 z-[55]"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Panel */}
            <motion.nav
              ref={panelRef as any}
              className="fixed z-[58] shadow-2xl overflow-hidden"
              style={{
                width: "min(72vw, 17rem)",
                top: "1rem",
                right: "1rem",
                maxHeight: "calc(100vh - 8rem)",
                borderRadius: "1.5rem",
                border: "1px solid rgba(var(--color-border), 0.25)",
              }}
              initial={{ x: "120%" }}
              animate={{ x: 0 }}
              exit={{ x: "120%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
            >
              {/* Dedicated solid background layer — cannot be made transparent */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: isDark ? "#111827" : "#ffffff",
                  zIndex: 0,
                }}
              />
              <div className="relative flex flex-col pt-16 pb-5 px-5" style={{ zIndex: 1 }}>
                {/* Navigation Links */}
                <div className="flex flex-col">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      className="py-2.5 px-2 text-base font-semibold rounded-lg transition-all duration-200"
                      style={{
                        color: "rgb(var(--color-text-primary))",
                        borderBottom: index === navLinks.length - 1
                          ? "none"
                          : "1px solid rgba(var(--color-border), 0.1)",
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "rgb(var(--color-accent))";
                        e.currentTarget.style.background = "rgba(var(--color-accent), 0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "rgb(var(--color-text-primary))";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.a
                  href="/contact"
                  className="mt-4 py-3 text-center rounded-full text-sm font-semibold
                             hover:opacity-90 transition-opacity"
                  style={{
                    background: "rgb(var(--color-accent))",
                    color: "#ffffff"
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </motion.a>
              </div>
            </motion.nav>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
