import { api } from "@/api/client";
import type { Play, Tag } from "@/types/interface";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export type SortOption = "date-desc" | "date-asc" | "alpha-asc" | "alpha-desc";

export function usePlaybookOverview() {
  const navigate = useNavigate();

  const [activePlaybookId, setActivePlaybookId] = useState<string | null>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  useEffect(() => {
    async function initializeDashboard() {
      setIsLoading(true);
      try {
        let playbooks = await api.playbooks.getAll();
        let currentPlaybookId: string | undefined;

        if (!playbooks || playbooks.length === 0) {
          console.log("Kein Playbook gefunden. Erstelle Standard-Playbook...");
          const newPlaybook = await api.playbooks.create({
            name: "Mein Playbook",
            description: "Mein erstes Playbook",
          });
          currentPlaybookId = newPlaybook.id;
        }

        if (playbooks && playbooks.length > 0) {
          currentPlaybookId = playbooks[0].id;
        }

        if (!currentPlaybookId) return;
        setActivePlaybookId(currentPlaybookId);

        const playsData = await api.plays.getAllByPlaybook(currentPlaybookId);
        setPlays(playsData);
        const tags = await api.tags.getAllByPlaybook(currentPlaybookId);
        setTags(tags);
      } catch (error) {
        console.error("Fehler beim Laden der Plays:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeDashboard();
  }, []);

  const sortedAndFilteredPlays = useMemo(() => {
    const filtered = plays.filter((play) => {
      const matchesName = play.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesTag =
        !selectedTags || selectedTags.length === 0
          ? true
          : !!play.tags?.some(
              (tag) =>
                selectedTags.includes(tag.id) ||
                selectedTags.includes(tag.name),
            );

      return matchesName && matchesTag;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "alpha-asc") return a.name.localeCompare(b.name);
      if (sortBy === "alpha-desc") return b.name.localeCompare(a.name);
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
  }, [plays, searchQuery, selectedTags, sortBy]);

  const handleNewPlay = async () => {
    if (!activePlaybookId) return;
    try {
      const newPlay = await api.plays.create(activePlaybookId, {
        name: "Neues Play",
        canvasData: null,
      });

      navigate(`/editor/${newPlay.id}`, { replace: true });
    } catch (error) {
      console.error("Fehler beim Erstellen eines neuen Plays:", error);
    }
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
    tags,
    setTags,
    selectedTags,
    setSelectedTags,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    handleNewPlay,
    onDelete,
  };
}
