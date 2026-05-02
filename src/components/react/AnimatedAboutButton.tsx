export default function AnimatedAboutButton() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
      <div className="flex justify-center">
        <div className="relative" style={{ width: "200px", height: "120px" }}>
          {/* Static teal glow under the pair */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: 240,
              height: 240,
              bottom: -70,
              background:
                "radial-gradient(ellipse, rgba(45,212,191,0.42) 0%, rgba(20,184,166,0.18) 35%, transparent 70%)",
              filter: "blur(22px)",
            }}
          />

          {/* "More About Us" button */}
          <a
            href="/about"
            className="absolute left-1/2 -translate-x-1/2 pointer-events-auto z-10
                       hover:scale-105 active:scale-95 transition-transform duration-200"
            style={{ bottom: 75 }}
          >
            <div
              className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap"
              style={{
                background: "rgb(var(--color-accent))",
                color: "#fff",
                boxShadow: "0 4px 16px -4px rgba(20,184,166,0.5)",
              }}
            >
              More About Us
            </div>
          </a>

          {/* Male character (left) */}
          <div className="absolute bottom-0 left-0">
            <svg viewBox="0 0 60 90" style={{ width: 70, height: 80 }}>
              <ellipse cx="30" cy="5" rx="11" ry="5" fill="#1E3A5F" />
              <rect x="19" y="3" width="22" height="8" rx="2" fill="#1E3A5F" />
              <circle cx="30" cy="1" r="3" fill="#fff" />

              <circle cx="30" cy="14" r="8" fill="#FDBF9C" />
              <circle cx="26" cy="13" r="1.5" fill="#333" />
              <circle cx="34" cy="13" r="1.5" fill="#333" />
              <path d="M26 17 Q30 20 34 17" stroke="#333" strokeWidth="1.5" fill="none" />

              <rect x="22" y="21" width="16" height="5" rx="2" fill="#C41E3A" />
              <rect x="35" y="23" width="4" height="12" rx="1" fill="#C41E3A" />

              <rect x="18" y="25" width="24" height="26" rx="3" fill="#1E3A5F" />
              <line x1="30" y1="26" x2="30" y2="50" stroke="#FFD700" strokeWidth="1" />

              {/* Right arm reaches up toward button */}
              <line x1="42" y1="27" x2="52" y2="2" stroke="#1E3A5F" strokeWidth="7" strokeLinecap="round" />
              <circle cx="54" cy="0" r="5" fill="#C41E3A" />

              {/* Left arm raised */}
              <line x1="18" y1="27" x2="2" y2="12" stroke="#1E3A5F" strokeWidth="7" strokeLinecap="round" />
              <circle cx="0" cy="10" r="5" fill="#C41E3A" />

              <rect x="21" y="50" width="8" height="22" rx="2" fill="#2C3E50" />
              <rect x="20" y="70" width="10" height="14" rx="2" fill="#5D4037" />
              <rect x="31" y="50" width="8" height="22" rx="2" fill="#2C3E50" />
              <rect x="30" y="70" width="10" height="14" rx="2" fill="#5D4037" />
            </svg>
          </div>

          {/* Female character (right) */}
          <div className="absolute bottom-0 right-0">
            <svg viewBox="0 0 60 90" style={{ width: 70, height: 80 }}>
              <ellipse cx="30" cy="5" rx="12" ry="5" fill="#E91E63" />
              <rect x="18" y="3" width="24" height="10" rx="2" fill="#E91E63" />
              <rect x="18" y="10" width="6" height="8" rx="2" fill="#E91E63" />
              <rect x="36" y="10" width="6" height="8" rx="2" fill="#E91E63" />
              <ellipse cx="30" cy="1" rx="4" ry="2" fill="#fff" />

              <circle cx="30" cy="14" r="7" fill="#DEB887" />
              <circle cx="27" cy="13" r="1.5" fill="#333" />
              <circle cx="33" cy="13" r="1.5" fill="#333" />
              <path d="M27 17 Q30 19 33 17" stroke="#333" strokeWidth="1.5" fill="none" />

              <rect x="21" y="20" width="18" height="5" rx="2" fill="#fff" />
              <rect x="18" y="22" width="5" height="14" rx="1" fill="#fff" />

              <path d="M18 24 L12 52 L48 52 L42 24 Z" fill="#E91E63" />
              <circle cx="30" cy="30" r="2" fill="#fff" />
              <circle cx="30" cy="38" r="2" fill="#fff" />
              <circle cx="30" cy="46" r="2" fill="#fff" />

              {/* Left arm reaches up toward button */}
              <line x1="18" y1="26" x2="8" y2="2" stroke="#E91E63" strokeWidth="7" strokeLinecap="round" />
              <circle cx="6" cy="0" r="5" fill="#fff" />

              {/* Right arm raised */}
              <line x1="42" y1="26" x2="58" y2="12" stroke="#E91E63" strokeWidth="7" strokeLinecap="round" />
              <circle cx="60" cy="10" r="5" fill="#fff" />

              <rect x="23" y="52" width="7" height="20" rx="2" fill="#2C3E50" />
              <rect x="22" y="70" width="9" height="14" rx="2" fill="#5D4037" />
              <rect x="30" y="52" width="7" height="20" rx="2" fill="#2C3E50" />
              <rect x="29" y="70" width="9" height="14" rx="2" fill="#5D4037" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
