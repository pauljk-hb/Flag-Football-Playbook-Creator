import { useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { SortablePlayCard } from "./SortablePlayCard";
import type { PDFExportOptions, SelectedPlayItem } from "@/types/interface";

interface ExportPageListProps {
  plays: SelectedPlayItem[];
  onPlaysChange: (
    updaterOrValue:
      | SelectedPlayItem[]
      | ((prev: SelectedPlayItem[]) => SelectedPlayItem[]),
  ) => void;
  onRemovePlay: (id: string) => void;
  options: PDFExportOptions;
}

export function ExportPageList({
  plays,
  onPlaysChange,
  onRemovePlay,
  options,
}: ExportPageListProps) {
  const previousPlays = useRef<SelectedPlayItem[]>(plays);

  const playsPerPage = options.columns * options.rows || 1;

  // Plays visuell in Seiten-Pakete aufteilen
  const pages: SelectedPlayItem[][] = [];
  for (let i = 0; i < plays.length; i += playsPerPage) {
    pages.push(plays.slice(i, i + playsPerPage));
  }

  if (plays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground h-full min-h-[300px]">
        <p className="text-sm font-medium">Noch keine Plays ausgewählt</p>
        <p className="text-xs mt-1">
          Klicke oben auf &quot;Plays auswählen&quot;, um zu beginnen.
        </p>
      </div>
    );
  }

  return (
    <DragDropProvider
      onDragStart={() => {
        // Backup machen, bevor das Umsortieren beginnt
        previousPlays.current = plays;
      }}
      onDragOver={(event) => {
        const { source, target } = event.operation;

        // Sobald wir über einer ANDEREN Kachel schweben -> SOFORT im State umsortieren
        if (source && target && source.id !== target.id) {
          onPlaysChange((currentPlays) => {
            const oldIndex = currentPlays.findIndex((p) => p.id === source.id);
            const newIndex = currentPlays.findIndex((p) => p.id === target.id);

            if (oldIndex === -1 || newIndex === -1) return currentPlays;

            const newPlays = [...currentPlays];
            const [movedPlay] = newPlays.splice(oldIndex, 1);
            newPlays.splice(newIndex, 0, movedPlay);
            return newPlays;
          });
        }
      }}
      onDragEnd={(event) => {
        // Falls das Draggen abgebrochen wurde, alten Zustand wiederherstellen
        if (event.canceled) {
          onPlaysChange(previousPlays.current);
        }
      }}
    >
      <div className="flex justify-center py-8">
        <div className="space-y-8">
          {pages.map((pagePlays, pageIdx) => {
            const startIndex = pageIdx * playsPerPage;

            return (
              <div key={pageIdx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Seite {pageIdx + 1}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    ({pagePlays.length} / {playsPerPage} Plays)
                  </span>
                </div>

                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${options.columns}, minmax(0, 200px))`,
                  }}
                >
                  {/* Vorhandene Plays */}
                  {pagePlays.map((play, localIndex) => (
                    <SortablePlayCard
                      key={play.id}
                      play={play}
                      index={startIndex + localIndex}
                      onRemove={onRemovePlay}
                    />
                  ))}

                  {/* Platzhalter für unvollständige Seiten */}
                  {Array.from({ length: playsPerPage - pagePlays.length }).map(
                    (_, i) => (
                      <div
                        key={`empty-slot-${i}`}
                        className="flex flex-col rounded-lg border border-dashed border-input bg-muted/10 opacity-60"
                      >
                        {/* Header-Dummy zur Höhen-Angleichung */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-dashed border-input">
                          <span className="text-[11px] font-medium text-muted-foreground/60 select-none">
                            Freier Slot
                          </span>
                        </div>

                        {/* 4:3 Bildbereich-Dummy */}
                        <div className="w-full aspect-[4/3] flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground/40 font-mono select-none">
                            Leer
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DragDropProvider>
  );
}
