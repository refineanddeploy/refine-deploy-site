"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  title: string;
  category: string;
  url?: string;      // For live sites (iframe)
  image?: string;    // For design images (scrollable)
  description?: string;
  type?: "live" | "design";  // Determines phone vs desktop
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
  const isDesignProject = currentProject.type === "design" || !!currentProject.image;

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

  // For images, set loading to false faster
  useEffect(() => {
    if (isDesignProject) {
      const timeout = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [activeProject, isDesignProject]);

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

  // Phone Frame Component
  const PhoneFrame = ({ isFullscreenMode = false }: { isFullscreenMode?: boolean }) => (
    <div
      className={`relative ${
        isFullscreenMode
          ? "w-[280px] sm:w-[320px] md:w-[360px]"
          : "w-[300px] sm:w-[340px] lg:w-[360px]"
      }`}
    >
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
        {/* Side Buttons */}
        <div className="absolute left-[-3px] top-[95px] sm:top-[105px] w-[3px] h-[28px] sm:h-[32px] rounded-l-sm"
             style={{ background: "linear-gradient(to right, #48484a, #3a3a3c)" }} />
        <div className="absolute left-[-3px] top-[135px] sm:top-[150px] w-[3px] h-[55px] sm:h-[62px] rounded-l-sm"
             style={{ background: "linear-gradient(to right, #48484a, #3a3a3c)" }} />
        <div className="absolute left-[-3px] top-[200px] sm:top-[225px] w-[3px] h-[55px] sm:h-[62px] rounded-l-sm"
             style={{ background: "linear-gradient(to right, #48484a, #3a3a3c)" }} />
        <div className="absolute right-[-3px] top-[155px] sm:top-[175px] w-[3px] h-[75px] sm:h-[85px] rounded-r-sm"
             style={{ background: "linear-gradient(to left, #48484a, #3a3a3c)" }} />

        {/* Screen Area */}
        <div
          className="relative rounded-[38px] sm:rounded-[42px] overflow-hidden"
          style={{ background: "#000", aspectRatio: "9 / 19.5" }}
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
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ background: "rgb(var(--color-bg-secondary))" }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            {hasError && currentProject.url && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-8"
                   style={{ background: "rgb(var(--color-bg-secondary))" }}>
                <div className="text-center">
                  <p className="text-sm font-medium mb-2" style={{ color: "rgb(var(--color-text-primary))" }}>
                    Preview unavailable
                  </p>
                  <a href={currentProject.url} target="_blank" rel="noopener noreferrer"
                     className="text-sm font-medium underline" style={{ color: "rgb(var(--color-accent))" }}>
                    Open in new tab
                  </a>
                </div>
              </div>
            )}

            {/* Live Site iframe */}
            {currentProject.url && (
              <iframe
                ref={iframeRef}
                src={currentProject.url}
                className="w-full h-full border-0"
                style={{ background: "#fff" }}
                title={currentProject.title}
                onLoad={() => { setIsLoading(false); setHasError(false); }}
                onError={() => { setIsLoading(false); setHasError(true); }}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                loading="lazy"
              />
            )}
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="w-[100px] sm:w-[120px] h-[5px] bg-white/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  // Desktop/Laptop Frame Component
  const DesktopFrame = ({ isFullscreenMode = false }: { isFullscreenMode?: boolean }) => (
    <div className={`relative ${isFullscreenMode ? "w-full max-w-3xl" : "w-full max-w-2xl"}`}>
      {/* Screen bezel */}
      <div
        className="rounded-t-xl p-2 sm:p-3"
        style={{
          background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)"
        }}
      >
        {/* Camera dot */}
        <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700" />

        {/* Screen content area */}
        <div
          className="relative bg-gray-900 rounded-lg overflow-hidden"
          style={{ aspectRatio: "16/10" }}
        >
          {/* Browser chrome */}
          <div
            className="flex items-center gap-2 px-3 py-2 border-b"
            style={{
              background: "rgb(var(--color-bg-secondary))",
              borderColor: "rgb(var(--color-border))"
            }}
          >
            {/* Traffic lights */}
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            {/* URL bar */}
            <div
              className="flex-1 mx-2 px-3 py-1 rounded text-xs truncate"
              style={{
                background: "rgb(var(--color-bg-tertiary))",
                color: "rgb(var(--color-text-tertiary))"
              }}
            >
              {currentProject.title.toLowerCase().replace(/\s+/g, '')}.com
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="relative overflow-y-auto hide-scrollbar" style={{ height: "calc(100% - 36px)" }}>
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ background: "rgb(var(--color-bg-secondary))" }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            {currentProject.image && (
              <motion.img
                key={currentProject.image}
                src={currentProject.image}
                alt={currentProject.title}
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                draggable={false}
                onLoad={() => setIsLoading(false)}
              />
            )}

            {/* Scroll hint */}
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(var(--color-bg-primary), 0.9)",
                color: "rgb(var(--color-text-secondary))",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              Scroll to explore
            </motion.div>
          </div>
        </div>
      </div>

      {/* Laptop base/keyboard */}
      <div
        className="relative h-3 sm:h-4 rounded-b-xl"
        style={{
          background: "linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-1 rounded-b"
          style={{ background: "#2d2d2d" }}
        />
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

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
              Explore live websites and design concepts. Navigate, scroll, and interact with our projects.
            </p>

            {/* Project List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto hide-scrollbar pr-2">
              {projects.map((project, index) => {
                const isDesign = project.type === "design" || !!project.image;
                return (
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "rgb(var(--color-accent))" }}>
                            {project.category}
                          </span>
                          {/* Type badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isDesign
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {isDesign ? "Design" : "Live"}
                          </span>
                        </div>
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
                          color: activeProject === index ? "#fff" : "rgb(var(--color-text-tertiary))"
                        }}
                        animate={{ scale: activeProject === index ? 1 : 0.9 }}
                      >
                        {activeProject === index ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isDesign ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                          </svg>
                        )}
                      </motion.div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Hint */}
            <div className="hidden sm:flex mt-6 items-center gap-2 text-sm"
                 style={{ color: "rgb(var(--color-text-tertiary))" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                   style={{ color: "rgb(var(--color-accent))" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>{isDesignProject ? "Scroll inside to explore the design" : "Click inside the phone to interact"}</span>
            </div>
          </motion.div>
        </div>

        {/* Device Display - Morphs between Phone and Desktop */}
        <div className="relative order-2 lg:order-2 flex justify-center">
          {/* Glow Effect */}
          <div className="absolute -inset-6 sm:-inset-10 rounded-[60px] blur-3xl opacity-25 pointer-events-none"
               style={{ background: "rgb(var(--color-accent))" }} />

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={isDesignProject ? "desktop" : "phone"}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {isDesignProject ? <DesktopFrame /> : <PhoneFrame />}
              </motion.div>
            </AnimatePresence>

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

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100]"
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
              paddingLeft: "env(safe-area-inset-left)",
              paddingRight: "env(safe-area-inset-right)",
              background: "#000",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(0, 0, 0, 0.9)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              onClick={() => setIsFullscreen(false)}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 sm:p-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="pointer-events-auto w-full max-w-4xl"
              >
                {isDesignProject ? <DesktopFrame isFullscreenMode /> : <PhoneFrame isFullscreenMode />}
              </motion.div>
            </div>

            {/* Header */}
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 sm:p-6 z-10"
              style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
            >
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-medium opacity-60 uppercase tracking-wider">
                    {currentProject.category}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isDesignProject
                      ? "bg-purple-500/30 text-purple-300"
                      : "bg-green-500/30 text-green-300"
                  }`}>
                    {isDesignProject ? "Design" : "Live"}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{currentProject.title}</h3>
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

            {/* Footer hint */}
            <div
              className="absolute bottom-0 left-0 right-0 pb-4 sm:pb-6 text-center z-10"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
            >
              <p className="text-white/50 text-xs sm:text-sm">
                Tap outside or press × to close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
