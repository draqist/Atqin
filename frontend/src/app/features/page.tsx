"use client";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { ArrowUp, MessageSquarePlus, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useCreateFeatureRequest,
  useFeatureRequests,
  useVoteFeatureRequest,
} from "@/lib/hooks/queries/features";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export default function FeatureRequestsPage() {
  const { data: requests, isLoading } = useFeatureRequests();
  const { mutate: createRequest, isPending: isCreating } =
    useCreateFeatureRequest();
  const { mutate: vote } = useVoteFeatureRequest();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const { user } = useAuth(); // If we want to gate voting/submission UI

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createRequest(values, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      },
    });
  };

  const handleVote = (id: string) => {
    vote(id);
  };

  // Sort by votes (descending)
  const sortedRequests = requests
    ? [...requests].sort((a, b) => b.votes - a.votes)
    : [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900">
        {/* 1. HERO SECTION: "The Vision" */}
        <section className="relative bg-slate-900 text-white pt-32 pb-24 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttext>ures.com/patterns/cubes.png')]" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3 h-3" /> Community Driven
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Help us build the <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-emerald-400">
                  Future of Knowledge.
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Iqraa is built for you. Vote on the features you need most, or
                suggest something new to shape our roadmap.
              </p>
            </div>

            {/* CTA Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-emerald-50 rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-indigo-900/20 transition-transform hover:-translate-y-1"
                >
                  <MessageSquarePlus className="w-5 h-5 mr-2" /> Suggest Feature
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden gap-0 border-0">
                <div className="bg-slate-50 p-6 border-b border-slate-100">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      New Suggestion
                    </DialogTitle>
                    <DialogDescription>
                      What would make your study better?
                    </DialogDescription>
                  </DialogHeader>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="p-6 space-y-4 bg-white">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                              Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Offline Mode"
                                className="h-11 text-base"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain why this would be helpful..."
                                className="min-h-[120px] resize-none text-base leading-relaxed"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="p-4 bg-slate-50 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-slate-900 text-white"
                        disabled={isCreating}
                      >
                        {isCreating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Submit Idea
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* 2. THE LIST (Modern Feed) */}
        <main className="max-w-4xl mx-auto px-6 -mt-12 relative z-20 pb-32">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRequests.map((req, idx) => {
                const isVoted = req.has_voted;
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-2xl p-1 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300"
                  >
                    <div className="flex items-stretch">
                      {/* Vote Button Section */}
                      <div className="flex flex-col justify-center p-4 pr-0">
                        <button
                          onClick={() => handleVote(req.id)}
                          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border transition-all duration-200 ${
                            isVoted
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          <ArrowUp
                            className={`w-5 h-5 mb-0.5 ${
                              isVoted ? "stroke-[3px]" : "stroke-[2px]"
                            }`}
                          />
                          <span className="text-sm font-bold">{req.votes}</span>
                        </button>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-5 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {req.title}
                          </h3>
                          <StatusPill status={req.status} />
                        </div>
                        <p className="text-slate-500 leading-relaxed text-sm">
                          {req.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles = {
    planned: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    under_review: "bg-slate-100 text-slate-600 border-slate-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const labels = {
    planned: "Planned",
    in_progress: "In Progress",
    under_review: "Under Review",
    completed: "Shipped",
  };

  // @ts-ignore
  const style = styles[status] || styles.under_review;
  // @ts-ignore
  const label = labels[status] || "Unknown";

  return (
    <Badge
      variant="outline"
      className={`${style} px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border`}
    >
      {label}
    </Badge>
  );
}
