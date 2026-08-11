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
import type { Tag } from "@/types/interface";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

const tags = [
  { id: "offense", label: "Short Yard", color: "#3b82f6" }, // Blau
  { id: "defense", label: "Long Yard", color: "#22c55e" }, // Rot
  { id: "pass", label: "Redzone", color: "#f97316" }, // Orange
];

interface TagFilterInputProps {
  tags: Tag[];
}

export function TagFilterInput({ tags }: TagFilterInputProps) {
  const [selected, setSelected] = useState<string[]>([]);

  console.log(tags);

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

  return (
    <Tags className="w-75">
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
                {currentTag?.name}
              </div>
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
              <TagsItem key={tag.id} onSelect={handleSelect} value={tag.id}>
                {tag.name}
                {selected.includes(tag.id) && (
                  <CheckIcon className="text-muted-foreground" size={14} />
                )}
              </TagsItem>
            ))}
          </TagsGroup>
        </TagsList>
      </TagsContent>
    </Tags>
  );
}
