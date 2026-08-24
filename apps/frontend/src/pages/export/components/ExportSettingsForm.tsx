import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ExportPreset, PDFExportOptions } from "@/types/interface";
import { SavePresetPopover } from "./SavePresetPopover";

interface ExportSettingsFormProps {
  options: PDFExportOptions;
  presets: ExportPreset[];
  selectedPresetId: string;
  onApplyPreset: (id: string) => void;
  onUpdateOption: <K extends keyof PDFExportOptions>(
    key: K,
    value: PDFExportOptions[K],
  ) => void;
  onUpdateMargin: (side: keyof PDFExportOptions["margin"], val: number) => void;
}

export function ExportSettingsForm({
  options,
  presets,
  selectedPresetId,
  onApplyPreset,
  onUpdateOption,
  onUpdateMargin,
}: ExportSettingsFormProps) {
  return (
    <div className="space-y-6 flex-1 pr-2">
      {/* PRESETS */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Preset auswählen</Label>
        <select
          value={selectedPresetId}
          onChange={(e) => onApplyPreset(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <Separator />

      {/* DOKUMENT-EINSTELLUNGEN */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Dokument
        </h4>

        <div className="space-y-1.5">
          <Label className="text-xs">Playbook Titel</Label>
          <Input
            value={options.playbookTitle || ""}
            onChange={(e) => onUpdateOption("playbookTitle", e.target.value)}
            placeholder="z. B. Offense Playbook 2026"
            className="h-8 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Breite (mm)</Label>
            <Input
              type="number"
              value={options.pageWidth}
              onChange={(e) =>
                onUpdateOption("pageWidth", Number(e.target.value))
              }
              min={0}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Höhe (mm)</Label>
            <Input
              type="number"
              value={options.pageHeight}
              onChange={(e) =>
                onUpdateOption("pageHeight", Number(e.target.value))
              }
              min={0}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Spalten (Columns)</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={options.columns}
              onChange={(e) =>
                onUpdateOption("columns", Number(e.target.value))
              }
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Zeilen (Rows)</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={options.rows}
              onChange={(e) => onUpdateOption("rows", Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Margins */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            Ränder (mm) [Oben, Rechts, Unten, Links]
          </Label>
          <div className="grid grid-cols-4 gap-2">
            <Input
              type="number"
              value={options.margin.top}
              onChange={(e) => onUpdateMargin("top", Number(e.target.value))}
              className="h-8 text-xs text-center"
              min={0}
              title="Oben"
            />
            <Input
              type="number"
              value={options.margin.right}
              onChange={(e) => onUpdateMargin("right", Number(e.target.value))}
              className="h-8 text-xs text-center"
              min={0}
              title="Rechts"
            />
            <Input
              type="number"
              value={options.margin.bottom}
              onChange={(e) => onUpdateMargin("bottom", Number(e.target.value))}
              className="h-8 text-xs text-center"
              min={0}
              title="Unten"
            />
            <Input
              type="number"
              value={options.margin.left}
              onChange={(e) => onUpdateMargin("left", Number(e.target.value))}
              className="h-8 text-xs text-center"
              min={0}
              title="Links"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Abstand zwischen Plays (Gap in mm)</Label>
          <Input
            type="number"
            value={options.gap}
            onChange={(e) => onUpdateOption("gap", Number(e.target.value))}
            className="h-8 text-xs"
            min={0}
          />
        </div>
        <SavePresetPopover options={options} />
      </div>
      {/* 
      <Separator />

      STYLE-EINSTELLUNGEN 

      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Style (Routen & Labels)
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Routen-Stärke</Label>
            <Input
              type="number"
              step={0.5}
              value={options.routeStrokeWidth || 2}
              onChange={(e) =>
                onUpdateOption("routeStrokeWidth", Number(e.target.value))
              }
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Textgröße (pt)</Label>
            <Input
              type="number"
              value={options.fontSize || 12}
              onChange={(e) =>
                onUpdateOption("fontSize", Number(e.target.value))
              }
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label className="text-xs cursor-pointer">
            Routen-Labels anzeigen
          </Label>
          <Switch
            checked={options.showLabels ?? true}
            onCheckedChange={(val) => onUpdateOption("showLabels", val)}
          />
        </div>
      </div>
    3. STYLE-EINSTELLUNGEN */}
    </div>
  );
}
