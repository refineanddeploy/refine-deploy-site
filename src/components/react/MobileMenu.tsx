"use client";

import { useState, useEffect } from "react";
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

      {/* Mobile Menu Overlay */}
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
              className="fixed top-0 right-0 h-full w-[85vw] max-w-sm z-[58]
                         bg-primary border-l border-theme shadow-elevated"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
            >
              <div className="flex flex-col h-full pt-24 pb-8 px-6">
                {/* Navigation Links */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      className="py-4 text-2xl font-medium text-primary
                                 border-b border-subtle
                                 hover:text-accent transition-colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05, duration: 0.3 }}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.a
                  href="/contact"
                  className="mt-8 py-4 text-center rounded-full text-lg font-medium
                             bg-accent text-white hover:opacity-90 transition-opacity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </motion.a>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bottom branding */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                >
                  <p className="text-sm text-tertiary">
                    Refine & Deploy
                  </p>
                  <p className="text-xs text-tertiary mt-1">
                    Web Design & Development
                  </p>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
