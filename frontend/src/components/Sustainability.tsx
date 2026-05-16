"use client";

import { Icon } from "@iconify/react";
import { SectionWrapper, AnimatedCard, StatCounter } from "./ui/AnimatedComponents";

const stats = [
  {
    value: 1200,
    suffix: " km",
    label: "Food Miles Reduced",
    description: "Average distance saved per delivery compared to supermarket chains.",
    icon: "mdi:truck-check-outline",
    color: "#a06840"
  },
  {
    value: 87,
    suffix: "%",
    label: "Local Sourcing",
    description: "Of all produce is grown within 50km of the delivery location.",
    icon: "mdi:map-marker-distance",
    color: "#4e8c3f"
  },
  {
    value: 2.4,
    suffix: " tons",
    label: "Waste Prevented",
    description: "Demand-first farming means we only grow what people will eat.",
    icon: "mdi:recycle",
    color: "#72a860"
  }
];

export default function Sustainability() {
  return (
    <section id="sustainability" className="section-padding bg-sage-50 relative overflow-hidden">
      {/* Decorative SVG background elements */}
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3">
        <Icon icon="mdi:leaf" width={400} color="#4e8c3f" />
      </div>
      <div className="absolute bottom-0 left-0 opacity-5 pointer-events-none transform -translate-x-1/3 translate-y-1/3">
        <Icon icon="mdi:sprout" width={300} color="#72a860" />
      </div>

      <div className="container-wide relative z-10">
        <SectionWrapper className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-4" style={{ background: "#e4ede0", color: "#3a6e2d", fontWeight: 500 }}>
            <Icon icon="mdi:earth" width={16} />
            Environmental Impact
          </div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#1e2d1f", letterSpacing: "-0.02em" }}>
            Better for You, <br className="sm:hidden"/>
            <span className="text-gradient-sage">Better for the Planet</span>
          </h2>
          <p 
            className="mt-3 text-text-secondary max-w-2xl mx-auto text-center-forced"
            style={{ textAlign: "center" }}
          >
            We're building a food system that respects the earth. Our model reduces waste and carbon footprint by growing only what is needed.
          </p>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <AnimatedCard key={stat.label} delay={i * 0.15} className="p-8 text-center flex flex-col items-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${stat.color}15`, color: stat.color }}
              >
                <Icon icon={stat.icon} width={32} />
              </div>
              
              <div className="text-4xl font-bold text-text-primary mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                <StatCounter target={stat.value} suffix={stat.suffix} />
              </div>
              
              <h3 className="text-lg font-semibold text-text-primary mb-3">{stat.label}</h3>
              <p className="text-sm text-text-secondary">{stat.description}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
