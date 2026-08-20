import type { PlayerPreset } from "../../types/presets.js";

export const SYSTEM_PLAYERS: Record<string, PlayerPreset> = {
  QB: { id: "QB", label: "QB", color: "#1a1b1b", shape: "circle" },
  CENTER: { id: "CENTER", label: "C", color: "#469b54", shape: "square" },
  WR1: { id: "WR1", label: "X", color: "#326FB5", shape: "circle" },
  WR2: { id: "WR2", label: "Z", color: "#3399B5", shape: "circle" },
  RED: { id: "RED", label: "R", color: "#E63D38", shape: "circle" },
};
