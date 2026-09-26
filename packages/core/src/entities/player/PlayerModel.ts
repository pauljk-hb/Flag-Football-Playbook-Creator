import { BaseModel } from "../base/BaseModel";

export class PlayerModel extends BaseModel {
  public x: number;
  public y: number;
  public role: string;
  public style: PlayerStyle;
  public styleOverride: PlayerStyleOverride;

  constructor(config: PlayerImportData) {
    super(config.id);
    this.x = config.x;
    this.y = config.y;
    this.role = config.role;
    this.style = config.style;
    this.styleOverride = config.styleOverride || {};
  }

  public get color(): string {
    return this.styleOverride.color ?? this.style.color;
  }

  public set color(newColor: string) {
    this.style.color = newColor;
    this.styleOverride.color = newColor;
  }

  public get label(): string {
    return this.styleOverride.label ?? this.style.label;
  }

  public set label(newLabel: string) {
    this.style.label = newLabel;
    this.styleOverride.label = newLabel;
  }

  public serialize(): PlayerExportData {
    const exportData: PlayerExportData = {
      id: this.id,
      role: this.role,
      x: this.x,
      y: this.y,
    };

    if (this.styleOverride && Object.keys(this.styleOverride).length > 0) {
      exportData.styleOverride = { ...this.styleOverride };
    }

    return exportData;
  }
}
