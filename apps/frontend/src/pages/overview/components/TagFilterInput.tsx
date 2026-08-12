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
import { CheckIcon, Pencil } from "lucide-react";
import { usePlaybookOverview } from "../hooks/usePlayOverview";
import type { Tag } from "@/types/interface";

interface TagFilterInputProps {
  tags: Tag[];
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
}
export function TagFilterInput({
  tags,
  selectedTags,
  setSelectedTags,
}: TagFilterInputProps) {
  const handleRemove = (value: string) => {
    if (!selectedTags.includes(value)) return;
    setSelectedTags((prev) => prev.filter((v) => v !== value));
  };

  const handleSelect = (value: string) => {
    if (selectedTags.includes(value)) {
      handleRemove(value);
      return;
    }
    setSelectedTags((prev) => [...prev, value]);
  };

  return (
    <Tags className="w-75">
      <TagsTrigger>
        {selectedTags.map((tag) => {
          const currentTag = tags.find((t) => t.id === tag);

          return (
            <TagsValue
              key={tag}
              onRemove={() => handleRemove(tag)}
              style={
                currentTag?.color
                  ? { backgroundColor: `${currentTag.color}40` }
                  : undefined
              }
            >
              {currentTag?.name}
            </TagsValue>
          );
        })}
      </TagsTrigger>
      <TagsContent>
        <TagsInput placeholder="Search tag..." />
        <TagsList>
          <TagsEmpty />
          <TagsGroup>
            {tags.map((tag) => (
              <TagsItem
                key={tag.id}
                onSelect={() => handleSelect(tag.id)}
                value={tag.name}
                className="group"
              >
                {/* 3. VISUELL: Flex-Container für sauberes Layout (Farbe, Text, Icons) */}
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </div>

                  <div className="flex items-center gap-1 ml-auto">
                    {/* EDIT BUTTON (Sichtbar beim Hovern über die Zeile) */}
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted-foreground/10 rounded transition-all text-muted-foreground hover:text-foreground">
                      <Pencil size={14} />
                    </button>

                    {/* STANDARD CHECK ICON VON KIBO */}
                    {selectedTags.includes(tag.id) && (
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
