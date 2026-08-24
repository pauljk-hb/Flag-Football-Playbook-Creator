import { SegmentType } from "../../types/interfaces.js";
import type { RoutePreset } from "../../types/presets.js";
import { PIXELS_PER_YARD } from "./fields.js";

const yards = (yards: number) => {
  return yards * PIXELS_PER_YARD * -1;
};

export const SYSTEM_ROUTES: Record<string, RoutePreset> = {
  QUICK_OUT: {
    id: "QUICK_OUT",
    name: "Quick Out",
    waypoints: [{ dx: yards(-10), dy: yards(3), type: SegmentType.STRAIGHT }],
    breakDirection: "outside",
  },
  SLANT: {
    id: "SLANT",
    name: "Slant",
    waypoints: [
      { dx: 0, dy: yards(2), type: SegmentType.STRAIGHT },
      { dx: yards(10), dy: yards(1), type: SegmentType.STRAIGHT },
    ],
    breakDirection: "inside",
  },
  COMEBACK: {
    id: "COME_BACK",
    name: "Come Back",
    waypoints: [
      { dx: 0, dy: yards(7), type: SegmentType.STRAIGHT },
      { dx: 20, dy: 20, type: SegmentType.STRAIGHT },
    ],
    breakDirection: "outside",
  },
  HITCH: {
    id: "HITCH",
    name: "Hitch",
    waypoints: [
      { dx: 0, dy: yards(7), type: SegmentType.STRAIGHT },
      { dx: -20, dy: 20, type: SegmentType.STRAIGHT },
    ],
    breakDirection: "inside",
  },
  IN: {
    id: "IN",
    name: "In",
    waypoints: [
      { dx: 0, dy: yards(7), type: SegmentType.STRAIGHT },
      { dx: yards(10), dy: 0, type: SegmentType.STRAIGHT },
    ],
    breakDirection: "inside",
  },
  OUT: {
    id: "OUT",
    name: "Out",
    waypoints: [
      { dx: 0, dy: yards(7), type: SegmentType.STRAIGHT },
      { dx: yards(-10), dy: 0, type: SegmentType.STRAIGHT },
    ],
    breakDirection: "outside",
  },
  POST: {
    id: "POST",
    name: "Post",
    waypoints: [
      { dx: 0, dy: yards(7), type: SegmentType.STRAIGHT },
      { dx: yards(4), dy: yards(4), type: SegmentType.STRAIGHT },
    ],
    breakDirection: "inside",
  },
  CORNER: {
    id: "CORNER",
    name: "Corner",
    waypoints: [
      { dx: 0, dy: yards(7), type: SegmentType.STRAIGHT },
      { dx: yards(-4), dy: yards(4), type: SegmentType.STRAIGHT },
    ],
    breakDirection: "outside",
  },
  GO: {
    id: "GO",
    name: "Go / Fly",
    waypoints: [{ dx: 0, dy: yards(13), type: SegmentType.STRAIGHT }],
    breakDirection: "straight",
  },
  OVER: {
    id: "OVER",
    name: "Over Route",
    waypoints: [
      {
        dx: yards(18),
        dy: yards(10),
        type: SegmentType.CURVE,
        cpInDx: -50,
        cpInDy: yards(10),
      },
    ],
    breakDirection: "inside",
  },
  UNDER: {
    id: "UNDER",
    name: "Under Route",
    waypoints: [
      {
        dx: yards(18),
        dy: yards(4),
        type: SegmentType.CURVE,
        cpInDx: -50,
        cpInDy: yards(4),
      },
    ],
    breakDirection: "inside",
  },
  WEEL: {
    id: "WEEL",
    name: "Weel Route",
    waypoints: [
      {
        dx: yards(13),
        dy: yards(5),
        type: SegmentType.CURVE,
        cpInDx: yards(13),
        cpInDy: 0,
      },
      {
        dx: yards(0),
        dy: yards(7),
        type: SegmentType.STRAIGHT,
      },
    ],
    breakDirection: "outside",
  },
};
