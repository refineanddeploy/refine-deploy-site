"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  title: string;
  category: string;
  url: string;
  description?: string;
}

interface Props {
  projects: Project[];
}

export default function InteractivePhone({ projects }: Props) {
  const [activeProject, setActiveProject] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentProject = projects[activeProject];

  const handleProjectChange = (index: number) => {
    if (index !== activeProject) {
      setIsLoading(true);
      setHasError(false);
      setActiveProject(index);
    }
  };

  // Handle iframe load timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [activeProject, isLoading]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Phone component - reusable for both normal and fullscreen
  const PhoneFrame = ({ isFullscreenMode = false }: { isFullscreenMode?: boolean }) => (
    <div
      className={`relative ${
        isFullscreenMode
          ? "w-[280px] sm:w-[320px] md:w-[360px]"
          : "w-[300px] sm:w-[340px] lg:w-[360px]"
      }`}
    >
      {/* iPhone Frame - Natural Titanium */}
      <div
        className="relative rounded-[48px] sm:rounded-[52px] p-[11px] sm:p-[12px]"
        style={{
          background: "linear-gradient(160deg, #48484a 0%, #3a3a3c 20%, #2c2c2e 50%, #1c1c1e 100%)",
          boxShadow: isFullscreenMode
            ? "0 0 0 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : `0 0 0 1px rgba(255,255,255,0.1),
               0 40px 80px -20px rgba(0, 0, 0, 0.7),
               0 20px 40px -10px rgba(0, 0, 0, 0.5),
               inset 0 2px 0 rgba(255,255,255,0.15),
               inset 0 -1px 0 rgba(0,0,0,0.4)`,
        }}
      >
        {/* Side Buttons - Left */}
        <div className="absolute left-[-3px] top-[95px] sm:top-[105px] w-[3px] h-[28px] sm:h-[32px] rounded-l-sm"
             style={{ background: "linear-gradient(to right, #48484a, #3a3a3c)" }} />
        <div className="absolute left-[-3px] top-[135px] sm:top-[150px] w-[3px] h-[55px] sm:h-[62px] rounded-l-sm"
             style={{ background: "linear-gradient(to right, #48484a, #3a3a3c)" }} />
        <div className="absolute left-[-3px] top-[200px] sm:top-[225px] w-[3px] h-[55px] sm:h-[62px] rounded-l-sm"
             style={{ background: "linear-gradient(to right, #48484a, #3a3a3c)" }} />

        {/* Side Button - Right */}
        <div className="absolute right-[-3px] top-[155px] sm:top-[175px] w-[3px] h-[75px] sm:h-[85px] rounded-r-sm"
             style={{ background: "linear-gradient(to left, #48484a, #3a3a3c)" }} />

        {/* Screen Area */}
        <div
          className="relative rounded-[38px] sm:rounded-[42px] overflow-hidden"
          style={{
            background: "#000",
            aspectRatio: "9 / 19.5",
          }}
        >
          {/* Dynamic Island */}
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div
              className="w-[95px] sm:w-[110px] h-[28px] sm:h-[32px] bg-black rounded-full flex items-center justify-center"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}
            >
              <div className="w-[10px] sm:w-[12px] h-[10px] sm:h-[12px] rounded-full"
                   style={{ background: "radial-gradient(circle at 35% 35%, #3a3a5a 0%, #1a1a2a 60%, #0a0a15 100%)" }} />
            </div>
          </div>

          {/* Screen Content */}
          <div className="absolute inset-0">
            {/* Loading State */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ background: "rgb(var(--color-bg-secondary))" }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      className="w-10 h-10 rounded-full"
                      style={{
                        borderColor: "rgb(var(--color-accent))",
                        borderTopColor: "transparent",
                        borderWidth: "3px",
                        borderStyle: "solid"
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "rgb(var(--color-text-secondary))" }}>
                      Loading...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            {hasError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-8"
                   style={{ background: "rgb(var(--color-bg-secondary))" }}>
                <div className="text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                       style={{ background: "rgba(var(--color-accent), 0.15)" }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                         style={{ color: "rgb(var(--color-accent))" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium mb-2" style={{ color: "rgb(var(--color-text-primary))" }}>
                    Preview unavailable
                  </p>
                  <a
                    href={currentProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm font-medium underline underline-offset-2"
                    style={{ color: "rgb(var(--color-accent))" }}
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            )}

            {/* Website iframe */}
            <iframe
              ref={iframeRef}
              src={currentProject.url}
              className="w-full h-full border-0"
              style={{ background: "#fff" }}
              title={currentProject.title}
              onLoad={() => {
                setIsLoading(false);
                setHasError(false);
              }}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              loading="lazy"
            />
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="w-[100px] sm:w-[120px] h-[5px] bg-white/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Project Selector */}
        <div className="w-full lg:flex-1 lg:max-w-md order-1 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
                style={{ color: "rgb(var(--color-text-primary))" }}>
              Experience Our Work
            </h2>
            <p className="mb-8 text-sm sm:text-base leading-relaxed"
               style={{ color: "rgb(var(--color-text-secondary))" }}>
              Interact with live websites we've built. Navigate, scroll, and explore
              just like you would on your own phone.
            </p>

            {/* Project List */}
            <div className="space-y-3">
              {projects.map((project, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleProjectChange(index)}
                  className="w-full p-4 sm:p-5 rounded-2xl text-left transition-all duration-300"
                  style={{
                    background: activeProject === index
                      ? "rgba(var(--color-accent), 0.12)"
                      : "rgb(var(--color-bg-tertiary))",
                    border: activeProject === index
                      ? "2px solid rgb(var(--color-accent))"
                      : "2px solid transparent"
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "rgb(var(--color-accent))" }}>
                        {project.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold mt-1 truncate"
                          style={{ color: "rgb(var(--color-text-primary))" }}>
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm mt-1 truncate"
                           style={{ color: "rgb(var(--color-text-secondary))" }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: activeProject === index
                          ? "rgb(var(--color-accent))"
                          : "rgb(var(--color-bg-secondary))",
                        color: activeProject === index
                          ? "#fff"
                          : "rgb(var(--color-text-tertiary))"
                      }}
                      animate={{ scale: activeProject === index ? 1 : 0.9 }}
                    >
                      {activeProject === index ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </motion.div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Hint */}
            <div className="hidden sm:flex mt-6 items-center gap-2 text-sm"
                 style={{ color: "rgb(var(--color-text-tertiary))" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                   style={{ color: "rgb(var(--color-accent))" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Click inside the phone to interact</span>
            </div>
          </motion.div>
        </div>

        {/* Phone Display - Normal View */}
        <div className="relative order-2 lg:order-2">
          {/* Glow Effect */}
          <div className="absolute -inset-6 sm:-inset-10 rounded-[60px] blur-3xl opacity-25 pointer-events-none"
               style={{ background: "rgb(var(--color-accent))" }} />

          <div className="relative">
            <PhoneFrame />

            {/* Expand Button */}
            <motion.button
              onClick={() => setIsFullscreen(true)}
              className="absolute -bottom-14 left-1/2 -translate-x-1/2
                         flex items-center gap-2 px-5 py-2.5 rounded-full
                         text-sm font-medium transition-all duration-300"
              style={{
                color: "rgb(var(--color-text-primary))",
                background: "rgb(var(--color-bg-tertiary))",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              Fullscreen
            </motion.button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal - Elegant Design */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100]"
          >
            {/* Backdrop with blur */}
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              onClick={() => setIsFullscreen(false)}
            />

            {/* Content Container - Different layout for mobile/desktop */}
            <div className="relative h-full flex flex-col">
              {/* Header with close button */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6">
                <div className="text-white">
                  <p className="text-xs sm:text-sm font-medium opacity-60 uppercase tracking-wider">
                    {currentProject.category}
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold">
                    {currentProject.title}
                  </h3>
                </div>
                <motion.button
                  onClick={() => setIsFullscreen(false)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                             bg-white/10 hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Phone - Centered */}
              <div className="flex-1 flex items-center justify-center px-4 pb-4 sm:pb-8">
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <PhoneFrame isFullscreenMode />
                </motion.div>
              </div>

              {/* Footer hint */}
              <div className="flex-shrink-0 pb-4 sm:pb-6 text-center">
                <p className="text-white/50 text-xs sm:text-sm">
                  Tap outside or press × to close
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
