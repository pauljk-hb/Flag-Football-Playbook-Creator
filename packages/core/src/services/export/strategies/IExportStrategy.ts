import type { HeadlessEnvironment } from "../../../types/export";

export interface IExportStrategy<InputType, OptionsType, ReturnType = Blob> {
  execute(
    data: InputType,
    env: HeadlessEnvironment,
    options: OptionsType,
  ): Promise<ReturnType>;
}
