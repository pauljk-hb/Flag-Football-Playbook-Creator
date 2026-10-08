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

  public set label(newLabel: string) {
    this.playerStyleOverride.label = newLabel;
  }

  public set color(newColor: string) {
    this.playerStyleOverride.color = newColor;
  }

  public set showLabel(show: boolean) {
    this.playerStyleOverride.showLabel = show;
  }

  public set shape(newShape: PlayerStyle["shape"]) {
    this.playerStyleOverride.shape = newShape;
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
