import { useEffect, useRef } from "react";
import { PlaybookEngine } from "@playbook/core";
import { usePlaybook } from "../../contexts/PlaybookContext";

interface PlaybookCanvasProps {
  initialPlayData?: any; // Das 'data' Objekt aus der API
}

export function PlaybookCanvas({ initialPlayData }: PlaybookCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setEngine } = usePlaybook();

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    const engineInstance = new PlaybookEngine();
    engineInstance.init(canvasRef.current);

    if (initialPlayData) {
      const dataString =
        typeof initialPlayData === "string"
          ? initialPlayData
          : JSON.stringify(initialPlayData);

      const success = engineInstance.loadPlay(dataString);
      if (!success) console.warn("Engine konnte Play nicht laden.");
    }

    setEngine(engineInstance);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        engineInstance.handleResize(entry.contentRect.width);
      }
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      resizeObserver.disconnect();
      engineInstance.dispose();
      setEngine(null);
    };
  }, []);
  return (
    <div
      ref={wrapperRef}
      className="w-2/3 overflow-hidden shadow-lg bg-white rounded-md"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
