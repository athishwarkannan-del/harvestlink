"use client";

import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CommunityDemand from "@/components/CommunityDemand";
import FarmingNetwork from "@/components/FarmingNetwork";
import HarvestJourney from "@/components/HarvestJourney";
import Sustainability from "@/components/Sustainability";
import CommunitySubscription from "@/components/CommunitySubscription";
import AssistantCharacter from "@/components/AssistantCharacter";
import Footer from "@/components/Footer";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  // Fallback to hide splash screen in case of errors
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <>
          <Navbar visible={!showSplash} />
          <main className="flex min-h-screen flex-col">
            <HeroSection />
            <CommunityDemand />
            <FarmingNetwork />
            <HarvestJourney />
            <Sustainability />
            <CommunitySubscription />
          </main>
          <Footer />
          <AssistantCharacter />
        </>
      )}
    </>
  );
}
