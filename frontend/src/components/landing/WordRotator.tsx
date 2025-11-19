"use client";

import { cn } from "@/lib/utils"; // Assuming you have a utils file, or remove and use template literals
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = [
  "Digital Rihal",
  "الرحلة الرقمية",
  "Virtual Kuttab",
  "الكتاتيب الافتراضية",
  "Smart Hifdh",
];

export function WordRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3500); // Slightly slower for better readability
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center justify-start align-top h-[1.5em] px-2 -mb-3">
      {/* The width container animates to fit the text size smoothly */}
      <motion.div
        key={index}
        layout // This magic prop handles the width animation
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          mass: 1,
        }}
        className="relative flex items-center"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className={cn(
              "block whitespace-nowrap text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-300 font-lombardia italic",
              // Adjust line height slightly for Arabic script consistency
              "leading-normal pb-2"
            )}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
