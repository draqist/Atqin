import { addRoadmapNode, createRoadmap, deleteRoadmap, deleteRoadmapNode, reorderRoadmapNodes, updateRoadmap } from "@/lib/api/mutations/roadmaps";
import { RoadmapInput } from "@/lib/api/queries/roadmaps";
import { RoadmapNodeInput } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

/**
 * Hook to create a new roadmap.
 *
 * @returns {UseMutationResult} The mutation result for creating a roadmap.
 */
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

/**
 * Hook to delete a roadmap.
 *
 * @returns {UseMutationResult} The mutation result for deleting a roadmap.
 */
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

/**
 * Hook to add a node to a roadmap.
 *
 * @param {string} roadmapId - The ID of the roadmap.
 * @returns {UseMutationResult} The mutation result for adding a node.
 */
export const useAddNode = (roadmapId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoadmapNodeInput) => addRoadmapNode(roadmapId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      toast.success("Book added to track");
    },
    onError: () => toast.error("Failed to add book"),
  });
};

/**
 * Hook to delete a node from a roadmap.
 *
 * @param {string} roadmapId - The ID of the roadmap.
 * @returns {UseMutationResult} The mutation result for deleting a node.
 */
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

/**
 * Hook to reorder nodes within a roadmap.
 *
 * @param {string} roadmapId - The ID of the roadmap.
 * @returns {UseMutationResult} The mutation result for reordering nodes.
 */
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

/**
 * Hook to update an existing roadmap.
 *
 * @returns {UseMutationResult} The mutation result for updating a roadmap.
 */
export const useUpdateRoadmap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRoadmap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roadmaps"] });
      toast.success("Roadmap updated");
    },
    onError: () => toast.error("Failed to update roadmap"),
  });
};