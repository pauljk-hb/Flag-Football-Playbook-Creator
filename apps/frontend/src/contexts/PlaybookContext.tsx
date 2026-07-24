import { createContext, useContext, useState, type ReactNode } from 'react';
import { PlaybookEngine } from '@playbook/core';

// Was der Context bereitstellt
interface PlaybookContextType {
    engine: PlaybookEngine | null;
    setEngine: (engine: PlaybookEngine | null) => void;
}

const PlaybookContext = createContext<PlaybookContextType | null>(null);

export function PlaybookProvider({ children }: { children: ReactNode }) {
    const [engine, setEngine] = useState<PlaybookEngine | null>(null);

    return (
        <PlaybookContext.Provider value={{ engine, setEngine }}>
            {children}
        </PlaybookContext.Provider>
    );
}

// Eigener Hook für maximalen Komfort
export function usePlaybook() {
    const context = useContext(PlaybookContext);
    if (!context) throw new Error('usePlaybook muss innerhalb eines PlaybookProviders verwendet werden');
    return context;
}