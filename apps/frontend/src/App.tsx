import { PlaybookProvider } from "./contexts/PlaybookContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Playbook } from "./pages/overview/OverviewPage";
import { EditorLayout } from "./pages/editor/EditorPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "./components/AppTabProvider";

function App() {
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
