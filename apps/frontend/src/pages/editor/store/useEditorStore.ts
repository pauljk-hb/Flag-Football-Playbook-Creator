import { create } from "zustand";

export type RouteMode = "default" | "option_1" | "option_2";

interface EditorState {
  routeMode: RouteMode;
  setRouteMode: (mode: RouteMode) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  routeMode: "default",
  setRouteMode: (mode) => set({ routeMode: mode }),
}));
