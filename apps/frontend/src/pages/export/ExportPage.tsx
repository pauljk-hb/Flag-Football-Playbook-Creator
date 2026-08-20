import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useExportSettings } from "./hooks/useExportSettings";
import { PlaySelectionDialog } from "./components/PlaySelectionDialog";
import { ExportPageList } from "./components/ExportPageList";
import { ExportSettingsForm } from "./components/ExportSettingsForm";
import { PlaybookAPI } from "@playbook/core";
import { PagePreview } from "./components/PagePreview";
import { RouteTreeIcon } from "@/components/ui/icons/RouteTreeIcon";
import { api } from "@/api/client";
import type { ExtendedUser, Play, SelectedPlayItem } from "@/types/interface";
import { useSession } from "@/lib/auth-client";

export function ExportPage() {
  const { data: session } = useSession();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [allPlays, setAllPlays] = useState<Play[]>([]);

  // 1. Store Variablen abrufen (Jetzt mit IDs statt ganzen Objekten)
  const options = useExportSettings((state) => state.options);
  const selectedPresetId = useExportSettings((state) => state.selectedPresetId);
  const selectedPlayIds = useExportSettings((state) => state.selectedPlayIds);
  const applyPreset = useExportSettings((state) => state.applyPreset);
  const updateOption = useExportSettings((state) => state.updateOption);
  const updateMargin = useExportSettings((state) => state.updateMargin);
  const setSelectedPlayIds = useExportSettings(
    (state) => state.setSelectedPlayIds,
  );
  const removePlayId = useExportSettings((state) => state.removePlayId);

  // 1. Zentrale Ladefunktion für frische Playbook-Plays
  const loadFreshPlays = useCallback(async () => {
    try {
      const playbooks = await api.playbooks.getAll();
      if (!playbooks || playbooks.length === 0) return;

      const user = session?.user
        ? (session.user as typeof session.user & ExtendedUser)
        : undefined;

      const currentPlaybookId = user?.lastPlaybookId || playbooks[0].id;
      const data = await api.plays.getAllByPlaybook(currentPlaybookId);
      if (data) {
        setAllPlays(data);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Plays:", error);
    }
  }, [session?.user]);

  // Beim Laden der Seite frische Plays ziehen
  useEffect(() => {
    loadFreshPlays();
  }, [loadFreshPlays]);

  // 2. IDs immer mit dem aktuellen Stand von allPlays verknüpfen
  const selectedPlays: SelectedPlayItem[] = useMemo(() => {
    const playMap = new Map(allPlays.map((p) => [p.id, p]));

    return selectedPlayIds
      .map((id) => playMap.get(id))
      .filter((p): p is Play => Boolean(p))
      .map((p) => ({
        id: p.id,
        title: p.name,
        description: p.description || undefined,
        thumbnail: p.thumbnail || "",
        data: p.canvasData,
      }));
  }, [selectedPlayIds, allPlays]);

  // Drag & Drop Handler (Synchronisiert State & Store)
  const handlePlaysChange = (
    updaterOrValue:
      | SelectedPlayItem[]
      | ((prev: SelectedPlayItem[]) => SelectedPlayItem[]),
  ) => {
    if (typeof updaterOrValue === "function") {
      const newPlays = updaterOrValue(selectedPlays);
      setSelectedPlayIds(newPlays.map((p) => p.id));
    } else {
      setSelectedPlayIds(updaterOrValue.map((p) => p.id));
    }
  };

  const handleExport = async () => {
    const engine = new PlaybookAPI();

    setIsExporting(true);
    try {
      const payload = selectedPlays.map((p) => ({
        ...JSON.parse(p.data || "{}"),
        title: p.title,
      }));

      const pdfBlob = await engine.exportToPDF(payload, options);

      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Playbook.pdf";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("PDF-Export fehlgeschlagen:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 h-12 border-b bg-muted flex-none">
        <div className="flex items-center gap-2">
          <RouteTreeIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight text-muted-foreground">
            Playbook Designer
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Plays auswählen
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={selectedPlays.length === 0 || isExporting}
          >
            <Download className="w-4 h-4 mr-1.5" />
            {isExporting ? "Erstelle PDF..." : "PDF exportieren"}
          </Button>
        </div>
      </header>

      {/* 2-Spalten-Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* LINKE SPALTE: Seiten & DND Plays */}
        <div className="col-span-7 overflow-y-auto pr-2 border-r">
          <ExportPageList
            plays={selectedPlays}
            onPlaysChange={handlePlaysChange}
            onRemovePlay={removePlayId}
            options={options}
          />
        </div>

        {/* RECHTE SPALTE: Vorschau oben + Einstellungen unten */}
        <div className="col-span-5 overflow-y-auto pr-1 flex flex-col gap-2 bg-muted">
          <div className="p-4 pb-0 text-muted-foreground text-sm h-64 bg-muted/20">
            <PagePreview options={options} plays={selectedPlays} />
          </div>
          <div className="p-4 pt-0 pb-16 text-muted-foreground text-sm flex-1">
            <ExportSettingsForm
              options={options}
              selectedPresetId={selectedPresetId}
              onApplyPreset={applyPreset}
              onUpdateOption={updateOption}
              onUpdateMargin={updateMargin}
            />
          </div>
        </div>
      </div>

      {/* Modal: PlaySelectionDialog */}
      {dialogOpen && (
        <PlaySelectionDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) loadFreshPlays();
          }}
          selectedPlays={selectedPlays}
          onConfirm={(plays) => {
            setSelectedPlayIds(plays.map((p) => p.id));
            loadFreshPlays();
          }}
        />
      )}
    </div>
  );
}
