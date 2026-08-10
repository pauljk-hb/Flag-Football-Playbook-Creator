import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/kibo-ui/tags";
import { CheckIcon, PlusIcon, Pencil } from "lucide-react";
import { useState } from "react";

const defaultTags = [
  { id: "offense", label: "Short Yard", color: "#3b82f6" }, // Blau
  { id: "defense", label: "Long Yard", color: "#22c55e" }, // Rot
  { id: "pass", label: "Redzone", color: "#f97316" }, // Orange
];

export function PlayTags() {
  const [selected, setSelected] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");

  // 1. STATE: Einfach das Farbattribut hinzugefügt
  const [tags, setTags] =
    useState<{ id: string; label: string; color: string }[]>(defaultTags);

  const handleRemove = (value: string) => {
    if (!selected.includes(value)) {
      return;
    }
    console.log(`removed: ${value}`);
    setSelected((prev) => prev.filter((v) => v !== value));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      handleRemove(value);
      return;
    }
    console.log(`selected: ${value}`);
    setSelected((prev) => [...prev, value]);
  };

  const handleCreateTag = () => {
    console.log(`created: ${newTag}`);
    setTags((prev) => [
      ...prev,
      {
        id: newTag,
        label: newTag,
        color: "#71717a",
      },
    ]);
    setSelected((prev) => [...prev, newTag]);
    setNewTag("");
  };

  const handleEdit = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`Edit tag triggered for: ${tagId}`);
  };

  return (
    <Tags className="w-full">
      <TagsTrigger>
        {selected.map((tag) => {
          const currentTag = tags.find((t) => t.id === tag);

          return (
            <TagsValue key={tag} onRemove={() => handleRemove(tag)}>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: currentTag?.color || "#71717a" }}
                />
                {currentTag?.label}
              </div>
            </TagsValue>
          );
        })}
      </TagsTrigger>

      <TagsContent>
        <TagsInput
          onValueChange={setNewTag}
          placeholder="Search or create tag..."
        />
        <TagsList>
          <TagsEmpty>
            <button
              className="mx-auto flex cursor-pointer items-center gap-2 py-1"
              onClick={handleCreateTag}
              type="button"
            >
              <PlusIcon className="text-muted-foreground" size={14} />
              Create new tag: "{newTag}"
            </button>
          </TagsEmpty>

          <TagsGroup>
            {tags.map((tag) => (
              <TagsItem
                key={tag.id}
                onSelect={handleSelect}
                value={tag.id}
                className="group"
              >
                {/* 3. VISUELL: Flex-Container für sauberes Layout (Farbe, Text, Icons) */}
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.label}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    {/* EDIT BUTTON (Sichtbar beim Hovern über die Zeile) */}
                    <button
                      onClick={(e) => handleEdit(e, tag.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted-foreground/10 rounded transition-all text-muted-foreground hover:text-foreground"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* STANDARD CHECK ICON VON KIBO */}
                    {selected.includes(tag.id) && (
                      <CheckIcon className="text-muted-foreground" size={14} />
                    )}
                  </div>
                </div>
              </TagsItem>
            ))}
          </TagsGroup>
        </TagsList>
      </TagsContent>
    </Tags>
  );
}
