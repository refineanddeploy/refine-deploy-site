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

  // Handle iframe load timeout (for sites that block embedding)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        // Most sites load within 8 seconds, if not, might be blocked
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [activeProject, isLoading]);

  return (
    <div className="relative">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16">

        {/* Phone Display */}
        <div className="relative flex-shrink-0 order-1 lg:order-2">
          {/* Glow Effect */}
          <div className="absolute -inset-8 sm:-inset-12 rounded-[60px] blur-3xl opacity-30"
               style={{ background: "rgb(var(--color-accent))" }} />

          {/* Phone Frame */}
          <motion.div
            className={`relative transition-all duration-500 ${
              isFullscreen
                ? "fixed inset-4 sm:inset-8 z-50 flex items-center justify-center"
                : ""
            }`}
            layout
          >
            {/* Fullscreen Backdrop */}
            <AnimatePresence>
              {isFullscreen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                  onClick={() => setIsFullscreen(false)}
                />
              )}
            </AnimatePresence>

            <motion.div
              className={`relative z-50 ${
                isFullscreen
                  ? "w-[320px] sm:w-[380px] md:w-[420px]"
                  : "w-[260px] sm:w-[300px] lg:w-[320px]"
              }`}
              animate={{
                scale: isFullscreen ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* iPhone Outer Frame - Titanium style */}
              <div
                className="relative rounded-[44px] sm:rounded-[48px] p-[10px] sm:p-[11px]"
                style={{
                  background: "linear-gradient(145deg, #3a3a3c 0%, #2c2c2e 30%, #1c1c1e 100%)",
                  boxShadow: `
                    0 0 0 1px rgba(255,255,255,0.08),
                    0 30px 60px -15px rgba(0, 0, 0, 0.6),
                    0 10px 20px -5px rgba(0, 0, 0, 0.4),
                    inset 0 1px 0 rgba(255,255,255,0.1),
                    inset 0 -1px 0 rgba(0,0,0,0.3)
                  `,
                }}
              >
                {/* Side Buttons - Volume */}
                <div className="absolute left-[-2.5px] top-[90px] sm:top-[105px] w-[2.5px] h-[26px] sm:h-[30px] bg-gradient-to-r from-[#3a3a3c] to-[#2a2a2c] rounded-l-sm" />
                <div className="absolute left-[-2.5px] top-[125px] sm:top-[145px] w-[2.5px] h-[50px] sm:h-[58px] bg-gradient-to-r from-[#3a3a3c] to-[#2a2a2c] rounded-l-sm" />
                <div className="absolute left-[-2.5px] top-[185px] sm:top-[215px] w-[2.5px] h-[50px] sm:h-[58px] bg-gradient-to-r from-[#3a3a3c] to-[#2a2a2c] rounded-l-sm" />

                {/* Side Button - Power */}
                <div className="absolute right-[-2.5px] top-[140px] sm:top-[165px] w-[2.5px] h-[65px] sm:h-[75px] bg-gradient-to-l from-[#3a3a3c] to-[#2a2a2c] rounded-r-sm" />

                {/* Inner Screen Bezel */}
                <div
                  className="relative rounded-[34px] sm:rounded-[38px] overflow-hidden bg-black"
                  style={{
                    aspectRatio: "393 / 852", // iPhone 15 Pro aspect ratio
                  }}
                >
                  {/* Dynamic Island */}
                  <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div
                      className="w-[85px] sm:w-[100px] h-[25px] sm:h-[30px] bg-black rounded-full flex items-center justify-center gap-3"
                      style={{
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.05)",
                      }}
                    >
                      {/* Camera lens */}
                      <div className="w-[9px] sm:w-[11px] h-[9px] sm:h-[11px] rounded-full relative"
                           style={{ background: "radial-gradient(circle at 30% 30%, #2a2a4a, #0d0d1a)" }}>
                        <div className="absolute top-[1px] left-[1px] w-[2px] h-[2px] rounded-full bg-[#4a4a6a] opacity-60" />
                      </div>
                    </div>
                  </div>

                  {/* Screen Content - Interactive iframe */}
                  <div className="absolute inset-0">
                    {/* Loading State */}
                    <AnimatePresence>
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 z-20 flex items-center justify-center"
                          style={{ background: "rgb(var(--color-bg-secondary))" }}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <motion.div
                              className="w-8 h-8 border-2 rounded-full"
                              style={{
                                borderColor: "rgb(var(--color-accent))",
                                borderTopColor: "transparent"
                              }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="text-xs" style={{ color: "rgb(var(--color-text-secondary))" }}>
                              Loading {currentProject.title}...
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error State */}
                    {hasError && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center p-6"
                           style={{ background: "rgb(var(--color-bg-secondary))" }}>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                               style={{ background: "rgba(var(--color-accent), 0.1)" }}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                                 style={{ color: "rgb(var(--color-accent))" }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                          </div>
                          <p className="text-xs" style={{ color: "rgb(var(--color-text-secondary))" }}>
                            Unable to preview
                          </p>
                          <a
                            href={currentProject.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs underline"
                            style={{ color: "rgb(var(--color-accent))" }}
                          >
                            Visit site directly
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Actual Website */}
                    <iframe
                      ref={iframeRef}
                      src={currentProject.url}
                      className="w-full h-full border-0 bg-white"
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
                  <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="w-[90px] sm:w-[110px] h-[4px] bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Fullscreen Toggle */}
              <motion.button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute -bottom-14 sm:-bottom-16 left-1/2 -translate-x-1/2
                           flex items-center gap-2 px-4 py-2 rounded-full
                           text-xs sm:text-sm transition-all duration-300"
                style={{
                  color: "rgb(var(--color-text-secondary))",
                  background: "rgb(var(--color-bg-tertiary))"
                }}
                whileHover={{ scale: 1.05, background: "rgba(var(--color-accent), 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  )}
                </svg>
                {isFullscreen ? "Exit Fullscreen" : "Expand View"}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Project Selector */}
        <div className="flex-1 max-w-xl order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3"
                style={{ color: "rgb(var(--color-text-primary))" }}>
              Experience Our Work
            </h2>
            <p className="mb-8 text-sm sm:text-base"
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
                      ? "rgba(var(--color-accent), 0.1)"
                      : "rgb(var(--color-bg-tertiary))",
                    border: activeProject === index
                      ? "2px solid rgb(var(--color-accent))"
                      : "2px solid transparent"
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide"
                            style={{ color: "rgb(var(--color-accent))" }}>
                        {project.category}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold mt-1"
                          style={{ color: "rgb(var(--color-text-primary))" }}>
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm mt-1 line-clamp-1"
                           style={{ color: "rgb(var(--color-text-secondary))" }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ml-4"
                      style={{
                        background: activeProject === index
                          ? "rgb(var(--color-accent))"
                          : "rgb(var(--color-bg-secondary))",
                        color: activeProject === index
                          ? "#fff"
                          : "rgb(var(--color-text-tertiary))"
                      }}
                      animate={{
                        scale: activeProject === index ? 1 : 0.9,
                      }}
                    >
                      {activeProject === index ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </motion.div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Hint */}
            <div className="mt-6 flex items-center gap-2 text-xs sm:text-sm"
                 style={{ color: "rgb(var(--color-text-tertiary))" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                   style={{ color: "rgb(var(--color-accent))" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click inside the phone to interact with the website</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
