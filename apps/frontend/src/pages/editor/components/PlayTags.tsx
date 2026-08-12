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
import { TagPopoverEditor } from "@/components/TagPopoverEditor";
import type { Play } from "@/types/interface";
import { CheckIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { usePlayTags } from "../hooks/usePlayTags";

interface PlayTagsProps {
  play: Play;
}

export function PlayTags({ play }: PlayTagsProps) {
  const {
    selectedIds,
    allTags,
    isLoadingTags,
    toggleTag,
    removeTag,
    createNewTag,
    updateTag,
  } = usePlayTags(play);

  const [newTagInput, setNewTagInput] = useState("");

  if (isLoadingTags) {
    return <p>Laden</p>;
  }

  return (
    <Tags className="w-full">
      <TagsTrigger>
        {selectedIds.map((tag) => {
          const currentTag = allTags.find((t) => t.id === tag);

          return (
            <TagsValue
              key={tag}
              onRemove={() => removeTag(tag)}
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
        <TagsInput
          onValueChange={setNewTagInput}
          placeholder="Search or create tag..."
        />
        <TagsList>
          <TagsEmpty>
            <button
              className="mx-auto flex cursor-pointer items-center gap-2 py-1"
              onClick={() => createNewTag(newTagInput)}
              type="button"
            >
              <PlusIcon className="text-muted-foreground" size={14} />
              Create new tag: "{newTagInput}"
            </button>
          </TagsEmpty>

          <TagsGroup>
            {allTags.map((tag) => (
              <TagsItem
                key={tag.id}
                onSelect={() => toggleTag(tag.id)}
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
                        updateTag(updatedTag);
                      }}
                    />

                    {selectedIds.includes(tag.id) && (
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
