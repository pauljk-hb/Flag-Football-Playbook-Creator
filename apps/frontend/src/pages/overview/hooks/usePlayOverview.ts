import { api } from "@/api/client";
import type { Play } from "@/types/interface";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export type SortOption = "date-desc" | "date-asc" | "alpha-asc" | "alpha-desc";

export function usePlaybookOverview() {
  const navigate = useNavigate();

  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [filterTags, setFilterTags] = useState({
    offense: true,
    defense: true,
    pass: false,
    run: false,
  });

  useEffect(() => {
    async function loadPlays() {
      try {
        const data = await api.plays.getAll();
        setPlays(data);
      } catch (error) {
        console.error("Fehler beim Laden der Plays:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlays();
  }, []);

  const sortedAndFilteredPlays = useMemo(() => {
    const filtered = plays.filter((play) =>
      play.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      if (sortBy === "alpha-asc") return a.title.localeCompare(b.title);
      if (sortBy === "alpha-desc") return b.title.localeCompare(a.title);
      if (sortBy === "date-desc") {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      if (sortBy === "date-asc") {
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      }
      return 0;
    });
  }, [plays, searchQuery, sortBy]);

  const handleNewPlay = async () => {
    const newId = await api.plays.create();
    navigate(`/editor/${newId}`, { replace: true });
  };

  const onDelete = async (playId: string) => {
    try {
      await api.plays.delete(playId);
      setPlays((prev) => prev.filter((p) => p.id !== playId));
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  };

  return {
    plays: sortedAndFilteredPlays,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterTags,
    setFilterTags,
    handleNewPlay,
    onDelete,
  };
}
