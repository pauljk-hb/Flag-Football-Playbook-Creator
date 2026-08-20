import { api } from "@/api/client";
import { useSession } from "@/lib/auth-client";
import type { ExtendedUser, SelectedPlayItem } from "@/types/interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useExportSettings } from "./useExportSettings";

export function useExportData() {
  const { data: session } = useSession();

  const [allPlays, setAllPlays] = useState<SelectedPlayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlayIds = useExportSettings((state) => state.selectedPlayIds);
  const setSelectedPlayIds = useExportSettings(
    (state) => state.setSelectedPlayIds,
  );

  const fetchPlays = useCallback(async () => {
    setIsLoading(true);
    try {
      const playbooks = await api.playbooks.getAll();

      if (!playbooks || playbooks.length === 0) {
        console.log("User hat keine Playbooks mehr.");
        return;
      }

      const user = session?.user
        ? (session.user as typeof session.user & ExtendedUser)
        : undefined;

      const currentPlaybookId = user?.lastPlaybookId || playbooks[0].id;
      const data = await api.plays.getAllByPlaybook(currentPlaybookId);
      if (data) {
        const mappedPlays: SelectedPlayItem[] = data.map((play) => ({
          id: play.id,
          title: play.name,
          description: play.description || undefined,
          thumbnail: play.thumbnail || "",
          data: play.canvasData,
          tags: play.tags,
        }));

        setAllPlays(mappedPlays);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Plays:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchPlays();
  }, [fetchPlays]);

  const selectedPlays = useMemo(() => {
    const playMap = new Map(allPlays.map((p) => [p.id, p]));
    return selectedPlayIds
      .map((id) => playMap.get(id))
      .filter((p): p is SelectedPlayItem => Boolean(p));
  }, [selectedPlayIds, allPlays]);

  const updateSelectedPlays = (
    updaterOrValue:
      | SelectedPlayItem[]
      | ((prev: SelectedPlayItem[]) => SelectedPlayItem[]),
  ) => {
    if (typeof updaterOrValue === "function") {
      const newPlays = updaterOrValue(selectedPlays);
      setSelectedPlayIds(newPlays.map((p) => p.id));
    } else {
      setSelectedPlayIds(updaterOrValue.map((p) => p.id));
    }
  };

  return {
    allPlays,
    selectedPlays,
    isLoading,
    refreshData: fetchPlays,
    updateSelectedPlays,
  };
}
