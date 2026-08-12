import { usePlaybookEngine } from "../hooks/usePlaybookEngine";

interface PlaybookCanvasProps {
  initialPlayData?: any;
}

export function PlaybookCanvas({ initialPlayData }: PlaybookCanvasProps) {
  const { wrapperRef, canvasRef } = usePlaybookEngine(initialPlayData);

  return (
    <div
      ref={wrapperRef}
      className="w-2/3 overflow-hidden shadow-lg bg-background rounded-md max-w-3xl"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
