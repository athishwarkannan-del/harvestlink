"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";

export default function AssistantCharacter() {
  const [showBubble, setShowBubble] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Delay appearance of the assistant
    const timer = setTimeout(() => setIsVisible(true), 1500);
    
    // Show bubble shortly after appearance
    const bubbleTimer = setTimeout(() => setShowBubble(true), 2500);
    
    // Hide bubble after 5 seconds
    const hideBubbleTimer = setTimeout(() => setShowBubble(false), 7500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(bubbleTimer);
      clearTimeout(hideBubbleTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none"
        >
          {/* Speech Bubble */}
          <AnimatePresence>
            {(showBubble || isHovered) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9, originBottom: "100%", originRight: "0%" }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="mb-3 bg-white px-4 py-2 rounded-2xl rounded-br-sm shadow-card border border-sage-100 pointer-events-auto"
              >
                <p className="text-sm font-medium text-text-primary whitespace-nowrap">
                  Hi, welcome back <span className="inline-block animate-[wave-hand_2s_infinite]">👋</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="pointer-events-auto cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBubble(true)}
          >
            <div className="relative w-20 h-20 rounded-full bg-white border-2 border-white shadow-card flex items-center justify-center overflow-hidden">
              <video
                src="/hi-gesture.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Status Dot */}
              <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white z-50" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
