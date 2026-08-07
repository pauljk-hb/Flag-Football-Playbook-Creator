import { PlaybookProvider } from "./contexts/PlaybookContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Playbook } from "./pages/overview/OverviewPage";
import { EditorLayout } from "./pages/editor/EditorPage";

function App() {
  return (
    <PlaybookProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Playbook />} />
          <Route path="/editor/:id?" element={<EditorLayout />} />
          {/* Fallback für unbekannte Pfade */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PlaybookProvider>
  );
}

export default App;
