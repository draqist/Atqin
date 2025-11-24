import { fetchMe } from "@/lib/api/queries/auth";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: fetchMe,
    retry: false, // Don't retry if 401 (not logged in)
    staleTime: 1000 * 60 * 30, // User data rarely changes, cache for 30 mins
  });
};