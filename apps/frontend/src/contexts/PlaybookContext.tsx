import { createContext, useContext, useState, type ReactNode } from "react";
import { PlaybookEngine } from "@playbook/core";

// Was der Context bereitstellt
interface PlaybookContextType {
  engine: PlaybookEngine | null;
  setEngine: (engine: PlaybookEngine | null) => void;
}

export const PlaybookContext = createContext<PlaybookContextType | null>(null);

export function PlaybookProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<PlaybookEngine | null>(null);

  return (
    <PlaybookContext.Provider value={{ engine, setEngine }}>
      {children}
    </PlaybookContext.Provider>
  );
}
