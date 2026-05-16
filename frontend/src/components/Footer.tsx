"use client";

import { Icon } from "@iconify/react";
import { LogoMark } from "./SplashScreen";

export default function Footer() {
  return (
    <footer className="bg-sage-600 text-sage-50 pt-16 pb-8">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <LogoMark size={24} className="opacity-90" />
              <span className="font-poppins font-bold text-lg tracking-tight">HarvestLink</span>
            </div>
            <p className="text-sage-200 text-sm leading-relaxed mb-6">
              Connecting communities, farmers, and urban growers through demand-first farming.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center hover:bg-sage-400 transition-colors">
                <Icon icon="mdi:twitter" width={18} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center hover:bg-sage-400 transition-colors">
                <Icon icon="mdi:instagram" width={18} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center hover:bg-sage-400 transition-colors">
                <Icon icon="mdi:linkedin" width={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-2 text-sm text-sage-200">
              <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Hubs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Impact Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Partners</h4>
            <ul className="space-y-2 text-sm text-sage-200">
              <li><a href="#" className="hover:text-white transition-colors">For Farmers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Urban Growers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Residential Societies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Delivery Partners</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-sage-200">
              <li className="flex items-start gap-2">
                <Icon icon="mdi:email-outline" width={16} className="mt-0.5 shrink-0" />
                <span>hello@harvestlink.eco</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="mdi:map-marker-outline" width={16} className="mt-0.5 shrink-0" />
                <span>124 Greenway Blvd, Eco District, Bangalore</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-sage-500 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-sage-200">
          <div>&copy; {new Date().getFullYear()} HarvestLink. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <div className="flex items-center gap-1 font-medium">
            Made with <Icon icon="mdi:sprout" className="text-sage-300" /> for a greener future
          </div>
        </div>
      </div>
    </footer>
  );
}
