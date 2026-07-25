import type { PlayerConfig } from "../entities/PlayerEntity";

export interface Point {
  x: number;
  y: number;
}

export interface SavedPlayerData {
  config: PlayerConfig;
  routeData?: {
    points: Point[];
  };
}

export interface SavedPlay {
  id: string;
  name: string;
  fieldPresetId: string;
  players: SavedPlayerData[];
}