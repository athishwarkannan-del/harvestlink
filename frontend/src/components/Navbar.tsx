"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { LogoMark } from "./SplashScreen";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Community", href: "#community" },
  { label: "Farmers", href: "#network" },
  { label: "Growers", href: "#network" },
  { label: "Analytics", href: "#sustainability" },
  { label: "About", href: "#about" },
];

export default function Navbar({ visible }: { visible: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <AnimatePresence>
      {visible && (
        <motion.header
          key="navbar"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 28, delay: 0.1 }}
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            background: scrolled
              ? "rgba(254, 253, 249, 0.92)"
              : "rgba(254, 253, 249, 0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: scrolled ? "0 2px 20px rgba(30,45,31,0.08)" : "none",
            transition: "background 0.3s ease, box-shadow 0.3s ease",
            borderBottom: scrolled ? "1px solid #e4ede0" : "1px solid transparent",
          }}
        >
          <div className="container-wide flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              layoutId="navbar-logo-group"
              href="#home"
              className="flex items-center gap-2 no-underline"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div layoutId="navbar-logo-icon">
                <LogoMark size={36} />
              </motion.div>
              <span
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#3a6e2d",
                  letterSpacing: "-0.02em",
                }}
              >
                HarvestLink
              </span>
            </motion.a>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink key={link.label} {...link} />
              ))}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  {user.role === 'farmer' && (
                    <a href="/dashboard" className="text-sm font-medium text-[#4a5e4b] hover:text-[#3a6e2d] transition-colors mr-2">
                      Dashboard
                    </a>
                  )}
                  <span className="text-sm font-medium text-[#3a6e2d] bg-[#e4ede0] px-3 py-1 rounded-full">
                    Hi, {user.full_name}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-[#4a5e4b] hover:text-[#3a6e2d] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden md:flex btn-primary text-sm py-2 px-5"
                  id="navbar-join-btn"
                >
                  <Icon icon="mdi:login" width={16} />
                  Sign In
                </button>
              )}

              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ background: "#e4ede0", color: "#3a6e2d" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                id="mobile-menu-toggle"
              >
                <Icon icon={mobileOpen ? "mdi:close" : "mdi:menu"} width={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="md:hidden overflow-hidden"
                style={{
                  background: "rgba(254, 253, 249, 0.97)",
                  borderTop: "1px solid #e4ede0",
                }}
              >
                <div className="container-wide py-4 flex flex-col gap-2">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setMobileOpen(false)}
                      className="py-3 px-4 rounded-xl font-medium text-sm"
                      style={{
                        color: "#2d5522",
                        textDecoration: "none",
                        background: "transparent",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#e4ede0")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {link.label}
                    </motion.a>
                  ))}
                  
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="btn-primary mt-2 justify-center"
                      style={{ fontSize: "0.875rem", background: "#fdeae7", color: "#e8533a" }}
                    >
                      <Icon icon="mdi:logout" width={16} />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setAuthModalOpen(true);
                        setMobileOpen(false);
                      }}
                      className="btn-primary mt-2 justify-center"
                      style={{ fontSize: "0.875rem" }}
                    >
                      <Icon icon="mdi:login" width={16} />
                      Sign In
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
    
    <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      style={{ textDecoration: "none", position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id={`nav-${label.toLowerCase()}`}
    >
      <span
        style={{
          display: "block",
          padding: "0.4rem 0.9rem",
          borderRadius: "0.75rem",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
          fontSize: "0.875rem",
          color: hovered ? "#3a6e2d" : "#4a5e4b",
          background: hovered ? "#e4ede0" : "transparent",
          transition: "all 0.2s ease",
        }}
      >
        {label}
      </span>
    </a>
  );
}
