"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Project {
  title: string;
  category: string;
  year: string;
  tags: string[];
  image: string;
}

interface Props {
  projects: Project[];
}

export default function HorizontalProjects({ projects }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      // Initial check
      setTimeout(checkScroll, 100);
    }
    return () => ref?.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    // Get card width dynamically
    const firstCard = scrollRef.current.querySelector("article");
    const cardWidth = firstCard?.offsetWidth || 320;
    const gap = 24; // gap-6
    const scrollAmount = cardWidth + gap;

    const newScrollLeft =
      direction === "left"
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group">
      {/* Navigation Arrows - Show on hover (desktop) */}
      <motion.button
        onClick={() => scroll("left")}
        className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 sm:w-12 sm:h-12
                   rounded-full flex items-center justify-center
                   bg-elevated border border-theme shadow-elegant
                   text-primary
                   transition-all duration-300
                   ${canScrollLeft ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Scroll left"
        disabled={!canScrollLeft}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      <motion.button
        onClick={() => scroll("right")}
        className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10
                   w-10 h-10 sm:w-12 sm:h-12
                   rounded-full flex items-center justify-center
                   bg-elevated border border-theme shadow-elegant
                   text-primary
                   transition-all duration-300
                   ${canScrollRight ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Scroll right"
        disabled={!canScrollRight}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      {/* Projects Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar
                   px-4 sm:px-6 lg:px-8 py-4
                   snap-x snap-mandatory scroll-smooth"
      >
        {projects.map((project, index) => (
          <motion.article
            key={index}
            className="flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[45vw] lg:w-[380px]
                       snap-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="card card-hover overflow-hidden h-full">
              {/* Image */}
              <div className="aspect-[4/3] bg-tertiary overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500
                             hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm font-medium text-accent">
                    {project.category}
                  </span>
                  <span className="text-xs sm:text-sm text-tertiary">
                    {project.year}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-primary mb-3">
                  {project.title}
                </h3>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 sm:px-3 py-1 text-xs font-medium rounded-full
                                 bg-tertiary text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Scroll indicator for mobile */}
      <div className="flex justify-center gap-2 mt-4 lg:hidden">
        {projects.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-tertiary"
          />
        ))}
      </div>
    </div>
  );
}
