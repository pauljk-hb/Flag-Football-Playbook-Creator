import type { SelectedPlayItem, Tag } from "@/types/interface";
import { useMemo, useState } from "react";

export function usePlayFilter(allPlays: SelectedPlayItem[]) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    allPlays.forEach((play) => {
      play.tags?.forEach((tag) => {
        if (!tagMap.has(tag.id)) tagMap.set(tag.id, tag);
      });
    });
    return Array.from(tagMap.values());
  }, [allPlays]);

  const filteredPlays = useMemo(() => {
    return allPlays.filter((play) => {
      const matchesName = play.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesTag =
        selectedTags.length === 0
          ? true
          : !!play.tags?.some(
              (tag) =>
                selectedTags.includes(tag.id) ||
                selectedTags.includes(tag.name),
            );

      return matchesName && matchesTag;
    });
  }, [allPlays, search, selectedTags]);

  const resetFilters = () => {
    setSearch("");
    setSelectedTags([]);
  };

  return {
    search,
    setSearch,
    selectedTags,
    setSelectedTags,
    availableTags,
    filteredPlays,
    resetFilters,
  };
}
