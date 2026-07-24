import { useEffect, useRef } from 'react';
import { PlaybookEngine } from '@playbook/core';
import { usePlaybook } from '../contexts/PlaybookContext';
import "../temp-style.css"

export function PlaybookCanvas() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { setEngine } = usePlaybook();

    useEffect(() => {
        if (!canvasRef.current || !wrapperRef.current) return;

        const engineInstance = new PlaybookEngine();        
        engineInstance.init(canvasRef.current);
        
        setEngine(engineInstance);

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Übergibt die exakte verfügbare Pixel-Breite an die Engine
                engineInstance.handleResize(entry.contentRect.width);
            }
        });

        resizeObserver.observe(wrapperRef.current);

        return () => {
            resizeObserver.disconnect();
            engineInstance.dispose();
            setEngine(null);
        };
    }, [setEngine]);

    return (
        <>
       <div ref={wrapperRef} className="max-w-sm overflow-hidden playbook">
            <canvas ref={canvasRef} />
        </div>
        <div className="max-w-sm overflow-hidden">

        </div>
        </>
    );
}