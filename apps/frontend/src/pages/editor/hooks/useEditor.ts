import { api } from "@/api/client";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";
import type { Play, UpdatePlayDTO } from "@/types/interface";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useEditor(playId: string | undefined) {
  const navigate = useNavigate();
  const { play: engineActions } = usePlaybookActions();

  const [playData, setPlayData] = useState<Play | null>(null);
  const [playTitle, setPlayTitle] = useState("Unbenanntes Play");
  const [playDescription, setPlayDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!playId) return;
      setIsLoading(true);

      try {
        const data = await api.plays.getById(playId);
        if (data) {
          setPlayData(data);
          setPlayTitle(data.name);
          setPlayDescription(data.description || "");
        }
      } catch (error) {
        console.error("Fehler beim Laden des Spielzugs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [playId]);

  const handleSave = async () => {
    if (!playId || !engineActions) return;

    setIsSaving(true);
    try {
      const payload: UpdatePlayDTO = {
        name: playTitle,
        description: playDescription,
        thumbnail: engineActions.exportThumbnail(),
        canvasData: engineActions.exportCanvasJSON(),
      };

      await api.plays.update(playId, payload);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = async () => {
    await handleSave();
    navigate("/");
  };

  const downloadAsImage = () => {
    if (!engineActions) return;

    const dataURL = engineActions.exportThumbnail({
      format: "png",
      quality: 1,
      width: 1920,
    });

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${playTitle}-play_export.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
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
  };
}
