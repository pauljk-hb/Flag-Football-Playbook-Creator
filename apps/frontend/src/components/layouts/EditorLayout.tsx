import { Toolbar } from '../Toolbar';
import { PlaybookCanvas } from '../PlaybookCanvas';
import { PropertiesSidebar } from '../PropertiesSidebar';

export function EditorLayout() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* OBERER BEREICH: Werkzeugleiste */}
      <Toolbar />

      {/* UNTERER BEREICH: Canvas & Eigenschaften */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ZENTRUM: Das interaktive Spielfeld */}
        <main className="flex-1 relative bg-slate-50 flex items-center justify-center p-4">
          <PlaybookCanvas />
        </main>

        {/* RECHTE SEITE: Inspektor/Eigenschaften */}
        <PropertiesSidebar />
        
      </div>
    </div>
  );
}