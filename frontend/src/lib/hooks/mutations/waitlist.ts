import { joinWaitlist } from "@/lib/api/mutations/waitlist";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useJoinWaitlist = () => {
  return useMutation({
    mutationFn: (email: string) => joinWaitlist(email),
    onSuccess: () => {
      toast.success(
        "You're on the list! We'll notify you when AI Tasm'i is live."
      );
    },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });
};
