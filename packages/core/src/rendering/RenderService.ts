import { FieldRenderer } from "@/entities/field/FieldRenderer";
import { PlayerRenderer } from "@/entities/player/PlayerRenderer";
import { RouteRenderer } from "@/entities/route/RouteRenderer";
import type { PlayModel } from "@/playModel/PlayModel";
import type { EventBus } from "@/services/events/EventBus";
import { CanvasManager } from "./canvas/CanvasManager";

export class RenderService {
  private canvasManager: CanvasManager;
  private fieldRenderer: FieldRenderer;
  private playerRenderers: Map<string, PlayerRenderer> = new Map();
  private routeRenderers: Map<string, RouteRenderer> = new Map();

  constructor(
    canvasElement: HTMLCanvasElement,
    private eventBus: EventBus,
    private playModel: PlayModel,
  ) {
    this.canvasManager = new CanvasManager(canvasElement);

    this.eventBus.on("play:updated", () => {
      this.syncPlay();
    });

    this.eventBus.on("selection:changed", (payload) =>
      this.handleSelectionVisually(payload.selectedIds),
    );

    this.eventBus.on("selection:cleared", () => this.hideAllControls());
  }

  /**
   * Die Haupt-Synchronisationsschleife.
   * Vergleicht den PlayState mit den aktuellen Renderern.
   */
  public syncPlay(): void {
    this.fieldRenderer.syncWithPreset(this.playModel.fieldPresetId);
    this.syncPlayers();
    this.syncRoutes();
    this.canvasManager.requestRender();
  }

  private syncPlayers(): void {
    const models = this.playModel.getAllPlayers();
    const currentModelIds = new Set(models.map((m) => m.id));

    models.forEach((playerModel) => {
      let renderer = this.playerRenderers.get(playerModel.id);

      if (!renderer) {
        renderer = new PlayerRenderer(this.canvasManager, this.eventBus);
        renderer.render(playerModel);
        this.playerRenderers.set(playerModel.id, renderer);
      } else {
        renderer.syncWithModel(playerModel);
      }
    });

    this.playerRenderers.forEach((renderer, id) => {
      if (!currentModelIds.has(id)) {
        renderer.destroy();
        this.playerRenderers.delete(id);
      }
    });
  }

  private syncRoutes(): void {
    const models = this.playModel.getAllRoutes();
    const currentModelIds = new Set(models.map((m) => m.id));

    models.forEach((routeModel) => {
      let renderer = this.routeRenderers.get(routeModel.id);

      if (!renderer) {
        renderer = new RouteRenderer(this.canvasManager, this.eventBus);
        renderer.render(routeModel);
        this.routeRenderers.set(routeModel.id, renderer);
      } else {
        renderer.syncWithModel(routeModel);
      }
    });

    this.routeRenderers.forEach((renderer, id) => {
      if (!currentModelIds.has(id)) {
        renderer.destroy();
        this.routeRenderers.delete(id);
      }
    });
  }

  private hideAllControls(): void {
    this.playerRenderers.forEach((r) => r.hideControls());
    this.routeRenderers.forEach((r) => r.hideControls());
    this.canvasManager.requestRender();
  }

  private handleSelectionVisually(selectedIds: string[]): void {
    this.hideAllControls();

    selectedIds.forEach((id) => {
      const routeRenderer = this.routeRenderers.get(id);
      if (routeRenderer) routeRenderer.showControls();

      const playerRenderer = this.playerRenderers.get(id);
      if (playerRenderer) {
        playerRenderer.showControls();

        const playerRoutes = this.playModel.getRoutesFromPlayer(id);
        playerRoutes.forEach((route) => {
          this.routeRenderers.get(route.id)?.showControls();
        });
      }
    });

    this.canvasManager.requestRender();
  }

  /**
   * Wird aufgerufen (z.B. vom SelectionService), um die Z-Indizes zu sichern
   * Spieler müssen immer über den Routen liegen.
   */
  public enforceLayering(): void {
    this.routeRenderers.forEach((r) =>
      this.canvasManager.sendToBack(r.getFabricObject()),
    );
    this.playerRenderers.forEach((p) =>
      this.canvasManager.bringToFront(p.getFabricObject()),
    );
    this.canvasManager.requestRender();
  }
}
