"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useJoinCohort } from "@/lib/hooks/mutations/social";
import { cn } from "@/lib/utils";
import { Loader2, Rabbit, Turtle, Zap } from "lucide-react";
import { useState } from "react";

interface JoinTrackDialogProps {
  children: React.ReactNode;
  roadmapId: string;
}

const paces = [
  {
    id: "casual",
    title: "Casual",
    desc: "1 Book / Month",
    icon: Turtle,
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: "dedicated",
    title: "Dedicated",
    desc: "1 Book / Week",
    icon: Rabbit,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    id: "intensive",
    title: "Intensive",
    desc: "Daily Hifdh",
    icon: Zap,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
];

export function JoinTrackDialog({ children, roadmapId }: JoinTrackDialogProps) {
  const [selectedPace, setSelectedPace] = useState("dedicated");
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: join, isPending } = useJoinCohort(roadmapId);

  const handleJoin = () => {
    join(selectedPace, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Choose Your Pace</DialogTitle>
          <DialogDescription>
            We will add you to a cohort of students with similar goals.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {paces.map((pace) => {
            const Icon = pace.icon;
            const isSelected = selectedPace === pace.id;
            return (
              <div
                key={pace.id}
                onClick={() => setSelectedPace(pace.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  isSelected
                    ? `border-slate-900 bg-slate-50`
                    : "border-transparent bg-white hover:bg-slate-50 border-slate-100"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    pace.color
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{pace.title}</h4>
                  <p className="text-xs text-slate-500">{pace.desc}</p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected ? "border-slate-900" : "border-slate-300"
                  )}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleJoin}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
          disabled={isPending}
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Join Cohort
        </Button>
      </DialogContent>
    </Dialog>
  );
}
