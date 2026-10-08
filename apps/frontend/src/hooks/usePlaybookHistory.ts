import { useEffect, useState } from "react";
import { usePlaybook } from "./usePlaybook";

export function usePlaybookHistory() {
  const { engine } = usePlaybook();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!engine) return;

    setCanUndo(engine.canUndo());
    setCanRedo(engine.canRedo());

    return engine.on("history:changed", ({ canUndo, canRedo }) => {
      setCanUndo(canUndo);
      setCanRedo(canRedo);
    });
  }, [engine]);

  return { canUndo, canRedo };
}
