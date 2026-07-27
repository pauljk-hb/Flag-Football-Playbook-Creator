import { useContext } from "react";
import { PlaybookContext } from "@/contexts/PlaybookContext";

export function usePlaybook() {
  const context = useContext(PlaybookContext);
  if (!context)
    throw new Error(
      "usePlaybook muss innerhalb eines PlaybookProviders verwendet werden",
    );
  return context;
}
