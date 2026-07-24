export interface ICommand {
  execute(): void;
  undo(): void;
}

export type HistoryListener = () => void;
