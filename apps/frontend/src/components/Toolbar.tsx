import { SYSTEM_PLAYERS } from '@playbook/core/dist/data/presets/players';
import { usePlaybook } from '../contexts/PlaybookContext';
import { usePlaybookHistory } from '../hooks/usePlaybookHistory';

export function Toolbar() {
    const { engine } = usePlaybook();
    const { canUndo, canRedo } = usePlaybookHistory();
        

    if (!engine) return null;

    const addPlayerFromPreset = (presetId: string) => {
        const preset = SYSTEM_PLAYERS[presetId];
        engine.addPlayer({
    x: 200,
    y: 300,
    label: preset.label,
    color: preset.color,
    shape: preset.shape
});
    }

    return (
        <div>
        <div className="flex gap-2 p-4 bg-slate-100 rounded-lg">
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => addPlayerFromPreset('QB')}
            >
                QB Hinzufügen
            </button>

            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => addPlayerFromPreset('WR1')}
            >
                WR1 Hinzufügen
            </button>

            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => addPlayerFromPreset('WR2')}
            >
                WR2 Hinzufügen
            </button>

            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => addPlayerFromPreset('RED')}
            >
                RED Hinzufügen
            </button>

            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => addPlayerFromPreset('CENTER')}
            >
                CENTER Hinzufügen
            </button>
            
            <div className="ml-auto flex gap-2">
                <button 
                    onClick={() => engine.undo()} 
                    disabled={!canUndo}
                    className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Undo
                </button>
                <button 
                    onClick={() => engine.redo()} 
                    disabled={!canRedo}
                    className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Redo
                </button>
            </div>
        </div>
        <div>
            <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => engine.assignRouteToSelectedPlayer('OUT')}
            >
                Out Route anfügen
            </button>
             <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => engine.assignRouteToSelectedPlayer('SLANT')}
            >
                Slant Route anfügen
            </button>
             <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => engine.assignRouteToSelectedPlayer('COME_BACK')}
            >
                Come Back Route anfügen
            </button>

            <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={() => engine.loadFormation('I_FORM', 400, 450)}
            >
                I-Form laden
            </button>
        </div>
        </div>
    );
}