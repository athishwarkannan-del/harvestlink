"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    // Phase 1: Show logo (0.8s)
    const t1 = setTimeout(() => setPhase("text"), 800);
    // Phase 2: Show text (1.4s more)
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    // Phase 3: Exit + trigger homepage
    const t3 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const letters = "HarvestLink".split("");

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f4f8f2 0%, #fdf8ef 50%, #f4f8f2 100%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute rounded-full opacity-20"
            style={{
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, #72a860, transparent)",
              top: "10%",
              left: "5%",
              animation: "float-slow 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full opacity-15"
            style={{
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle, #c4895a, transparent)",
              bottom: "15%",
              right: "8%",
              animation: "float-medium 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute rounded-full opacity-10"
            style={{
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, #f9c23a, transparent)",
              top: "60%",
              left: "15%",
              animation: "float-fast 5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Logo + Name centered */}
        <motion.div
          className="flex flex-col items-center gap-4"
          layoutId="navbar-logo-group"
        >
          {/* Leaf Logo Mark */}
          <motion.div
            layoutId="navbar-logo-icon"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          >
            <LogoMark size={72} />
          </motion.div>

          {/* HarvestLink text - character by character */}
          <motion.div
            className="flex overflow-hidden"
            aria-label="HarvestLink"
          >
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={
                  phase === "logo"
                    ? { opacity: 0, y: 20, filter: "blur(4px)" }
                    : phase === "text"
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: -10, filter: "blur(4px)" }
                }
                transition={{
                  duration: 0.4,
                  delay: phase === "text" ? i * 0.06 : 0,
                  ease: "easeOut",
                }}
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  fontWeight: 700,
                  color: letter === letter.toUpperCase() && letter !== " "
                    ? "#3a6e2d"
                    : "#4e8c3f",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "text" ? 0.6 : 0,
            }}
            transition={{ duration: 0.5, delay: phase === "text" ? 0.8 : 0 }}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "0.95rem",
              color: "#4a5e4b",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 400,
            }}
          >
            Grow What People Need
          </motion.p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="absolute bottom-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "text" ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div
            className="rounded-full overflow-hidden"
            style={{ width: "120px", height: "3px", background: "#e4ede0" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #4e8c3f, #72a860)" }}
              initial={{ width: "0%" }}
              animate={{ width: phase === "text" ? "100%" : "0%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="24" fill="#e4ede0" />
      {/* Leaf shape */}
      <path
        d="M24 8C16 8 10 16 12 26C14 34 22 40 24 40C26 40 34 34 36 26C38 16 32 8 24 8Z"
        fill="url(#leafGrad)"
      />
      {/* Center vein */}
      <path
        d="M24 12 L24 38"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Side veins */}
      <path
        d="M24 20 L18 16M24 26 L17 24M24 32 L19 30"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M24 20 L30 16M24 26 L31 24M24 32 L29 30"
        stroke="#ffffff"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="leafGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#72a860" />
          <stop offset="100%" stopColor="#3a6e2d" />
        </linearGradient>
      </defs>
    </svg>
  );
}
