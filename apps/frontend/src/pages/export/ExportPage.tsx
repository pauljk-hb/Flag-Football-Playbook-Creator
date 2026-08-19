import { api } from "@/api/client";
import { PlaybookAPI } from "@playbook/core"; // Einzige Schnittstelle!
import { useState } from "react";

export function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // 1. API Instanz erstellen (ohne init() aufzurufen!)
      const engine = new PlaybookAPI();

      const playbooksRaw = await api.plays.getAllByPlaybook(
        "9c532698-2512-4421-aff9-8102933dbb4d",
      );

      // 2. Plays extrahieren, nach sortOrder sortieren und parsen
      const plays: any = playbooksRaw
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((play) => {
          // String -> PlayExportData Objekt parsen
          const parsedData = JSON.parse(play.canvasData) as any;

          return {
            ...parsedData,
            // Play-Name anhängen, damit der ExportManager den Titel im PDF drucken kann
            title: play.name,
          };
        });

      console.log(plays);

      // 3. Export starten
      const pdfBlob = await engine.exportToPDF(plays, {
        playbookTitle: "Wristband Cards",
        columns: 3,
        rows: 2,
      });

      // 3. Herunterladen
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Playbook.pdf";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export fehlgeschlagen", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? "Generiere PDF..." : "Als PDF exportieren"}
      </button>
    </div>
  );
}
