import { Toaster } from "@/components/ui/sonner";
import { usePlaybook } from "@/hooks/usePlaybook";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlaybookCanvas } from "./components/PlaybookCanvas";
import { PropertiesSidebar } from "./components/PropertiesSidebar";
import { Toolbar } from "./components/Toolbar";
import { useEditor } from "./hooks/useEditor";
import { useEditorHotkeys } from "./hooks/useEditorHotkeys";
import { useEngineNotifications } from "./hooks/useEngineNotifications";

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { engine } = usePlaybook();
  useEngineNotifications();
  useEditorHotkeys();

  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const {
    playData,
    playTitle,
    setPlayTitle,
    playDescription,
    setPlayDescription,
    isLoading,
    isSaving,
    handleSave,
    handleBack,
    downloadAsImage,
  } = useEditor(id);

  useEffect(() => {
    const unsubscribe = engine?.subscribeToDrawingMode(setIsDrawingMode);
    return () => unsubscribe?.();
  }, [engine]);

  if (!playData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background gap-4">
        <p className="text-destructive font-medium">
          Spielzug konnte nicht gefunden werden.
        </p>
        <Link to="/">Zurück zum Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toolbar
        title={playTitle}
        isDrawingMode={isDrawingMode}
        onSave={handleSave}
        onDownload={downloadAsImage}
        drawRoute={(routeMode: string) => engine?.startDrawingRoute(routeMode)}
      />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative flex items-center justify-center p-4">
          {isLoading ? (
            <p>Loading....</p>
          ) : (
            <PlaybookCanvas initialPlayData={playData?.canvasData} />
          )}
        </main>

        <PropertiesSidebar
          play={playData}
          onTitleChange={setPlayTitle}
          description={playDescription}
          onDescriptionChange={setPlayDescription}
        />
      </div>
      <Toaster position="bottom-left" richColors closeButton />
    </div>
  );
}
