"use client";

import { FeaturesGrid } from "@/components/landing/feature-grids";
import { Footer } from "@/components/landing/footer";
import HeroSection from "@/components/landing/hero-section";
import { Navbar } from "@/components/landing/navbar";
import { CTASection } from "../components/landing/cta-section";

// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 overflow-x-hidden font-sans">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <CTASection />
      <Footer />
    </div>
  );
}
