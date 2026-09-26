import { MovePlayerCommand } from "@/commands/player/MovePlayerCommand";
import { AddRouteCommand } from "@/commands/route/AddRouteCommand";
import { MoveRouteNodeCommand } from "@/commands/route/MoveRouteNodeCommand";
import type { PlayModel } from "@/playModel/PlayModel";
import type { EventBus } from "@/services/events/EventBus";
import type { HistoryService } from "@/services/history/HistoryService";
import type { SelectionItem } from "@/types/interfaces";
import type { PlaybookEngine } from "./PlaybookEngine";

export function setupEngineListeners(
  engine: PlaybookEngine,
  eventBus: EventBus,
  playModel: PlayModel,
  historyService: HistoryService,
): void {
  eventBus.on("selection:changed", (payload: { items: SelectionItem[] }) => {
    engine.currentSelection = payload.items;
  });

  eventBus.on("selection:cleared", () => {
    engine.currentSelection = [];
  });

  eventBus.on("player:moved", (payload) => {
    const command = new MovePlayerCommand(
      playModel,
      payload.playerId,
      payload.startX,
      payload.startY,
      payload.endX,
      payload.endY,
    );
    historyService.execute(command);
  });

  eventBus.on("route:drawn", (payload) => {
    const command = new AddRouteCommand(
      playModel,
      payload.playerId,
      payload.routeType,
      payload.nodes,
    );
    historyService.execute(command);
    engine.setMode("EDITOR");
  });

  eventBus.on("route:modified", (payload) => {
    const command = new MoveRouteNodeCommand(
      playModel,
      payload.routeId,
      payload.oldNodes,
      payload.newNodes,
    );
    historyService.execute(command);
  });
}
