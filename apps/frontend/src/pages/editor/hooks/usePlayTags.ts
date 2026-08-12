import { api } from "@/api/client";
import type { Play, Tag } from "@/types/interface";
import { useEffect, useState } from "react";

export function usePlayTags(play: Play) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    play.tags?.map((t) => t.id) || [],
  );
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  useEffect(() => {
    async function loadTags() {
      if (!play.playbookId) return;
      setIsLoadingTags(true);
      try {
        const fetchedTags = await api.tags.getAllByPlaybook(play.playbookId);
        setAllTags(fetchedTags);
      } catch (error) {
        console.error("Fehler beim Laden der Playbook-Tags:", error);
      } finally {
        setIsLoadingTags(false);
      }
    }
    loadTags();
  }, [play.playbookId]);

  const toggleTag = async (tagId: string) => {
    try {
      if (selectedIds.includes(tagId)) {
        await api.plays.removeTag(play.id, tagId);
        setSelectedIds((prev) => prev.filter((id) => id !== tagId));
      } else {
        await api.plays.addTag(play.id, tagId);
        setSelectedIds((prev) => [...prev, tagId]);
      }
    } catch (error) {
      console.error("Fehler beim Toggeln des Tags:", error);
    }
  };

  const removeTag = async (tagId: string) => {
    if (!selectedIds.includes(tagId)) return;
    try {
      await api.plays.removeTag(play.id, tagId);
      setSelectedIds((prev) => prev.filter((id) => id !== tagId));
    } catch (error) {
      console.error("Fehler beim Entfernen des Tags:", error);
    }
  };

  const createNewTag = async (name: string) => {
    if (!name.trim()) return null;
    try {
      const newTag = await api.tags.create(play.playbookId, play.id, {
        name: name.trim(),
        color: "#71717a",
      });

      setAllTags((prev) => [...prev, newTag]);
      setSelectedIds((prev) => [...prev, newTag.id]);
      return newTag;
    } catch (error) {
      console.error("Fehler beim Erstellen des Tags:", error);
      return null;
    }
  };

  const updateTag = (updatedTag: Tag) => {
    setAllTags((prev) =>
      prev.map((t) => (t.id === updatedTag.id ? updatedTag : t)),
    );
  };

  return {
    selectedIds,
    allTags,
    isLoadingTags,
    toggleTag,
    removeTag,
    createNewTag,
    updateTag,
  };
}
