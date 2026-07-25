import { useEffect, useRef } from 'react';
import { PlaybookEngine } from '@playbook/core';
import { usePlaybook } from '../contexts/PlaybookContext';
import "../temp-style.css";

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
        // Der Wrapper füllt den gesamten verfügbaren Platz der Mitte aus
        <div 
            ref={wrapperRef} 
            className="w-full max-h-full overflow-hidden playbook shadow-lg bg-white rounded-md"
        >
            <canvas ref={canvasRef} />
        </div>
    );
}