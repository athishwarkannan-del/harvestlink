"use client";

import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { SectionWrapper } from "./ui/AnimatedComponents";

const journeySteps = [
  {
    icon: "mdi:seed",
    title: "Growing",
    description: "Planted based on community demand using sustainable practices.",
    color: "#a06840",
    bg: "#fdf8ef"
  },
  {
    icon: "mdi:basket",
    title: "Harvesting",
    description: "Picked at peak freshness, never stored in cold storage.",
    color: "#72a860",
    bg: "#e4ede0"
  },
  {
    icon: "mdi:truck-fast",
    title: "Transporting",
    description: "Zero-emission direct delivery to your neighborhood hub.",
    color: "#3a6e2d",
    bg: "#d1e2c9"
  },
  {
    icon: "mdi:home-heart",
    title: "Ready for Pickup",
    description: "Fresh and waiting for you within hours of harvest.",
    color: "#4e8c3f",
    bg: "#f4f8f2"
  }
];

export default function HarvestJourney() {
  return (
    <section className="section-padding bg-warm-50 relative">
      <div className="container-wide">
        <SectionWrapper className="text-center mb-16">
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#1e2d1f", letterSpacing: "-0.02em" }}>
            The Harvest <span className="text-gradient-sage">Journey</span>
          </h2>
          <div style={{ display: "flex", justifyContent: "center", width: "100%", textAlign: "center" }}>
            <p 
              className="mt-3 text-text-secondary max-w-2xl leading-relaxed"
              style={{ textAlign: "center", margin: "0 auto", display: "block", width: "100%" }}
            >
              From seed to your plate in under 24 hours. We have eliminated the middlemen, cold storage, and unnecessary food miles.
            </p>
          </div>
        </SectionWrapper>

        <div className="relative max-w-5xl mx-auto">
          
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-sage-200 z-0">
            <motion.div 
              className="h-full bg-sage-500 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          {/* Connecting Line (Mobile) */}
          <div className="md:hidden absolute top-[10%] bottom-[10%] left-[39px] w-[2px] bg-sage-200 z-0">
            <motion.div 
              className="w-full bg-sage-500 origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {journeySteps.map((step, index) => (
              <SectionWrapper 
                key={step.title} 
                delay={index * 0.2}
                className="flex md:flex-col items-center md:text-center gap-6 md:gap-4"
              >
                <motion.div 
                  className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center border-[4px] border-warm-50 relative shadow-sm"
                  style={{ background: step.bg, color: step.color }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon icon={step.icon} width={36} />
                  
                  {/* Subtle pulse effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-[pulse-soft_2s_infinite]" />
                </motion.div>
                
                <div>
                  <h3 className="font-semibold text-lg text-text-primary mb-1">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed px-2">{step.description}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
