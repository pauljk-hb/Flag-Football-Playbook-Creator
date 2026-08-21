import { Button } from "@/components/ui/button";
import { RouteTreeIcon } from "@/components/ui/icons/RouteTreeIcon";
import { PlaybookAPI } from "@playbook/core";
import { Download, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ExportPageList } from "./components/ExportPageList";
import { ExportSettingsForm } from "./components/ExportSettingsForm";
import { PagePreview } from "./components/PagePreview";
import { PlaySelectionDialog } from "./components/PlaySelectionDialog";
import { useExportData } from "./hooks/useExportData";
import { useExportSettings } from "./hooks/useExportSettings";

export function ExportPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const {
    allPlays,
    selectedPlays,
    isLoading,
    refreshData,
    updateSelectedPlays,
  } = useExportData();

  const options = useExportSettings((state) => state.options);
  const selectedPresetId = useExportSettings((state) => state.selectedPresetId);
  const applyPreset = useExportSettings((state) => state.applyPreset);
  const updateOption = useExportSettings((state) => state.updateOption);
  const updateMargin = useExportSettings((state) => state.updateMargin);
  const removePlayId = useExportSettings((state) => state.removePlayId);
  const presets = useExportSettings((state) => state.presets);
  const fetchPresets = useExportSettings((state) => state.fetchPresets);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

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
            onPlaysChange={updateSelectedPlays}
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
              presets={presets}
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
            if (!open) refreshData();
          }}
          allPlays={allPlays}
          selectedPlays={selectedPlays}
          isLoading={isLoading}
          onConfirm={(plays) => {
            updateSelectedPlays(plays);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
