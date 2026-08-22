import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookmarkPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import type { PDFExportOptions } from "../../../types/interface";
import { useExportSettings } from "../hooks/useExportSettings";

interface SavePresetPopoverProps {
  options: PDFExportOptions;
}

export function SavePresetPopover({ options }: SavePresetPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fetchPresets = useExportSettings((state) => state.fetchPresets);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setName(options.playbookTitle || "Mein Preset");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      // Flaches DTO an das Backend senden (entsprechend der DB-Struktur)
      await api.presets.export.create({
        name: name.trim(),
        pageWidth: options.pageWidth ?? 297,
        pageHeight: options.pageHeight ?? 210,
        columns: options.columns ?? 3,
        rows: options.rows ?? 2,
        gap: options.gap ?? 0,
        marginTop: options.margin?.top ?? 10,
        marginRight: options.margin?.right ?? 10,
        marginBottom: options.margin?.bottom ?? 10,
        marginLeft: options.margin?.left ?? 10,
        routeStrokeWidth: options.routeStrokeWidth ?? 2,
        showLabels: options.showLabels ?? true,
        fontSize: options.fontSize ?? 12,
      } as any);

      // Presets neu laden, damit das neue direkt im Dropdown erscheint
      await fetchPresets();
      setIsOpen(false);
      setName("");
    } catch (error) {
      console.error("Fehler beim Speichern des Presets:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="w-full text-xs h-8 flex items-center justify-center gap-1.5 mt-2"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            Als neues Preset speichern
          </Button>
        }
      />

      <PopoverContent
        className="w-64 p-4 z-50"
        align="center"
        side="top"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Preset Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") handleSave();
              }}
              placeholder="z. B. 2x3 Wristband Offense"
              className="h-8 text-xs"
              autoFocus
            />
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={isSaving || !name.trim()}
            className="w-full h-8 text-xs"
          >
            {isSaving && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
            Speichern
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
