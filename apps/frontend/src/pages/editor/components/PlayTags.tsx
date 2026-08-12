import { api } from "@/api/client";
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
import type { Play, Tag } from "@/types/interface";
import { CheckIcon, PlusIcon, Pencil } from "lucide-react";
import { useEffect, useState } from "react";

interface PlayTagsProps {
  play: Play;
}

export function PlayTags({ play }: PlayTagsProps) {
  const initialSelectedIds = play.tags?.map((t) => t.id) || [];

  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [newTag, setNewTag] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaybookTags() {
      setIsLoading(true);
      try {
        const fetchedTags = await api.tags.getAllByPlaybook(play.playbookId);
        setTags(fetchedTags);
      } catch (error) {
        console.error("Fehler beim Laden der Playbook-Tags:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (play.playbookId) {
      fetchPlaybookTags();
    }
  }, [play.playbookId]);

  const handleRemove = async (tagId: string) => {
    if (!selected.includes(tagId)) return;

    try {
      await api.plays.removeTag(play.id, tagId);
      setSelected((prev) => prev.filter((id) => id !== tagId));
    } catch (error) {
      console.error("Fehler beim Entfernen des Tags:", error);
    }
  };

  const handleSelect = async (tagId: string) => {
    try {
      if (selected.includes(tagId)) {
        await api.plays.removeTag(play.id, tagId);
        setSelected((prev) => prev.filter((id) => id !== tagId));
      } else {
        await api.plays.addTag(play.id, tagId);
        setSelected((prev) => [...prev, tagId]);
      }
    } catch (error) {
      console.error("Fehler beim Verknüpfen des Tags:", error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;

    try {
      const createdTag = await api.tags.create(play.playbookId, play.id, {
        name: newTag.trim(),
        color: "#71717a",
      });

      setTags((prev) => [...prev, createdTag]);
      setSelected((prev) => [...prev, createdTag.id]);
      setNewTag("");
    } catch (error) {
      console.error("Fehler beim Erstellen des Tags:", error);
    }
  };

  const handleEdit = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    e.preventDefault();
    // Hier später den Color-Picker aufrufen und api.tags.update(tagId, { color: ... }) feuern
  };

  return (
    <Tags className="w-full">
      <TagsTrigger>
        {selected.map((tag) => {
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
