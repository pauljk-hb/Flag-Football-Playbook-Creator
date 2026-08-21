import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import { usePlaybookStore } from "@/hooks/useAppStore";
import type { PlayerStylePreset } from "@/types/interface";
import { Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const TAG_COLORS = [
  "#1a1b1b",
  "#ef4444",
  "#326FB5",
  "#3399B5",
  "#469b54",
  "#E63D38",
  "#f59e0b",
  "#8b5cf6",
];

export function PlaystyleTab() {
  const playbookId = usePlaybookStore((state) => state.activePlaybookId);
  const [presets, setPresets] = useState<PlayerStylePreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadPresets = useCallback(async () => {
    if (!playbookId) return;
    setIsLoading(true);
    try {
      const data = await api.presets.playerStyles.getByPlaybook(playbookId);
      setPresets(data || []);
    } catch (error) {
      console.error("Fehler beim Laden der Player-Styles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [playbookId]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleChange = (
    playerId: string,
    field: keyof PlayerStylePreset,
    value: any,
  ) => {
    setPresets((prev) =>
      prev.map((p) => (p.playerId === playerId ? { ...p, [field]: value } : p)),
    );
  };

  const handleSave = async (preset: PlayerStylePreset) => {
    setSavingId(preset.playerId);
    try {
      await api.presets.playerStyles.upsert(playbookId as string, {
        playerId: preset.playerId,
        label: preset.label,
        color: preset.color,
        shape: preset.shape,
        showLabels: preset.showLabels ?? true,
      });
      // Optional: Feedback geben oder neu laden
    } catch (error) {
      console.error("Fehler beim Speichern des Player-Styles:", error);
    } finally {
      setSavingId(null);
    }
  };

  if (isLoading) {
    return (
      <TabsContent
        value="playstyle"
        className="space-y-6 px-6 py-4 outline-none flex justify-center items-center h-40"
      >
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </TabsContent>
    );
  }

  return (
    <TabsContent value="playstyle" className="space-y-6 px-6 py-4 outline-none">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Spieler-Objekt-Styles</h3>
          <p className="text-xs text-muted-foreground">
            Passe Aussehen, Kürzel und Formen der Spieler für dieses Playbook
            an.
          </p>
        </div>

        <div className="space-y-4">
          {presets.map((preset) => (
            <div
              key={preset.playerId}
              className="p-3 rounded-lg border border-muted-foreground text-card-foreground space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Rolle: {preset.playerId}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5"
                  onClick={() => handleSave(preset)}
                  disabled={savingId === preset.playerId}
                >
                  {savingId === preset.playerId && (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  )}
                  Speichern
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Label / Kürzel */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Label (Anzeige)
                  </Label>
                  <Input
                    value={preset.label}
                    onChange={(e) =>
                      handleChange(preset.playerId, "label", e.target.value)
                    }
                    className="h-8 text-xs"
                    maxLength={5}
                  />
                </div>

                {/* Form (Circle / Square) */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Form
                  </Label>
                  <select
                    value={preset.shape}
                    onChange={(e) =>
                      handleChange(
                        preset.playerId,
                        "shape",
                        e.target.value as "circle" | "square",
                      )
                    }
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="circle">Kreis (Circle)</option>
                    <option value="square">Viereck (Square)</option>
                  </select>
                </div>
              </div>

              {/* Farbauswahl */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">
                  Farbe
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleChange(preset.playerId, "color", c)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        preset.color === c
                          ? " ring-1 ring-offset-1 ring-foreground"
                          : ""
                      }`}
                      style={{ backgroundColor: c }}
                      type="button"
                    >
                      {preset.color === c && (
                        <Check className="text-white w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label anzeigen Toggle */}
              <div className="flex items-center justify-between pt-1">
                <Label className="text-[11px] text-muted-foreground cursor-pointer">
                  Label im Spielzug anzeigen
                </Label>
                <Switch
                  checked={preset.showLabels ?? true}
                  onCheckedChange={(val) =>
                    handleChange(preset.playerId, "showLabels", val)
                  }
                />
              </div>
            </div>
          ))}

          {presets.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Keine Spieler-Presets für dieses Playbook gefunden.
            </p>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
