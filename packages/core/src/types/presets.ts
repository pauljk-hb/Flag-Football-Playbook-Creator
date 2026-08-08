import type { SegmentType } from "./interfaces";

export interface PlayerPreset {
  id: string;
  label: string;
  color: string;
  shape: "circle" | "square";
}

export interface RoutePreset {
  id: string;
  name: string;
  waypoints: {
    dx: number;
    dy: number;
    type: SegmentType;
    cpInDx?: number;
    cpInDy?: number;
  }[];
  breakDirection?: "inside" | "outside" | "straight";
}

export interface PlayerSpawnData {
  presetId: string;
  x: number;
  y: number;
  label: string;
  color: string;
  shape: "circle" | "square";
}

export interface FormationPreset {
  id: string;
  name: string;
  thumbnail?: string;
  positions: FormationPosition[];
}

export interface FormationPosition {
  playerPresetId: string;
  dx: number;
  dy: number;
}

export interface FieldLineConfig {
  yardsFromLos: number;
  type: "los" | "yardline" | "endzone";
}

export interface FieldPreset {
  id: string;
  name: string;
  lines: FieldLineConfig[];
  anchor: { x: number; y: number };
}
