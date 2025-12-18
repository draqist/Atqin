import { fetchMe } from "@/lib/api/queries/auth";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch the current user's profile.
 *
 * @returns {UseQueryResult<UserProfile>} The query result containing the user profile.
 */
export const useUser = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: fetchMe,
    retry: false, // Don't retry if 401 (not logged in)
  });
};