"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Users, Zap } from "lucide-react";
import { toast } from "sonner";

// Mock Data (Replace with API later)
const cohortMembers = [
  { id: "1", name: "Ahmed Ali", progress: 45, status: "active", avatar: "" },
  { id: "2", name: "Fatima Z.", progress: 60, status: "active", avatar: "" },
  { id: "3", name: "You", progress: 30, status: "active", avatar: "" }, // The user
  { id: "4", name: "Omar K.", progress: 10, status: "inactive", avatar: "" },
];

export function HalaqahWidget() {
  const handleNudge = (name: string) => {
    toast.success(`You nudged ${name}! They will get a notification.`);
  };

  return (
    <Card className="col-span-3 border-slate-200 shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          Your Study Circle (Cohort #402)
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MessageCircle className="w-4 h-4 text-slate-400" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {cohortMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              {/* Avatar */}
              <Avatar className="h-8 w-8 border border-slate-100">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="bg-slate-100 text-[10px] text-slate-600 font-bold">
                  {member.name[0]}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span
                    className={`text-xs font-medium ${
                      member.name === "You"
                        ? "text-slate-900"
                        : "text-slate-600"
                    }`}
                  >
                    {member.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {member.progress}%
                  </span>
                </div>
                {/* Progress Bar */}
                <Progress
                  value={member.progress}
                  className="h-1.5 bg-slate-100"
                  // Custom color for user vs others
                  // indicatorClassName={member.name === 'You' ? 'bg-emerald-500' : 'bg-indigo-400'}
                />
              </div>

              {/* Action (Nudge if behind) */}
              {member.status === "inactive" && member.name !== "You" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-amber-400 hover:text-amber-600 hover:bg-amber-50"
                  onClick={() => handleNudge(member.name)}
                  title="Nudge this student"
                >
                  <Zap className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50 text-center">
          <p className="text-xs text-slate-400">
            Keep it up! You are in the top 50% of your cohort.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
