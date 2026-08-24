import type { SelectedPlayItem } from "@/types/interface";
import { X, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";

interface SortablePlayCardProps {
  play: SelectedPlayItem;
  index: number;
  onRemove: (id: string) => void;
}

export function SortablePlayCard({
  play,
  index,
  onRemove,
}: SortablePlayCardProps) {
  const { ref, isDragging, handleRef } = useSortable({
    id: play.id,
    index,
    type: "play",
    accept: "play",
  });

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col rounded-md overflow-hidden transition-opacity ${
        isDragging ? "opacity-40 z-50" : "opacity-100"
      }`}
    >
      {/* 1. Header (Drag, Titel, Löschen) */}
      <div className="flex items-center justify-between gap-1 px-3 py-2 bg-muted">
        <div
          ref={handleRef}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <span className="text-xs font-semibold truncate flex-1 text-center">
          {play.title}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(play.id);
          }}
          className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
          title="Play entfernen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Bild (Strikt 4:3, kein extra Hintergrund/Rahmen) */}
      <div className="w-full aspect-[4/3] flex items-center justify-center overflow-hidden pointer-events-none">
        {play.thumbnail ? (
          <img
            src={play.thumbnail}
            alt={play.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full border border-dashed border-zinc-300 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground">Kein Bild</span>
          </div>
        )}
      </div>
    </div>
  );
}
