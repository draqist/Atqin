import api from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Interface representing a user notification.
 */
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Hook to fetch user notifications.
 * Polls every 30 seconds.
 *
 * @returns {UseQueryResult<Notification[]>} The query result containing notifications.
 */
export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data || [];
    },
    refetchInterval: 30000, // Poll every 30s
  });
};

/**
 * Hook to mark a single notification as read.
 *
 * @returns {UseMutationResult} The mutation result for marking a notification as read.
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * Hook to mark all notifications as read.
 *
 * @returns {UseMutationResult} The mutation result for marking all notifications as read.
 */
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
