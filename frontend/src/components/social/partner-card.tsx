import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useAcceptPartner,
  useInvitePartner,
  usePartner,
} from "@/lib/hooks/queries/social";
import { Flame, UserPlus } from "lucide-react";
import { useState } from "react";
import { UserSearch } from "./user-search";

export function PartnerCard() {
  const { data, isLoading } = usePartner();
  const { mutate: invite, isPending: isInviting } = useInvitePartner();
  const { mutate: accept, isPending: isAccepting } = useAcceptPartner();
  const [showInvite, setShowInvite] = useState(false);

  const partner = data?.partner;

  if (isLoading)
    return (
      <div className="col-span-2 h-48 bg-slate-100 rounded-xl animate-pulse" />
    );

  // 1. NO PARTNER STATE
  if (!partner) {
    return (
      <Card className="bg-white col-span-2 border border-slate-200 shadow-sm overflow-hidden relative p-6 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
          <UserPlus className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-slate-900">Find a Partner</h3>
        <p className="text-xs text-slate-500 max-w-[200px]">
          Study with a friend to keep each other accountable.
        </p>

        {showInvite ? (
          <div className="w-full max-w-xs mt-2">
            <UserSearch
              onSelect={(userId) => invite(userId)}
              isLoading={isInviting}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => setShowInvite(true)}
          >
            Invite Friend
          </Button>
        )}
      </Card>
    );
  }

  // 2. PENDING STATE
  if (partner.status === "pending") {
    const isSender = partner.initiated_by_me;

    return (
      <Card className="bg-slate-50 col-span-2 border border-slate-200 border-dashed shadow-sm p-6 flex flex-col items-center justify-center text-center gap-2">
        <div className="text-sm font-medium text-slate-900">
          Pending Connection
        </div>

        {isSender ? (
          // I SENT THE INVITE
          <div className="text-xs text-slate-500">
            Waiting for{" "}
            <span className="font-semibold">{partner.user_name}</span> to
            accept...
          </div>
        ) : (
          // I RECEIVED THE INVITE
          <>
            <div className="text-xs text-slate-500">
              <span className="font-semibold">{partner.user_name}</span> invited
              you to be their partner.
            </div>
            <Button
              size="sm"
              className="mt-2 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => accept(partner.id)}
              disabled={isAccepting}
            >
              {isAccepting ? "Accepting..." : "Accept Request"}
            </Button>
          </>
        )}
      </Card>
    );
  }

  // 3. ACTIVE PARTNER STATE
  return (
    <Card className="bg-linear-to-br col-span-2 from-slate-900 to-slate-800 text-white border-0 shadow-lg overflow-hidden relative">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Flame className="w-3 h-3" /> Streak: {partner.streak} Days
          </div>
          <div className="px-2 py-1 rounded-full bg-white/10 text-[10px] font-medium">
            Accountability Partner
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* User A */}
          <div className="text-center">
            <Avatar className="h-12 w-12 border-2 border-emerald-500 mx-auto mb-2">
              <AvatarFallback className="bg-slate-700 text-white">
                ME
              </AvatarFallback>
            </Avatar>
            <div className="text-xs font-medium text-slate-300">You</div>
            <div className="text-[10px] text-emerald-400 mt-1">Today: Done</div>
          </div>

          {/* VS / Connection Line */}
          <div className="flex-1 h-px bg-slate-700 relative top-[-10px]">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 px-2 text-xs text-slate-500">
              vs
            </div>
          </div>

          {/* User B */}
          <div className="text-center opacity-80">
            <Avatar className="h-12 w-12 border-2 border-slate-600 mx-auto mb-2 grayscale">
              <AvatarFallback className="bg-slate-700 text-white">
                {partner.user_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs font-medium text-slate-300">
              {partner.user_name}
            </div>
            <div className="text-[10px] text-amber-400 mt-1">Pending...</div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 p-3 text-center">
        <Button
          variant="link"
          className="text-emerald-300 text-xs h-auto p-0 hover:text-emerald-200"
        >
          Send Reminder to {partner.user_name.split(" ")[0]} &rarr;
        </Button>
      </div>
    </Card>
  );
}
