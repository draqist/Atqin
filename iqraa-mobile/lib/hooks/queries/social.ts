import api from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Interface representing a social partner.
 */
export interface Partner {
  id: string;
  user_id: string;
  user_name: string;
  status: "pending" | "accepted";
  streak: number;
  last_active_at: string;
  initiated_by_me: boolean;
}

/**
 * Hook to fetch the current user's partner.
 *
 * @returns {UseQueryResult<{ partner: Partner | null }>} The query result containing the partner information.
 */
export const usePartner = () => {
  return useQuery<{ partner: Partner | null }>({
    queryKey: ["partner"],
    queryFn: async () => {
      const { data } = await api.get("/partners");
      return data;
    },
  });
};

/**
 * Hook to invite a partner.
 *
 * @returns {UseMutationResult} The mutation result for inviting a partner.
 */
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

/**
 * Hook to accept a partner invitation.
 *
 * @returns {UseMutationResult} The mutation result for accepting a partner invitation.
 */
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
