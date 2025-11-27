import { addRoadmapNode, createRoadmap, deleteRoadmap, deleteRoadmapNode, reorderRoadmapNodes, updateRoadmap } from "@/lib/api/mutations/roadmaps";
import { RoadmapInput } from "@/lib/api/queries/roadmaps";
import { RoadmapNodeInput } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateRoadmap = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RoadmapInput) => createRoadmap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      toast.success("Roadmap created successfully");
      router.push("/admin/roadmaps");
    },
    onError: () => toast.error("Failed to create roadmap"),
  });
};


export const useDeleteRoadmap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoadmap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roadmaps"] });
      toast.success("Roadmap deleted");
    },
    onError: () => toast.error("Failed to delete roadmap"),
  });
};

export const useAddNode = (roadmapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoadmapNodeInput) => addRoadmapNode(roadmapId, data),
    onSuccess: () => {
      // Refresh the roadmap data so the new node appears
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      toast.success("Book added to track");
    },
    onError: () => toast.error("Failed to add book"),
  });
};

export const useDeleteNode = (roadmapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) => deleteRoadmapNode(nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      toast.success("Book removed from track");
    },
    onError: () => toast.error("Failed to remove book"),
  });
};

export const useReorderNodes = (roadmapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: any[]) => reorderRoadmapNodes(roadmapId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      toast.success("Roadmap structure saved");
    },
    onError: () => toast.error("Failed to save order"),
  });
};

export const useUpdateRoadmap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRoadmap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roadmaps"] });
      // We don't toast here to keep the UI snappy for quick toggles, 
      // or you can add a subtle "Status updated" toast.
      toast.success("Roadmap updated");
    },
    onError: () => toast.error("Failed to update roadmap"),
  });
};