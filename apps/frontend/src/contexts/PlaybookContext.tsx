import { createContext, useContext, useState, type ReactNode } from "react";
import { PlaybookAPI } from "@playbook/core";

// Was der Context bereitstellt
interface PlaybookContextType {
  engine: PlaybookAPI | null;
  setEngine: (engine: PlaybookAPI | null) => void;
}

export const PlaybookContext = createContext<PlaybookContextType | null>(null);

export function PlaybookProvider({ children }: { children: ReactNode }) {
  const [engine, setEngine] = useState<PlaybookAPI | null>(null);

  return (
    <PlaybookContext.Provider value={{ engine, setEngine }}>
      {children}
    </PlaybookContext.Provider>
  );
}
