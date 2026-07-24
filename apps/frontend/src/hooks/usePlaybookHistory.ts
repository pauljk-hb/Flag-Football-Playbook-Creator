import { useState, useEffect } from 'react';
import { usePlaybook } from '../contexts/PlaybookContext';

export function usePlaybookHistory() {
  const { engine } = usePlaybook();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!engine) return;

    setCanUndo(engine.history.canUndo());
    setCanRedo(engine.history.canRedo());

    const unsubscribe = engine.history.subscribe(() => {
      setCanUndo(engine.history.canUndo());
      setCanRedo(engine.history.canRedo());
    });

    return unsubscribe;
  }, [engine]);

  return { canUndo, canRedo };
}