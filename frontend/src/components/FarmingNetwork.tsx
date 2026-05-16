"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { SectionWrapper } from "./ui/AnimatedComponents";
import { apiFetch } from "@/lib/api";

const nodes = [
  { id: 1, type: "farm", label: "Green Acres Farm", x: 15, y: 30, details: "12 acres, 100% organic" },
  { id: 2, type: "terrace", label: "Skyline Terrace", x: 45, y: 15, details: "Hydroponic leafy greens" },
  { id: 3, type: "hub", label: "Central Pickup Hub", x: 50, y: 50, details: "Daily fresh arrivals" },
  { id: 4, type: "grower", label: "Urban Sprout Co.", x: 25, y: 70, details: "Microgreens & mushrooms" },
  { id: 5, type: "farm", label: "Sunrise Orchards", x: 80, y: 25, details: "Seasonal fruits" },
  { id: 6, type: "terrace", label: "Balcony Harvest", x: 75, y: 65, details: "Community herb garden" },
];

const connections = [
  { source: 1, target: 3 },
  { source: 2, target: 3 },
  { source: 4, target: 3 },
  { source: 5, target: 3 },
  { source: 6, target: 3 },
  { source: 2, target: 1 },
  { source: 6, target: 5 },
];

export default function FarmingNetwork() {
  const [activeNode, setActiveNode] = useState<number | string | null>(null);
  const [farmers, setFarmers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch recent harvests to extract active farmers
    apiFetch<{ harvests: any[] }>('/harvests')
      .then(res => {
        // Extract unique farmers from harvests
        const uniqueFarmers = new Map();
        res.harvests.forEach(h => {
          if (!uniqueFarmers.has(h.farmer_id)) {
            uniqueFarmers.set(h.farmer_id, {
              id: h.farmer_id,
              type: "farm",
              label: h.farmer?.full_name || "Local Farm",
              details: `Growing: ${h.crop_name}`,
              x: 10 + Math.random() * 80, // Random position for MVP
              y: 10 + Math.random() * 80
            });
          } else {
            // Append crops to details
            const f = uniqueFarmers.get(h.farmer_id);
            if (!f.details.includes(h.crop_name)) {
              f.details += `, ${h.crop_name}`;
            }
          }
        });
        setFarmers(Array.from(uniqueFarmers.values()));
      })
      .catch(console.error);
  }, []);

  const displayNodes = farmers.length > 0 ? farmers : nodes;

  return (
    <section id="network" className="section-padding bg-white relative overflow-hidden">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <SectionWrapper className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm self-start" style={{ background: "#f5e6d3", color: "#a06840", fontWeight: 500 }}>
              <Icon icon="mdi:sprout-outline" width={16} />
              Hyperlocal Sourcing
            </div>
            
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#1e2d1f", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              The Farming Network <br/>
              <span className="text-gradient-earth">In Your City</span>
            </h2>
            
            <p style={{ color: "#4a5e4b", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Discover local growers right in your neighborhood. From sprawling peri-urban farms to community terrace gardens, we connect the dots to bring fresh produce closer to you.
            </p>
            
            <ul className="flex flex-col gap-4 mt-2">
              {[
                { icon: "mdi:tractor", text: "Traditional Farms within 50km radius" },
                { icon: "mdi:home-city", text: "Urban rooftop & terrace collectives" },
                { icon: "mdi:truck-delivery", text: "Zero-emission community pickup hubs" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: "#fdf8ef", color: "#a06840" }}>
                    <Icon icon={item.icon} width={18} />
                  </div>
                  <span style={{ color: "#2d5522", fontWeight: 500, fontSize: "0.95rem" }}>{item.text}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-4">
              <button className="btn-secondary" style={{ borderColor: "#a06840", color: "#a06840" }}>
                <Icon icon="mdi:map-search-outline" width={18} />
                Explore Local Map
              </button>
            </div>
          </SectionWrapper>

          {/* Right Interactive Map */}
          <SectionWrapper delay={0.2} className="relative h-[450px] w-full rounded-3xl" style={{ background: "#fafdf8", border: "1px solid #e4ede0" }}>
            
            {/* Animated SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {farmers.length === 0 && connections.map((conn, i) => {
                const source = nodes.find(n => n.id === conn.source);
                const target = nodes.find(n => n.id === conn.target);
                if (!source || !target) return null;
                
                return (
                  <motion.path
                    key={`conn-${i}`}
                    d={`M ${source.x}% ${source.y}% L ${target.x}% ${target.y}%`}
                    stroke="#c8dbbf"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {displayNodes.map((node) => (
              <div
                key={node.id}
                className="absolute"
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)", zIndex: activeNode === node.id ? 20 : 10 }}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
              >
                <motion.div
                  className="relative cursor-pointer flex flex-col items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    className="rounded-full shadow-md flex items-center justify-center transition-colors"
                    style={{ 
                      width: node.type === "hub" ? 48 : 36, 
                      height: node.type === "hub" ? 48 : 36,
                      background: node.type === "hub" ? "#a06840" : node.type === "farm" ? "#4e8c3f" : "#72a860",
                      color: "white",
                      border: "3px solid white"
                    }}
                  >
                    <Icon 
                      icon={node.type === "hub" ? "mdi:home-group" : node.type === "farm" ? "mdi:tractor" : "mdi:sprout"} 
                      width={node.type === "hub" ? 24 : 18} 
                    />
                  </div>
                  
                  {/* Tooltip */}
                  <AnimatePresence>
                    {activeNode === node.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full mb-3 w-48 bg-white rounded-xl shadow-lg p-3 pointer-events-none"
                        style={{ border: "1px solid #e4ede0" }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e2d1f" }}>{node.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "#8a9e8b", marginTop: "2px" }}>{node.details}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-sage-100 text-xs text-text-secondary font-medium">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4e8c3f]"/> Farms</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#72a860]"/> Urban Growers</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#a06840]"/> Pickup Hubs</div>
            </div>
            
          </SectionWrapper>
        </div>
      </div>
    </section>
  );
}
