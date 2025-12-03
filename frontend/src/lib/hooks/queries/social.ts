import api from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Partner {
  id: string;
  user_id: string;
  user_name: string;
  status: "pending" | "accepted";
  streak: number;
  last_active_at: string;
  initiated_by_me: boolean;
}

export const usePartner = () => {
  return useQuery<{ partner: Partner | null }>({
    queryKey: ["partner"],
    queryFn: async () => {
      const { data } = await api.get("/partners");
      return data;
    },
  });
};

export const useInvitePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUserId: string) => {
      await api.post("/partners/invite", { target_user_id: targetUserId });
    },
    onSuccess: () => {
      toast.success("Invite sent!");
      queryClient.invalidateQueries({ queryKey: ["partner"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to send invite");
    },
  });
};

export const useAcceptPartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partnerId: string) => {
      await api.post("/partners/accept", { partner_id: partnerId });
    },
    onSuccess: () => {
      toast.success("Partner accepted!");
      queryClient.invalidateQueries({ queryKey: ["partner"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to accept partner");
    },
  });
};
