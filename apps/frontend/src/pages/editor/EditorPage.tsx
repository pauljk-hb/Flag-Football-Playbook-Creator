import { Toolbar } from "./components/Toolbar";
import { PlaybookCanvas } from "./components/PlaybookCanvas";
import { PropertiesSidebar } from "./components/PropertiesSidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";
import type { Play, UpdatePlayDTO } from "@/types/interface";
import { usePlaybook } from "@/hooks/usePlaybook";
import { Toaster } from "@/components/ui/sonner";
import { useEngineNotifications } from "./hooks/useEngineNotifications";
import { useEditorHotkeys } from "./hooks/useEditorHotkeys";
import { Button } from "@/components/ui/button";

export function EditorLayout() {
  const { id } = useParams<{ id: string }>();
  const { engine } = usePlaybook();
  useEngineNotifications();
  useEditorHotkeys();
  const { play } = usePlaybookActions();

  const [playTitle, setPlayTitle] = useState("Unbenanntes Play");
  const [playDescription, setPlayDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const [playData, setPlayData] = useState<Play | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (!id) return;
      try {
        const data = await api.plays.getById(id);
        if (data) {
          setPlayData(data);
          setPlayTitle(data.name);
          setPlayDescription(data.description || "");
        }
      } catch (error) {
        console.error("Fehler beim Laden des Spielzugs:", error);
      }

      setIsLoading(false);
    }

    loadData();
  }, [id]);

  useEffect(() => {
    const unsubscribe = engine?.subscribeToDrawingMode((isDrawing) => {
      setIsDrawingMode(isDrawing);
    });

    return () => unsubscribe?.();
  }, [engine]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const thumbnailString = play.exportThumbnail();
      const canvasData = play.exportCanvasJSON();

      const payload: UpdatePlayDTO = {
        name: playTitle,
        description: playDescription,
        thumbnail: thumbnailString,
        canvasData: canvasData,
      };

      if (!id) return;
      await api.plays.update(id, payload);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPlayAsImage = () => {
    const dataURL = play.exportThumbnail({
      format: "png",
      quality: 0.8,
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${playTitle}-play_export.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!playData) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background gap-4">
        <p className="text-destructive font-medium">
          Spielzug konnte nicht gefunden werden.
        </p>
        <Button onClick={() => navigate("/")} variant="outline">
          Zurück zum Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toolbar
        title={playTitle}
        isDrawingMode={isDrawingMode}
        onSave={handleSave}
        onDownload={downloadPlayAsImage}
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
