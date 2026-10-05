import { SYSTEM_FIELDS } from "../../data/presets/fields";
import type { FieldLineConfig, FieldPreset } from "../../types/presets";

export class FieldModel {
  private presetId: string;

  constructor(presetId: string = "STANDARD") {
    this.presetId = presetId;
  }

  public setPreset(presetId: string): void {
    if (SYSTEM_FIELDS[presetId]) {
      this.presetId = presetId;
    } else {
      console.warn(
        `Field Preset '${presetId}' existiert nicht. Fallback auf STANDARD.`,
      );
      this.presetId = "STANDARD";
    }
  }

  public getPresetId(): string {
    return this.presetId;
  }

  public getPresetData(): FieldPreset {
    return SYSTEM_FIELDS[this.presetId] || SYSTEM_FIELDS["STANDARD"];
  }

  public getLines(): FieldLineConfig[] {
    return this.getPresetData().lines;
  }

  public getAnchor(): { x: number; y: number } {
    return this.getPresetData().anchor;
  }
}
