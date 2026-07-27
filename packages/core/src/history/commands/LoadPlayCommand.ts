import type { ICommand } from "../../types/history";
import type { EntityManager } from "../../managers/EntityManager";
import type { FormationManager } from "../../managers/FormationManager";
import type { FieldManager } from "../../managers/FieldManager";
import type { CanvasManager } from "../../managers/CanvasManager";
import type { HistoryManager } from "../HistoryManager";
import type { SavedPlay } from "../../types/interfaces";
import type { PlayerEntity } from "../../entities/PlayerEntity";
import { RouteFactory } from "../../factories/RouteFactory";
import { AssignRouteCommand } from "./AssignRouteCommand";

export class LoadPlayCommand implements ICommand {
  private previousPlayers: PlayerEntity[] = [];
  private previousFieldPreset: string;

  constructor(
    private entityManager: EntityManager,
    private formationManager: FormationManager,
    private fieldManager: FieldManager,
    private canvasManager: CanvasManager,
    private history: HistoryManager,
    private playData: SavedPlay,
  ) {
    this.previousFieldPreset = this.fieldManager.getCurrentPresetId();
  }

  public execute(): void {
    if (this.previousPlayers.length === 0) {
      this.previousPlayers = this.formationManager.getAllPlayers();
    }

    this.previousPlayers.forEach((player) => {
      player.getFabricObjects().forEach((obj) => {
        this.canvasManager.remove(obj);
      });
      if (player.route) {
        player.route.getFabricObjects().forEach((obj) => {
          this.canvasManager.remove(obj);
        });
      }
    });

    this.formationManager.clearField();

    //this.fieldManager.drawField(this.playData.fieldPresetId);

    this.playData.players.forEach((savedPlayer) => {
      const playerEntity = this.entityManager.createPlayer(
        savedPlayer,
        (command) => this.history.execute(command),
      );

      playerEntity.getFabricObjects().forEach((obj) => {
        this.canvasManager.add(obj);
        this.canvasManager.bringObjectToFront(obj);
      });

      if (savedPlayer.route?.points) {
        const newRouteEntity = RouteFactory.createFromPoints(
          playerEntity.x,
          playerEntity.y,
          savedPlayer.route.points,
          playerEntity.color,
        );

        newRouteEntity.onCommandGenerated = (command) => {
          this.history.execute(command);
        };

        const command = new AssignRouteCommand(
          playerEntity,
          newRouteEntity,
          null, // oldRoute ist null, da der Spieler komplett neu ist
          this.canvasManager,
        );
        command.execute();
      }
    });
  }

  public undo(): void {
    const currentPlayers = this.formationManager.getAllPlayers();
    currentPlayers.forEach((player) => {
      player.getFabricObjects().forEach((obj) => {
        this.canvasManager.remove(obj);
      });
      if (player.route) {
        player.route.getFabricObjects().forEach((obj) => {
          this.canvasManager.remove(obj);
        });
      }
    });

    this.formationManager.clearField();

    this.fieldManager.drawField(this.previousFieldPreset);

    if (this.previousPlayers.length > 0) {
      this.formationManager.restorePlayers(this.previousPlayers);

      this.previousPlayers.forEach((player) => {
        player.getFabricObjects().forEach((obj) => {
          this.canvasManager.add(obj);
          this.canvasManager.bringObjectToFront(obj);
        });

        if (player.route) {
          player.route.getFabricObjects().forEach((obj) => {
            this.canvasManager.add(obj);
            this.canvasManager.sendToBack(obj);
          });
        }
      });
    }
  }
}
