import api from "@/lib/axios";
import { Roadmap } from "@/lib/types";

/**
 * Input structure for creating or updating a roadmap.
 */
export interface RoadmapInput {
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  is_public: boolean;
}

/**
 * Fetches all available roadmaps.
 *
 * @returns {Promise<Roadmap[]>} A promise that resolves to an array of roadmaps.
 */
export const fetchRoadmaps = async (): Promise<Roadmap[]> => {
  const { data } = await api.get<Roadmap[]>("/roadmaps");
  return data;
};

