import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TagFilterInput } from "@/pages/overview/components/TagFilterInput";
import { useEffect, useState } from "react";
import type { SelectedPlayItem } from "../../../types/interface";
import { usePlayFilter } from "../hooks/usePlayFilter";

interface PlaySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allPlays: SelectedPlayItem[];
  selectedPlays: SelectedPlayItem[];
  isLoading: boolean;
  onConfirm: (plays: SelectedPlayItem[]) => void;
}

export function PlaySelectionDialog({
  open,
  onOpenChange,
  allPlays,
  selectedPlays,
  isLoading,
  onConfirm,
}: PlaySelectionDialogProps) {
  const [tempSelected, setTempSelected] = useState<SelectedPlayItem[]>([]);

  const {
    search,
    setSearch,
    selectedTags,
    setSelectedTags,
    availableTags,
    filteredPlays,
    resetFilters,
  } = usePlayFilter(allPlays);

  useEffect(() => {
    if (open) {
      setTempSelected(selectedPlays);
      resetFilters();
    }
  }, [open, selectedPlays]);

  const toggleSelect = (play: SelectedPlayItem) => {
    setTempSelected((prev) =>
      prev.some((p) => p.id === play.id)
        ? prev.filter((p) => p.id !== play.id)
        : [...prev, play],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-9/12 h-11/12 bg-muted">
        <DialogHeader>
          <DialogTitle>Plays für den Export auswählen</DialogTitle>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Spielzüge durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <div className="md:w-80 lg:w-110">
              <TagFilterInput
                tags={availableTags}
                setTags={() => {}}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-1 min-h-75">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Lade Spielzüge...
            </div>
          ) : filteredPlays.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Keine Spielzüge gefunden.
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
              {filteredPlays.map((play) => {
                const isChecked = tempSelected.some((p) => p.id === play.id);

                return (
                  <div
                    key={play.id}
                    onClick={() => toggleSelect(play)}
                    className={`flex flex-col border rounded-lg p-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-xs truncate pr-2">
                        {play.title}
                      </span>
                      <Checkbox checked={isChecked} />
                    </div>
                    <div className=" h-36 w-full bg-background rounded flex items-center justify-center p-1 border pointer-events-none">
                      {play.thumbnail ? (
                        <img
                          src={play.thumbnail}
                          alt={play.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Kein Vorschaubild
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground font-medium">
            {tempSelected.length} {tempSelected.length === 1 ? "Play" : "Plays"}{" "}
            markiert
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={() => {
                onConfirm(tempSelected);
                onOpenChange(false);
              }}
            >
              Übernehmen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
