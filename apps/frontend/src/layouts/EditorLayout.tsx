import { Toolbar } from "../components/editor/Toolbar";
import { PlaybookCanvas } from "../components/editor/PlaybookCanvas";
import { PropertiesSidebar } from "../components/editor/PropertiesSidebar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";
import type { Play, PlayDTO } from "@/types/interface";

export function EditorLayout() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { play } = usePlaybookActions();

  const [playTitle, setPlayTitle] = useState("Unbenanntes Play");
  const [playDescription, setPlayDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [rawPlayData, setRawPlayData] = useState<Play | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      if (id) {
        try {
          const data = await api.plays.getById(id);
          if (data) {
            setRawPlayData(data);
            setPlayTitle(data.title);
            setPlayDescription(data.description || "");
          }
        } catch (error) {
          console.error("Fehler beim Laden des Spielzugs:", error);
        }
      } else {
        setPlayTitle("Unbenanntes Play");
        setPlayDescription("");
        setRawPlayData(null);
      }
      setIsLoading(false);
    }

    loadData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const thumbnailString = play.exportThumbnail();
      const canvasData = play.exportCanvasJSON();

      const payload: PlayDTO = {
        title: playTitle,
        description: playDescription,
        thumbnail: thumbnailString,
        data: canvasData,
      };

      if (id) {
        await api.plays.update(id, payload);
      } else {
        const newId = await api.plays.save(payload);
        navigate(`/editor/${newId}`, { replace: true });
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Lade Playbook-Editor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Toolbar title={playTitle} onSave={handleSave} />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative bg-slate-50 flex items-center justify-center p-4">
          <PlaybookCanvas initialPlayData={rawPlayData?.data} />
        </main>

        <PropertiesSidebar
          title={playTitle}
          onTitleChange={setPlayTitle}
          description={playDescription}
          onDescriptionChange={setPlayDescription}
        />
      </div>
    </div>
  );
}
