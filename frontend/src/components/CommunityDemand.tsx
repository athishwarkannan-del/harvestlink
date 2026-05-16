"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { SectionWrapper, AnimatedCard } from "./ui/AnimatedComponents";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PostDemandModal from "./PostDemandModal";

const demandItems = [
  { name: "Tomatoes", icon: "🍅", demand: 87, requests: 142, trend: "+12%", color: "#e8533a", bg: "#fdeae7" },
  { name: "Leafy Greens", icon: "🥬", demand: 73, requests: 98, trend: "+8%", color: "#4e8c3f", bg: "#e4ede0" },
  { name: "Herbs", icon: "🌿", demand: 65, requests: 76, trend: "+5%", color: "#3a6e2d", bg: "#d1e2c9" },
  { name: "Root Vegetables", icon: "🥕", demand: 58, requests: 64, trend: "+3%", color: "#c4895a", bg: "#f5e6d3" },
];

const communityRequests = [
  { community: "Koramangala Heights", avatar: "🏘️", request: "Requesting 40kg spinach weekly", distance: "1.2 km", urgent: true },
  { community: "HSR Terrace Collective", avatar: "🌇", request: "Need seasonal herbs subscription", distance: "2.8 km", urgent: false },
  { community: "Indiranagar Block 7", avatar: "🏙️", request: "Looking for tomato growers", distance: "3.5 km", urgent: true },
];

