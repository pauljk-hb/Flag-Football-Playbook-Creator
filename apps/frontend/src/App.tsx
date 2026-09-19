import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppTabProvider";
import { PlaybookProvider } from "./contexts/PlaybookContext";
import { useThemeStore } from "./hooks/useAppStore";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import { EditorPage } from "./pages/editor/EditorPage";
import { ExportPage } from "./pages/export/ExportPage";
import { Playbook } from "./pages/overview/OverviewPage";

function App() {
  const theme = useThemeStore((state) => state.theme);

  const THEME_COLORS = {
    dark: "#2D2D31",
    light: "#F4F4F5",
  };

  function updateThemeColor(isDark: boolean) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      isDark ? THEME_COLORS.dark : THEME_COLORS.light,
    );
  }

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (isDark: boolean) => {
      root.classList.remove("light", "dark");
      root.classList.add(isDark ? "dark" : "light");
      updateThemeColor(isDark);
    };

    if (theme === "system") {
      applyTheme(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    applyTheme(theme === "dark");
  }, [theme]);

  return (
    <PlaybookProvider>
      <TooltipProvider delay={500}>
        <BrowserRouter>
          <Routes>
            {/* Öffentliche Seiten */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />

            {/* Geschützte Kern App */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Playbook />} />
              <Route path="/editor/:id?" element={<EditorPage />} />

              <Route path="/export" element={<ExportPage />} />

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
