"use client";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";

const categories = [
  {
    icon: BookOpen,
    title: "Library & Reading",
    desc: "Issues with books, fonts, PDF loading, or the reading interface.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "group-hover:border-emerald-500/20",
  },
  {
    icon: User,
    title: "Account & Profile",
    desc: "Login trouble, password reset, profile settings, and preferences.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "group-hover:border-blue-500/20",
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    desc: "Manage your subscription, payment methods, and invoicing.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "group-hover:border-purple-500/20",
  },
  {
    icon: MessageCircle,
    title: "Community",
    desc: "Questions about reflections, cohorts, and social guidelines.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "group-hover:border-amber-500/20",
  },
];

const faqs = [
  {
    q: "How do I reset my reading progress?",
    a: "Open the book in the reader view, click the settings icon (gear) in the top right, and select 'Reset Progress'. Note that this action cannot be undone.",
  },
  {
    q: "Is the Hifdh AI available offline?",
    a: "Currently, the AI requires an active internet connection to process your recitation. We are working on an offline mode for a future update.",
  },
  {
    q: "Can I download books as PDFs?",
    a: "Yes. If a book has a PDF resource available, you will see a 'Download' icon in the Resources tab on the right sidebar.",
  },
  {
    q: "How do I report a typo in a text?",
    a: "Highlight the specific text in question. A menu will appear; select 'Report Issue' to flag it for our editorial team.",
  },
  {
    q: "What happens if I miss a day in my cohort?",
    a: "Nothing bad! Your streak will reset, but you can continue right where you left off. You can also use a 'Freeze' if you know you'll be away.",
  },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 pb-20">
        {/* 1. HERO SECTION: "The Concierge" */}
        <section className="relative bg-slate-900 text-white pt-32 pb-32 px-6 overflow-hidden">
          {/* Background FX */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md"
            >
              <HelpCircle className="w-3 h-3" /> Support Center
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
            >
              How can we <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                help you today?
              </span>
            </motion.h1>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-xl mx-auto"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500" />
                <div className="relative flex items-center">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    placeholder="Search for answers (e.g. 'reset password')"
                    className="h-16 pl-14 pr-6 rounded-full bg-slate-900/90 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:border-emerald-500/50 text-lg shadow-2xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. CATEGORY GRID (Overlapping) */}
        <section className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white hover:border-emerald-100 transition-all cursor-pointer group relative overflow-hidden ${cat.border}`}
              >
                <div className="flex items-start gap-6 relative z-10">
                  <div
                    className={`p-4 rounded-2xl ${cat.bg} ${cat.color} transition-transform group-hover:scale-110 duration-300`}
                  >
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed">{cat.desc}</p>
                  </div>
                  <div className="self-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. FAQ & CONTACT */}
        <section className="max-w-3xl mx-auto px-6 py-32">
          {/* FAQ Header */}
          <div className="text-center mb-16 space-y-4">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Common Questions
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Frequently Asked
            </h2>
          </div>

          {/* Accordion */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="px-6 border-b border-slate-100 last:border-0 data-[state=open]:bg-slate-50/50 transition-colors"
                >
                  <AccordionTrigger className="hover:no-underline py-6 text-left text-lg font-medium text-slate-700 data-[state=open]:text-emerald-700">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 leading-relaxed pb-6 text-base">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact CTA Card */}
          <div className="mt-24 relative overflow-hidden rounded-3xl bg-slate-900 text-white p-12 text-center shadow-2xl">
            {/* Abstract shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Still need help?
                </h3>
                <p className="text-slate-400 max-w-md mx-auto text-lg">
                  Our team is available to assist you with any technical or
                  account related issues.
                </p>
              </div>

              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-900 font-bold px-8 h-14 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
