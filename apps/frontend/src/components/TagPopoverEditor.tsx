import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, CheckIcon, Loader2 } from "lucide-react";
import type { Tag } from "@/types/interface";
import { api } from "@/api/client";

const TAG_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#71717a",
];

interface TagPopoverEditorProps {
  tag: Tag;
  onSuccess: (updatedTag: Tag) => void;
}

export function TagPopoverEditor({ tag, onSuccess }: TagPopoverEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color || "#71717a");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setName(tag.name);
      setColor(tag.color || "#71717a");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const updatedTag = await api.tags.update(tag.id, {
        name: name.trim(),
        color: color,
      });
      onSuccess(updatedTag);
      setIsOpen(false);
    } catch (error) {
      console.error("Fehler beim Aktualisieren:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted-foreground/10 rounded transition-all text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Pencil size={14} />
          </button>
        }
      />

      <PopoverContent
        className="w-64 p-4 z-100"
        align="end"
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Farbe
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation();
                    setColor(c);
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    color === c ? "ring-2 ring-offset-2 ring-foreground" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  type="button"
                >
                  {color === c && <CheckIcon className="text-white w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            disabled={isSaving || !name.trim()}
            className="w-full h-8 text-sm"
          >
            {isSaving ? (
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            ) : null}
            Speichern
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
