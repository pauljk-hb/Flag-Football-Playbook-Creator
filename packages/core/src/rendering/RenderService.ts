import { FieldRenderer } from "../entities/field/FieldRenderer";
import { PlayerRenderer } from "../entities/player/PlayerRenderer";
import { RouteRenderer } from "../entities/route/RouteRenderer";
import type { PlayModel } from "../playModel/PlayModel";
import type { EventBus } from "../services/events/EventBus";
import type { ThumbnailOptions } from "../types/export";
import type { SelectionItem } from "../types/system";
import { CanvasManager } from "./canvas/CanvasManager";
import { LayerManager } from "./canvas/LayerManager";

export class RenderService {
  private canvasManager: CanvasManager;
  private layerManager: LayerManager;

  private fieldRenderer!: FieldRenderer;
  private playerRenderers: Map<string, PlayerRenderer> = new Map();
  private routeRenderers: Map<string, RouteRenderer> = new Map();

  private currentSelection: SelectionItem[] = [];

  constructor(
    canvasElement: HTMLCanvasElement,
    private eventBus: EventBus,
    private playModel: PlayModel,
  ) {
    this.canvasManager = new CanvasManager(canvasElement);
    this.layerManager = new LayerManager(this.canvasManager);

    this.setupListeners();
  }

  private setupListeners(): void {
    this.eventBus.on("play:updated", () => {
      this.syncPlay();
      this.handleSelectionVisually(this.currentSelection);
    });

    this.eventBus.on("selection:changed", (items: SelectionItem[]) => {
      this.currentSelection = items;
      this.handleSelectionVisually(this.currentSelection);
    });

    this.eventBus.on("selection:cleared", () => {
      this.currentSelection = [];
      this.handleSelectionVisually(this.currentSelection);
    });
  }

  public resize(width: number): void {
    this.canvasManager.handleResize(width);
  }

  public generateThumbnail(options?: ThumbnailOptions): string {
    this.hideAllControls();
    return this.canvasManager.generateThumbnail(options);
  }

  public getRawCanvas() {
    return this.canvasManager.getRawCanvas();
  }

  public dispose(): void {
    this.canvasManager.dispose();
  }

  /**
   * Die Haupt-Synchronisationsschleife.
   * Vergleicht den PlayState mit den aktuellen Renderern.
   */
  private syncPlay(): void {
    this.syncField();
    this.syncPlayers();
    this.syncRoutes();

    this.layerManager.enforceLayering(
      this.fieldRenderer,
      this.routeRenderers,
      this.playerRenderers,
    );
  }

  private syncField(): void {
    const fieldModel = this.playModel.getField();

    if (!this.fieldRenderer) {
      this.fieldRenderer = new FieldRenderer(this.canvasManager);
      this.fieldRenderer.syncWithModel(fieldModel);
    } else {
      this.fieldRenderer.syncWithModel(fieldModel);
    }
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

  private handleSelectionVisually(selectedItems: SelectionItem[]): void {
    this.hideAllControls();

    selectedItems.forEach((item) => {
      switch (item.type) {
        case "ROUTE": {
          const routeRenderer = this.routeRenderers.get(item.id);
          if (routeRenderer) routeRenderer.showControls();
          break;
        }
        case "PLAYER": {
          const playerRenderer = this.playerRenderers.get(item.id);
          if (playerRenderer) {
            playerRenderer.showControls();

            const playerRoutes = this.playModel.getRoutesFromPlayer(item.id);
            playerRoutes.forEach((route) => {
              this.routeRenderers.get(route.id)?.showControls();
            });
          }
          break;
        }

        case "NODE": {
          if (item.parentId) {
            const routeRenderer = this.routeRenderers.get(item.parentId);
            if (routeRenderer) routeRenderer.showControls();
          }
          break;
        }
      }
    });
  }
}
