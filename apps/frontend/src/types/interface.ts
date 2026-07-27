import type { SavedPlay } from "@playbook/core/dist/types/interfaces";

export interface Play {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  data: SavedPlay;
  createdAt: string;
  updatedAt: string;
}

export type PlayDTO = {
  title: string;
  description?: string;
  thumbnail: string;
  data: string;
};
