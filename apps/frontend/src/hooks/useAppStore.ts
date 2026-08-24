import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "playbook-theme",
    },
  ),
);

interface AppState {
  hasSeenAlphaWarning: boolean;
  setHasSeenAlphaWarning: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasSeenAlphaWarning: false,
      setHasSeenAlphaWarning: () => set({ hasSeenAlphaWarning: true }),
    }),
    {
      name: "playbook-app-alpha-popUp",
    },
  ),
);

interface PlaybookState {
  activePlaybookId: string | null;
  setActivePlaybookId: (id: string | null) => void;
}

export const usePlaybookStore = create<PlaybookState>((set) => ({
  activePlaybookId: null,
  setActivePlaybookId: (id) => set({ activePlaybookId: id }),
}));
