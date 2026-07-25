import type { RoutePreset } from "../../types/presets.js";
import { PIXELS_PER_YARD } from "./fields.js";

const yards = (yards: number) => {
  return yards * PIXELS_PER_YARD * -1;
};

export const SYSTEM_ROUTES: Record<string, RoutePreset> = {
  QUICK_OUT: {
    id: "QUICK_OUT",
    name: "Quick Out",
    waypoints: [{ dx: yards(-10), dy: yards(3) }],
    breakDirection: "outside",
  },
  SLANT: {
    id: "SLANT",
    name: "Slant",
    waypoints: [
      { dx: 0, dy: yards(2) },
      { dx: yards(10), dy: yards(1) },
    ],
    breakDirection: "inside",
  },
  COMEBACK: {
    id: "COME_BACK",
    name: "Come Back",
    waypoints: [
      { dx: 0, dy: yards(7) },
      { dx: 20, dy: 20 },
    ],
    breakDirection: "outside",
  },
  HITCH: {
    id: "HITCH",
    name: "Hitch",
    waypoints: [
      { dx: 0, dy: yards(7) },
      { dx: -20, dy: 20 },
    ],
    breakDirection: "inside",
  },
  IN: {
    id: "IN",
    name: "In",
    waypoints: [
      { dx: 0, dy: yards(7) },
      { dx: yards(10), dy: 0 },
    ],
    breakDirection: "inside",
  },
  OUT: {
    id: "OUT",
    name: "Out",
    waypoints: [
      { dx: 0, dy: yards(7) },
      { dx: yards(-10), dy: 0 },
    ],
    breakDirection: "outside",
  },
  POST: {
    id: "POST",
    name: "Post",
    waypoints: [
      { dx: 0, dy: yards(7) },
      { dx: yards(4), dy: yards(4) },
    ],
    breakDirection: "inside",
  },
  CORNER: {
    id: "CORNER",
    name: "Corner",
    waypoints: [
      { dx: 0, dy: yards(7) },
      { dx: yards(-4), dy: yards(4) },
    ],
    breakDirection: "outside",
  },
  GO: {
    id: "GO",
    name: "Go / Fly",
    waypoints: [{ dx: 0, dy: yards(13) }],
    breakDirection: "straight",
  },
};
