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
import { CheckIcon } from "lucide-react";
import type { Tag } from "@/types/interface";
import { TagPopoverEditor } from "@/components/TagPopoverEditor";

interface TagFilterInputProps {
  tags: Tag[];
  setTags: React.Dispatch<React.SetStateAction<Tag[]>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
}
export function TagFilterInput({
  tags,
  setTags,
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
                    <TagPopoverEditor
                      tag={tag}
                      onSuccess={(updatedTag) => {
                        setTags((prev) =>
                          prev.map((t) =>
                            t.id === updatedTag.id ? updatedTag : t,
                          ),
                        );
                      }}
                    />

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
