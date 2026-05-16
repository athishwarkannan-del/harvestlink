"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { SectionWrapper, AnimatedCard } from "./ui/AnimatedComponents";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const plans = [
  {
    name: "Basic Fresh",
    price: "$24",
    frequency: "/week",
    description: "Perfect for individuals. Essential seasonal veggies.",
    features: [
      "3-4 types of seasonal vegetables",
      "1 type of leafy green",
      "Pickup at local hub",
      "Access to community recipes"
    ],
    buttonText: "Start Basic Plan",
    popular: false,
    color: "#72a860"
  },
  {
    name: "Family Harvest",
    price: "$45",
    frequency: "/week",
    description: "Ideal for families of 3-4. Complete weekly nutrition.",
    features: [
      "6-8 types of seasonal vegetables",
      "3 types of leafy greens & herbs",
      "Free doorstep delivery",
      "Priority seasonal selections",
      "Farm visit invites"
    ],
    buttonText: "Join Family Plan",
    popular: true,
    color: "#4e8c3f"
  },
  {
    name: "Community Share",
    price: "$110",
    frequency: "/week",
    description: "For apartment blocks & communities pooling together.",
    features: [
      "Bulk assorted seasonal produce",
      "Customizable box contents",
      "Dedicated community delivery slot",
      "Direct farmer connect sessions",
      "10% discount on add-ons"
    ],
    buttonText: "Start Community Share",
    popular: false,
    color: "#a06840"
  }
];

export default function CommunitySubscription() {
  const { user, token } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      alert("Please sign in to subscribe to a plan.");
      return;
    }
    if (user.role !== 'consumer') {
      alert("Only consumers can subscribe to plans.");
      return;
    }

    setLoadingPlan(plan.name);
    try {
      // Find an active farmer to subscribe to
      const harvestsRes = await apiFetch<{ harvests: any[] }>('/harvests');
      if (harvestsRes.harvests.length === 0) {
        throw new Error("No active farmers available for subscriptions right now.");
      }
      
      const farmerId = harvestsRes.harvests[0].farmer_id;
      const quantityMap: Record<string, number> = {
        "Basic Fresh": 5,
        "Family Harvest": 12,
        "Community Share": 50
      };

      await apiFetch('/subscriptions', {
        method: 'POST',
        token,
        body: JSON.stringify({
          farmer_id: farmerId,
          crop_name: "Mixed Seasonal Produce",
          quantity_kg: quantityMap[plan.name] || 5,
          frequency: "weekly"
        })
      });

      alert(`Successfully subscribed to the ${plan.name} plan!`);
    } catch (err: any) {
      alert(err.message || "Failed to process subscription.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="section-padding bg-warm-50">
      <div className="container-wide">
        <SectionWrapper className="text-center mb-16">
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#1e2d1f", letterSpacing: "-0.02em" }}>
            Fresh Food, <span className="text-gradient-sage">On Your Schedule</span>
          </h2>
          <div className="flex justify-center w-full">
            <p 
              className="mt-3 text-text-secondary max-w-2xl leading-relaxed"
              style={{ textAlign: "center", display: "block" }}
            >
              Subscribe to local harvests. Support farmers with predictable demand while enjoying the freshest produce in the city.
            </p>
          </div>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <AnimatedCard 
              key={plan.name}
              delay={index * 0.15}
              className={`p-8 flex flex-col h-full relative ${plan.popular ? 'border-2 border-sage-400 shadow-xl z-10 md:scale-105' : ''}`}
              style={{ background: plan.popular ? '#ffffff' : '#fafdf8' }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-sage-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className={`text-center mb-8 ${plan.popular ? 'mt-6' : ''}`}>
                <h3 className="text-2xl font-bold text-text-primary mb-3">{plan.name}</h3>
                <p className="text-sm text-text-secondary mb-6 max-w-[240px] mx-auto min-h-[40px]">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-text-primary">{plan.price}</span>
                  <span className="text-lg text-text-secondary">{plan.frequency}</span>
                </div>
              </div>

              <div className="w-full h-px bg-sage-200 mb-8 opacity-40"></div>

              <ul className="space-y-4 mb-10 w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center justify-center gap-2.5 text-sm text-text-secondary">
                    <Icon icon="mdi:check-circle" className="text-sage-500 shrink-0" width={18} />
                    <span className="text-center">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={loadingPlan === plan.name}
                className={`w-full py-3 mt-auto rounded-xl font-semibold transition-all flex justify-center items-center gap-2 ${
                  plan.popular 
                    ? 'bg-sage-500 hover:bg-sage-600 text-white shadow-lg shadow-sage-500/30' 
                    : 'bg-sage-100 hover:bg-sage-200 text-sage-700'
                }`}
              >
                {loadingPlan === plan.name ? "Processing..." : plan.buttonText}
                <Icon icon="mdi:arrow-right" width={18} />
              </button>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
