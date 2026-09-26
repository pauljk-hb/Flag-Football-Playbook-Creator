export interface PublicPlaybookEventMap {
  "history:changed": { canUndo: boolean; canRedo: boolean };

  "system:notification": {
    level: "info" | "success" | "warning" | "error";
    message: string;
    code?: string;
  };
  "system:mode_changed": { mode: "DEFAULT" | "DRAW" | "READ_ONLY" };

  "selection:changed": { selectedIds: string[] };
}

export interface PrivatePlaybookEventMap {
  "player:moved": {
    playerId: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  "player:selected": { playerId: string };

  "route:drawn": { playerId: string; nodes: RouteNode[] };
  "route:modified": {
    routeId: string;
    oldNodes: RouteNode[];
    newNodes: RouteNode[];
  };
  "route:selected": { routeId: string };

  "canvas:clicked": { x: number; y: number };
  "selection:cleared": undefined;

  "play:updated": { playState: PlayState };
  "play:loaded": { playState: PlayState };
}

export type PlaybookEventMap = PublicPlaybookEventMap & PrivatePlaybookEventMap;
