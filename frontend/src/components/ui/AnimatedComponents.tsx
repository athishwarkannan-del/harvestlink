"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useAnimation } from "motion/react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export function SectionWrapper({ children, className = "", delay = 0, id }: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          controls.start("visible");
          setHasAnimated(true);
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [controls, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: "easeOut", delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

export function AnimatedCard({ children, className = "", delay = 0, style }: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          controls.start("visible");
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [controls, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      className={`card-base ${className}`}
      style={style}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: "easeOut", delay },
        },
      }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px 0 rgba(78,140,63,0.18)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

interface StatCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function StatCounter({ target, suffix = "", prefix = "", duration = 2 }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = 0;
    const end = target;
    const totalSteps = 60;
    const stepValue = end / totalSteps;
    let current = start;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(stepValue * step), end);
      setCount(current);
      if (step >= totalSteps) clearInterval(timer);
    }, (duration * 1000) / totalSteps);

    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
