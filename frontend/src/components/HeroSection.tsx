"use client";

import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ paddingTop: "5rem" }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main warm gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #e4ede0 0%, #fafdf8 60%, #fdf8ef 100%)",
          }}
        />
        {/* Floating organic blobs */}
        <div
          className="absolute rounded-full opacity-25"
          style={{
            width: "520px",
            height: "520px",
            background: "radial-gradient(circle, #a0c492 0%, transparent 70%)",
            top: "-80px",
            right: "-100px",
            animation: "float-slow 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full opacity-15"
          style={{
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle, #e8ccaa 0%, transparent 70%)",
            bottom: "5%",
            left: "-80px",
            animation: "float-medium 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full opacity-20"
          style={{
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, #f9c23a 0%, transparent 70%)",
            top: "60%",
            right: "20%",
            animation: "float-fast 7s ease-in-out infinite",
          }}
        />
        {/* Subtle grid dots */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#4e8c3f" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container-wide relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left: Text Content */}
        <div className="flex flex-col gap-7">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 self-start rounded-full px-4 py-1.5 text-sm font-500"
            style={{
              background: "#e4ede0",
              color: "#3a6e2d",
              border: "1px solid #c8dbbf",
              fontWeight: 500,
            }}
          >
            <Icon icon="mdi:leaf-circle" width={16} />
            Smart Agriculture Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#1e2d1f",
              letterSpacing: "-0.02em",
            }}
          >
            Grow What{" "}
            <span className="text-gradient-sage">People</span>
            <br />
            Need.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            style={{
              fontSize: "1.1rem",
              color: "#4a5e4b",
              lineHeight: 1.75,
              maxWidth: "480px",
              fontWeight: 400,
            }}
          >
            Connecting communities, farmers, and urban growers through
            demand-first farming. Build a smarter, kinder local food ecosystem.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="flex flex-wrap gap-4"
          >
            <motion.a
              href="#community"
              className="btn-primary"
              id="hero-explore-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon icon="mdi:compass-outline" width={18} />
              Explore Platform
            </motion.a>
            <motion.a
              href="#network"
              className="btn-secondary"
              id="hero-join-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon icon="mdi:account-group-outline" width={18} />
              Join Community
            </motion.a>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex gap-8 pt-2"
          >
            {[
              { value: "2,400+", label: "Active Farmers" },
              { value: "180+", label: "Communities" },
              { value: "92%", label: "Local Sourced" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    color: "#3a6e2d",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{ fontSize: "0.78rem", color: "#8a9e8b", fontWeight: 500 }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative flex justify-center items-center"
          style={{ animation: "float-slow 8s ease-in-out infinite" }}
        >
          {/* Illustration blob background */}
          <div
            className="absolute rounded-full"
            style={{
              width: "95%",
              height: "95%",
              background: "radial-gradient(circle, #e4ede0 0%, transparent 70%)",
              zIndex: 0,
            }}
          />
          <Image
            src="/hero-farm.png"
            alt="Farming ecosystem illustration showing farms, urban gardens and connected community"
            width={580}
            height={480}
            className="relative z-10 w-full max-w-lg object-contain drop-shadow-lg"
            priority
          />

          {/* Floating info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="absolute top-6 right-0 flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 4px 20px rgba(30,45,31,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid #e4ede0",
              animation: "float-fast 5s ease-in-out infinite",
            }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 36, height: 36, background: "#e4ede0" }}
            >
              <Icon icon="mdi:sprout" width={20} color="#3a6e2d" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e2d1f" }}>
                148 harvests
              </div>
              <div style={{ fontSize: "0.72rem", color: "#8a9e8b" }}>Ready this week</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="absolute bottom-8 left-0 flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 4px 20px rgba(30,45,31,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid #e4ede0",
              animation: "float-medium 7s ease-in-out infinite",
            }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 36, height: 36, background: "#fef3d0" }}
            >
              <Icon icon="mdi:account-group" width={20} color="#a06840" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e2d1f" }}>
                24 new requests
              </div>
              <div style={{ fontSize: "0.72rem", color: "#8a9e8b" }}>From your area</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span style={{ fontSize: "0.72rem", color: "#8a9e8b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <Icon icon="mdi:chevron-down" width={20} color="#8a9e8b" />
        </motion.div>
      </motion.div>
    </section>
  );
}
