import { useState, useEffect } from "react";
import { usePlaybook } from "./usePlaybook";

export function usePlaybookHistory() {
  const { engine } = usePlaybook();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!engine) return;

    setCanUndo(engine.canUndo());
    setCanRedo(engine.canRedo());

    const unsubscribe = engine.subscribeToHistoryChanges(() => {
      setCanUndo(engine.canUndo());
      setCanRedo(engine.canRedo());
      console.log("Änderung gemacht");
    });

    return unsubscribe;
  }, [engine]);

  return { canUndo, canRedo };
}
