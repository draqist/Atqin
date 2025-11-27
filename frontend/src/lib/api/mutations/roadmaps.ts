import api from "@/lib/axios";
import { Roadmap, RoadmapNodeInput } from "@/lib/types";
import { RoadmapInput } from "../queries/roadmaps";

export const createRoadmap = async (data: RoadmapInput) => {
  const { data: response } = await api.post("/roadmaps", data);
  return response;
};

export const deleteRoadmap = async (id: string): Promise<void> => {
  await api.delete(`/roadmaps/${id}`);
};

export const addRoadmapNode = async (roadmapId: string, data: RoadmapNodeInput) => {
  const { data: response } = await api.post(`/roadmaps/${roadmapId}/nodes`, data);
  return response;
};

export const deleteRoadmapNode = async (nodeId: string) => {
  await api.delete(`/roadmaps/nodes/${nodeId}`);
};

export const reorderRoadmapNodes = async (roadmapId: string, updates: any[]) => {
  await api.put(`/roadmaps/${roadmapId}/nodes/reorder`, updates);
};

export const updateRoadmap = async (id: string, data: Partial<Roadmap>): Promise<Roadmap> => {
  const { data: response } = await api.put<Roadmap>(`/roadmaps/${id}`, data);
  return response;
};