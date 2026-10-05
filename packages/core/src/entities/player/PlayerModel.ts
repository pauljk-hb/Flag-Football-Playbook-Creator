import type { PlayerDTO, PlayerStyle, Point2D } from "../../types/domain";
import type { ThemeConfig } from "../../types/system";
import { BaseModel } from "../base/BaseModel";

type PlayerConstructorPayload = Omit<PlayerDTO, "id"> & { id?: string };

export class PlayerModel extends BaseModel {
  public position: Point2D;
  public roleId: string;
  private playerStyle: PlayerStyle;
  private playerStyleOverride: Partial<PlayerStyle> = {};

  constructor(config: PlayerConstructorPayload, themeStyle: ThemeConfig) {
    super(config.id);
    this.position = config.position;
    this.roleId = config.roleId;
    this.playerStyle = themeStyle.playerRoles[config.roleId];
    this.playerStyleOverride = config.styleOverride || {};
  }

  public get style(): PlayerStyle {
    return {
      ...this.playerStyle,
      ...this.playerStyleOverride,
    };
  }

  public updateStyle(newOverrides: Partial<PlayerStyle>): void {
    this.playerStyleOverride = { ...this.playerStyleOverride, ...newOverrides };
  }

  public get color(): string {
    return this.playerStyleOverride.color ?? this.playerStyle.color;
  }

  public set color(newColor: string) {
    this.playerStyle.color = newColor;
    this.playerStyleOverride.color = newColor;
  }

  public get label(): string {
    return this.playerStyleOverride.label ?? this.playerStyle.label;
  }

  public set label(newLabel: string) {
    this.playerStyle.label = newLabel;
    this.playerStyleOverride.label = newLabel;
  }

  public serialize(): PlayerDTO {
    const exportData: PlayerDTO = {
      id: this.id,
      roleId: this.roleId,
      position: this.position,
    };

    if (
      this.playerStyleOverride &&
      Object.keys(this.playerStyleOverride).length > 0
    ) {
      exportData.styleOverride = { ...this.playerStyleOverride };
    }

    return exportData;
  }
}
