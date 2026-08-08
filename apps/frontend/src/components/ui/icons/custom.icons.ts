import { createLucideIcon } from "lucide-react";

export const QuickOutRoute = createLucideIcon("QuickOutRoute", [
  ["path", { d: "M4,14l14,7v2", key: "path-1" }],
  ["path", { d: "M4.68,17.53l-1.61-4,3.93-1.53", key: "path-2" }],
]);

export const SlantRoute = createLucideIcon("SlantRoute", [
  ["path", { d: "M22,14l-14,7v2", key: "path-1" }],
  ["path", { d: "M21.32,17.53l1.61-4-3.93-1.53", key: "path-2" }],
]);

export const ComeBackRoute = createLucideIcon("ComeBackRoute", [
  ["path", { d: "M7,14l8-8v17", key: "path-1" }],
  ["path", { d: "M10,15h-4v-4", key: "path-2" }],
]);

export const HitchRoute = createLucideIcon("HitchRoute", [
  ["path", { d: "M19,14l-8-8v17", key: "path-1" }],
  ["path", { d: "M16,15h4s0-4,0-4", key: "path-2" }],
]);

export const OutRoute = createLucideIcon("OutRoute", [
  ["path", { d: "M6,11h9v12", key: "path-1" }],
  ["path", { d: "M7,14l-3-3,3-3", key: "path-2" }],
]);

export const InRoute = createLucideIcon("InRoute", [
  ["path", { d: "M20,11h-9v12", key: "path-1" }],
  ["path", { d: "M19,14l3-3-3-3", key: "path-2" }],
]);

export const CornerRoute = createLucideIcon("CornerRoute", [
  ["path", { d: "M7,8l6,5v10", key: "path-1" }],
  ["path", { d: "M6,11v-4h4", key: "path-2" }],
]);

export const PostRoute = createLucideIcon("PostRoute", [
  ["path", { d: "M20,6l-9,7v10", key: "path-1" }],
  ["path", { d: "M21,9v-4h-4", key: "path-2" }],
]);

export const GoRoute = createLucideIcon("GoRoute", [
  ["path", { d: "M13,6v17", key: "path-1" }],
  ["path", { d: "M16,7l-3-3-3,3", key: "path-2" }],
]);

export const AddQB = createLucideIcon("AddQB", [
  [
    "path",
    {
      d: "M3.46,16c-.3-.95-.46-1.95-.46-3C3,7.48,7.48,3,13,3s10,4.48,10,10-4.48,10-10,10c-1.05,0-2.05-.16-3-.46",
      key: "path-1",
    },
  ],

  ["line", { x1: "13.5", y1: "15", x2: "15", y2: "18.5", key: "path-3" }],
  ["circle", { cx: "13", cy: "13", r: "4", key: "path-4" }],

  ["line", { x1: "6", y1: "16", x2: "6", y2: "23", key: "path-3" }],
  ["line", { x1: "9.5", y1: "20", x2: "2.5", y2: "20", key: "path-4" }],
]);
