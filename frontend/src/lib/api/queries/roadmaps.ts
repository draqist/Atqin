import api from "@/lib/axios";
import { Roadmap } from "@/lib/types";

export interface RoadmapInput {
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  is_public: boolean;
}

export const fetchRoadmaps = async (): Promise<Roadmap[]> => {
  const { data } = await api.get<Roadmap[]>("/roadmaps");
  return data;
};

