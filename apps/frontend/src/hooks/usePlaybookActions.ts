import type { ThumbnailOptions } from "@/types/interface";
import { ROUTE_PRESETS } from "@playbook/core";
import { SYSTEM_PLAYERS } from "@playbook/core/dist/data/presets/players";
import { usePlaybook } from "./usePlaybook";

export function usePlaybookActions() {
  const { engine } = usePlaybook();

  const addPlayer = {
    qb: () => {
      addPlayerFromPreset("QB");
    },
    center: () => {
      addPlayerFromPreset("CENTER");
    },
    wr1: () => {
      addPlayerFromPreset("WR1");
    },
    wr2: () => {
      addPlayerFromPreset("WR2");
    },
    red: () => {
      addPlayerFromPreset("RED");
    },
  };

  const addRoute = {
    quickOut: (routeType: string = "default") => {
      handleAssignRoute("QUICK_OUT", routeType);
    },
    slant: (routeType: string = "default") => {
      handleAssignRoute("SLANT", routeType);
    },
    comeBack: (routeType: string = "default") => {
      handleAssignRoute("COMEBACK", routeType);
    },
    hitch: (routeType: string = "default") => {
      handleAssignRoute("HITCH", routeType);
    },
    out: (routeType: string = "default") => {
      handleAssignRoute("OUT", routeType);
    },
    in: (routeType: string = "default") => {
      handleAssignRoute("IN", routeType);
    },
    corner: (routeType: string = "default") => {
      handleAssignRoute("CORNER", routeType);
    },
    post: (routeType: string = "default") => {
      handleAssignRoute("POST", routeType);
    },
    go: (routeType: string = "default") => {
      handleAssignRoute("GO", routeType);
    },
    over: (routeType: string = "default") => {
      handleAssignRoute("OVER", routeType);
    },
    under: (routeType: string = "default") => {
      handleAssignRoute("UNDER", routeType);
    },
    weel: (routeType: string = "default") => {
      handleAssignRoute("WEEL", routeType);
    },
  };

  const applyFormation = {
    emptyLeft: () => {
      loadFormation("EMPTY_LEFT");
    },
    emptyRight: () => {
      loadFormation("EMPTY_RIGHT");
    },
    towerLeft: () => {
      loadFormation("TOWER_LEFT");
    },
    towerRight: () => {
      loadFormation("TOWER_RIGHT");
    },
    coverLeft: () => {
      loadFormation("COVER_LEFT");
    },
    coverRight: () => {
      loadFormation("COVER_RIGHT");
    },
    tripsLeft: () => {
      loadFormation("TRIPS_LEFT");
    },
    tripsRight: () => {
      loadFormation("TRIPS_RIGHT");
    },
    shotgunLeft: () => {
      loadFormation("SHOTGUN_LEFT");
    },
    shotgunRight: () => {
      loadFormation("SHOTGUN_RIGHT");
    },
  };

  const history = {
    undo: () => {
      if (!engine) return;
      engine.undo();
    },
    redo: () => {
      if (!engine) return;
      engine.redo();
    },
  };

  const play = {
    exportCanvasJSON: (): string => {
      if (!engine) return "";
      return engine.exportPlay();
    },
    exportThumbnail: (options?: ThumbnailOptions): string => {
      if (!engine) return "";
      return engine.generateThumbnail(options);
    },
  };

  const getAllPLays = () => {};

  const addPlayerFromPreset = (presetId: string) => {
    try {
      const preset = SYSTEM_PLAYERS[presetId];
      if (!preset || !engine) return;
      engine.addPlayer({
        x: 200,
        y: 300,
        label: preset.label,
        color: preset.color,
        shape: preset.shape,
      });
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Spielers:", error);
    }
  };

  const handleAssignRoute = (routeId: string, routeType: string) => {
    if (!engine) return;
    try {
      engine.addRouteFromPreset(ROUTE_PRESETS[routeId], routeType);
    } catch (error) {
      console.warn(
        "Konnte Route nicht zuweisen. Ist ein Spieler markiert?",
        error,
      );
    }
  };

  const loadFormation = (formationId: string) => {
    if (!engine) return;
    engine.loadFormation(formationId);
  };

  return {
    play,
    addPlayer,
    addRoute,
    applyFormation,
    history,
    getAllPLays,
  };
}
