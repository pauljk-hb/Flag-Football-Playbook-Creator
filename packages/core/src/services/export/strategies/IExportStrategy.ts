import type { HeadlessEnvironment } from "../types";

export interface IExportStrategy<InputType, OptionsType> {
  execute(
    data: InputType,
    env: HeadlessEnvironment,
    options: OptionsType,
  ): Promise<Blob>;
}
