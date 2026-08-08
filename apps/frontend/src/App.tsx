import { PlaybookProvider } from "./contexts/PlaybookContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Playbook } from "./pages/overview/OverviewPage";
import { EditorLayout } from "./pages/editor/EditorPage";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <PlaybookProvider>
      <TooltipProvider delay={500}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Playbook />} />
            <Route path="/editor/:id?" element={<EditorLayout />} />
            {/* Fallback für unbekannte Pfade */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PlaybookProvider>
  );
}

export default App;
