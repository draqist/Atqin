import { createResource, deleteResource, updateResource } from "@/lib/api/queries/resources";
import { toast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      toast.success("Resource created");
      router.push("/admin/resources");
      queryClient.invalidateQueries({ queryKey: ["admin", "resources"] });
    },
    onError: () => toast.error("Failed to create resource"),
  });
};

export const useUpdateResource = (id: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resources"] });
      queryClient.invalidateQueries({ queryKey: ["resource", id] });
      toast.success("Resource updated");
      router.push("/admin/resources");
    },
    onError: () => toast.error("Failed to update"),
  });
};

export const useDeleteResource = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resources"] });
      toast.success("Resource deleted");
      router.push("/admin/resources");
    },
  });
};