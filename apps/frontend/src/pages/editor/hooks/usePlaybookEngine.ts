import { usePlaybook } from "@/hooks/usePlaybook";
import { PlaybookAPI } from "@playbook/core";
import { useEffect, useRef } from "react";

export function usePlaybookEngine(initialPlayData?: string) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setEngine } = usePlaybook();

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    const engineInstance = new PlaybookAPI(canvasRef.current);

    if (initialPlayData) {
      const dataString =
        typeof initialPlayData === "string"
          ? initialPlayData
          : JSON.stringify(initialPlayData);
      engineInstance.loadPlay(dataString);
    }

    setEngine(engineInstance);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        engineInstance.handleResize(entry.contentRect.width);
      }
    });
    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      engineInstance.dispose();
      setEngine(null);
    };
  }, [setEngine, initialPlayData]);

  return { wrapperRef, canvasRef };
}
