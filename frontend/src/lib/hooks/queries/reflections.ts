import { fetchGlobalReflections } from "@/lib/api/queries/reflections";
import { useQuery } from "@tanstack/react-query";

export const useGlobalReflections = () => {
  return useQuery({
    queryKey: ["reflections", "global"],
    queryFn: fetchGlobalReflections,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};