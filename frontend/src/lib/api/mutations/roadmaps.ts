import api from "@/lib/axios";
import { Roadmap, RoadmapNodeInput } from "@/lib/types";
import { RoadmapInput } from "../queries/roadmaps";

/**
 * Creates a new roadmap.
 *
 * @param {RoadmapInput} data - The data for the new roadmap.
 * @returns {Promise<any>} A promise that resolves to the created roadmap.
 */
export const createRoadmap = async (data: RoadmapInput) => {
  const { data: response } = await api.post("/roadmaps", data);
  return response;
};

/**
 * Deletes a roadmap.
 *
 * @param {string} id - The ID of the roadmap to delete.
 * @returns {Promise<void>} A promise that resolves when the roadmap is deleted.
 */
export const deleteRoadmap = async (id: string): Promise<void> => {
  await api.delete(`/roadmaps/${id}`);
};

/**
 * Adds a node to a roadmap.
 *
 * @param {string} roadmapId - The ID of the roadmap.
 * @param {RoadmapNodeInput} data - The data for the new node.
 * @returns {Promise<any>} A promise that resolves to the created node.
 */
export const addRoadmapNode = async (roadmapId: string, data: RoadmapNodeInput) => {
  const { data: response } = await api.post(`/roadmaps/${roadmapId}/nodes`, data);
  return response;
};

/**
 * Deletes a node from a roadmap.
 *
 * @param {string} nodeId - The ID of the node to delete.
 * @returns {Promise<void>} A promise that resolves when the node is deleted.
 */
export const deleteRoadmapNode = async (nodeId: string) => {
  await api.delete(`/roadmaps/nodes/${nodeId}`);
};

/**
 * Reorders nodes within a roadmap.
 *
 * @param {string} roadmapId - The ID of the roadmap.
 * @param {any[]} updates - The list of updates for node positions.
 * @returns {Promise<void>} A promise that resolves when the nodes are reordered.
 */
export const reorderRoadmapNodes = async (roadmapId: string, updates: any[]) => {
  await api.put(`/roadmaps/${roadmapId}/nodes/reorder`, updates);
};

/**
 * Updates an existing roadmap.
 *
 * @param {string} id - The ID of the roadmap to update.
 * @param {Partial<Roadmap>} data - The data to update.
 * @returns {Promise<Roadmap>} A promise that resolves to the updated roadmap.
 */
export const updateRoadmap = async (id: string, data: Partial<Roadmap>): Promise<Roadmap> => {
  const { data: response } = await api.put<Roadmap>(`/roadmaps/${id}`, data);
  return response;
};