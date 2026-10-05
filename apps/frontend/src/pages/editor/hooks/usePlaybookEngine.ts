import { usePlaybook } from "@/hooks/usePlaybook";
import { PlaybookAPI } from "@playbook/core";
import { useEffect, useRef } from "react";

export function usePlaybookEngine(initialPlayData?: string) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setEngine } = usePlaybook();

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    const engineInstance = new PlaybookAPI();
    engineInstance.init(canvasRef.current, {
      playbookMode: "EDITOR",
      themeConfig: {
        playerRoles: {
          QB: {
            color: "#1a1b1b",
            shape: "circle",
            label: "QB",
            showLabel: true,
          },
          CENTER: {
            color: "#469b54",
            shape: "square",
            label: "C",
            showLabel: true,
          },
          WR1: {
            color: "#326FB5",
            shape: "circle",
            label: "X",
            showLabel: true,
          },
          WR2: {
            color: "#3399B5",
            shape: "circle",
            label: "Z",
            showLabel: true,
          },
          RED: {
            color: "#E63D38",
            shape: "circle",
            label: "R",
            showLabel: true,
          },
        },
      },
    });

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
