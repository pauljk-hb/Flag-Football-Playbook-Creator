import { PlaybookProvider } from "./contexts/PlaybookContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Playbook } from "./pages/overview/OverviewPage";
import { EditorLayout } from "./pages/editor/EditorPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "./components/AppTabProvider";
import { useThemeStore } from "./hooks/useThemeStore";
import { useEffect } from "react";

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return (
    <PlaybookProvider>
      <TooltipProvider delay={500}>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Playbook />} />
              <Route path="/editor/:id?" element={<EditorLayout />} />

              <Route path="/export" element={<div>Export</div>} />

              {/* Fallback für unbekannte Pfade */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PlaybookProvider>
  );
}

export default App;