export default function CommunityDemand() {
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchDemands = () => {
    setLoading(true);
    apiFetch<{ demands: any[] }>('/demands')
      .then(res => {
        setDemands(res.demands);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load demands:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  // Use API data if available, otherwise fallback to empty state
  // We map the API data to the UI format.
  const displayItems = demands.length > 0 
    ? demands.map((d, i) => ({
        name: d.crop_name,
        icon: "🌱", // Default icon
        demand: Math.min(100, (d.quantity_kg / 100) * 100), // Mock demand percentage based on kg
        requests: d.quantity_kg,
        trend: "Live",
        color: i % 2 === 0 ? "#e8533a" : "#4e8c3f",
        bg: i % 2 === 0 ? "#fdeae7" : "#e4ede0"
      })).slice(0, 4)
    : demandItems;

  return (
    <section id="community" className="section-padding" style={{ background: "#fafdf8" }}>
      <div className="container-wide">
        <SectionWrapper className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-4" style={{ background: "#e4ede0", color: "#3a6e2d", fontWeight: 500 }}>
            <Icon icon="mdi:chart-line" width={16} />
            Live Demand Insights
          </div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#1e2d1f", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
            What Your Community <span className="text-gradient-sage">Needs Today</span>
          </h2>
          <p 
            className="text-center-forced"
            style={{ color: "#4a5e4b", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto", textAlign: "center" }}
          >
            See real-time demand from nearby communities and plan your harvest to match what people actually want.
          </p>
          
          {user?.role === 'consumer' && (
            <button 
              onClick={() => setModalOpen(true)}
              className="mt-6 btn-primary mx-auto"
            >
              <Icon icon="mdi:plus" width={20} />
              Post a Demand
            </button>
          )}
        </SectionWrapper>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#2d5522" }}>Top Demanded Produce</h3>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Icon icon="mdi:loading" className="animate-spin" width={32} color="#3a6e2d" />
              </div>
            ) : displayItems.length > 0 ? (
              displayItems.map((item: any, i: number) => (
                <AnimatedCard key={i} delay={i * 0.1} className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-2xl text-2xl" style={{ width: 52, height: 52, background: item.bg, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e2d1f" }}>{item.name}</span>
                        <span className="flex items-center gap-1 text-xs rounded-full px-2 py-0.5" style={{ background: "#e4ede0", color: "#3a6e2d", fontWeight: 600 }}>
                          <Icon icon="mdi:trending-up" width={12} />{item.trend}
                        </span>
                      </div>
                      <div className="rounded-full overflow-hidden mb-1.5" style={{ height: "8px", background: "#f0f4ee" }}>
                        <div className="h-full rounded-full" style={{ width: `${item.demand}%`, background: `linear-gradient(90deg, ${item.color}99, ${item.color})`, transition: "width 1.2s ease-out" }} />
                      </div>
                      <div className="flex justify-between">
                        <span style={{ fontSize: "0.75rem", color: "#8a9e8b" }}>{item.requests} kg requested</span>
                        <span style={{ fontSize: "0.75rem", color: item.color, fontWeight: 600 }}>{Math.round(item.demand)}% demand</span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))
            ) : (
              <div className="p-5 text-center text-gray-500 bg-[#f4f8f2] rounded-xl">
                No active demands right now.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <AnimatedCard delay={0.15} className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e2d1f" }}>Weekly Subscriptions</h3>
                <span className="text-xs rounded-full px-2 py-0.5" style={{ background: "#e4ede0", color: "#3a6e2d", fontWeight: 500 }}>This Week</span>
              </div>
              <div className="flex items-end gap-2 h-24 mb-3">
                {[65, 82, 58, 91, 74, 88, 96].map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${v}%`, background: i === 6 ? "linear-gradient(180deg, #72a860, #4e8c3f)" : "#c8dbbf" }} />
                ))}
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: "0.72rem", color: "#8a9e8b" }}>Mon</span>
                <span style={{ fontSize: "0.72rem", color: "#8a9e8b" }}>Today</span>
              </div>
              <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: "1px solid #e4ede0" }}>
                <Icon icon="mdi:arrow-up-circle" width={18} color="#4e8c3f" />
                <span style={{ fontSize: "0.82rem", color: "#4a5e4b" }}>
                  <strong style={{ color: "#3a6e2d" }}>247</strong> new subscriptions this week
                </span>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.25} className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e2d1f" }}>Nearby Requests</h3>
                <Icon icon="mdi:map-marker-radius" width={18} color="#3a6e2d" />
              </div>
              <div className="flex flex-col gap-3">
                {demands.length > 0 ? demands.slice(0, 3).map((req: any, i: number) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: "#f4f8f2" }}>
                    <span className="text-xl">🧑‍🌾</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span style={{ fontWeight: 600, fontSize: "0.78rem", color: "#1e2d1f", lineHeight: 1.3 }}>
                          {req.profile?.full_name || "Community Member"}
                        </span>
                        {req.status === 'open' && <span className="shrink-0 text-xs rounded-full px-1.5 py-0.5" style={{ background: "#e4ede0", color: "#3a6e2d", fontWeight: 600, fontSize: "0.65rem" }}>Open</span>}
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#4a5e4b", marginTop: "2px" }}>
                        Needs {req.quantity_kg}kg of {req.crop_name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Icon icon="mdi:map-marker" width={10} color="#8a9e8b" />
                        <span style={{ fontSize: "0.68rem", color: "#8a9e8b" }}>{req.location || "Nearby"}</span>
                      </div>
                    </div>
                  </div>
                )) : communityRequests.map((req) => (
                  <div key={req.community} className="flex gap-3 p-3 rounded-xl" style={{ background: "#f4f8f2" }}>
                    <span className="text-xl">{req.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <span style={{ fontWeight: 600, fontSize: "0.78rem", color: "#1e2d1f", lineHeight: 1.3 }}>{req.community}</span>
                        {req.urgent && <span className="shrink-0 text-xs rounded-full px-1.5 py-0.5" style={{ background: "#fdeae7", color: "#e8533a", fontWeight: 600, fontSize: "0.65rem" }}>Urgent</span>}
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#4a5e4b", marginTop: "2px" }}>{req.request}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Icon icon="mdi:map-marker" width={10} color="#8a9e8b" />
                        <span style={{ fontSize: "0.68rem", color: "#8a9e8b" }}>{req.distance} away</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
      <PostDemandModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchDemands} 
      />
    </section>
  );
}
