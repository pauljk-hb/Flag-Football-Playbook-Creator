import { usePlaybook } from "@/contexts/PlaybookContext";
import { SYSTEM_PLAYERS } from "@playbook/core/dist/data/presets/players";

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

  const deletePlayer = () => {
    if (!engine) return;
    engine.removeSelectedPlayer();
  };

  const addRoute = {
    quickOut: () => {
      handleAssignRoute("QUICK_OUT");
    },
    slant: () => {
      handleAssignRoute("SLANT");
    },
    comeBack: () => {
      handleAssignRoute("COMEBACK");
    },
    hitch: () => {
      handleAssignRoute("HITCH");
    },
    out: () => {
      handleAssignRoute("OUT");
    },
    in: () => {
      handleAssignRoute("IN");
    },
    corner: () => {
      handleAssignRoute("CORNER");
    },
    post: () => {
      handleAssignRoute("POST");
    },
    go: () => {
      handleAssignRoute("GO");
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
    load: () => {
      const jsonString = localStorage.getItem("PLay1");

      if (!jsonString) {
        alert("Kein Play gefunden!");
        return;
      }
      if (!engine) return;
      const success = engine.loadPlay(jsonString);
      if (!success) {
        alert("Fehler beim Laden (Daten korrupt).");
      }
    },
    save: () => {
      if (!engine) return;
      const jsonString = engine.savePlay("Mein erster Spielzug");

      localStorage.setItem("Play1", jsonString);
    },
  };

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

  const handleAssignRoute = (routeId: string) => {
    if (!engine) return;
    try {
      engine.assignRouteToSelectedPlayer(routeId);
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
    deletePlayer,
    addRoute,
    applyFormation,
    history,
  };
}
