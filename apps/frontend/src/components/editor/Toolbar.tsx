import { usePlaybook } from "../../contexts/PlaybookContext";
import { usePlaybookHistory } from "../../hooks/usePlaybookHistory";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Lucide Icons
import {
  Undo2,
  Redo2,
  UserPlus,
  Route as RouteIcon,
  Map as MapIcon,
  Save,
  Folder,
  UserMinus,
  Trash2,
} from "lucide-react";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";
import { useState } from "react";

export function Toolbar() {
  const { engine } = usePlaybook();
  const { canUndo, canRedo } = usePlaybookHistory();
  const { play, addPlayer, addRoute, history } = usePlaybookActions();

  const [saveId, setSaveId] = useState("");

  function handleChange(e: any) {
    setSaveId(e.target.value);
  }

  if (!engine) return null;

  return (
    <header className="px-4 border-b py-2">
      <h2>Play- Editor</h2>
      <div className="flex items-center gap-2 bg-card shrink-0">
        {/* GRUPPE 1: Verlauf (Undo/Redo) */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => history.undo()}
            disabled={!canUndo}
            title="Rückgängig"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => history.redo()}
            disabled={!canRedo}
            title="Wiederholen"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2 my-auto" />
        {/* GRUPPE 2: Spieler hinzufügen */}
        <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
          <UserPlus className="h-4 w-4 mx-2 text-muted-foreground" />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="1: Quick Out"
            onClick={() => addPlayer.qb()}
          >
            Q
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="2: Slant"
            onClick={() => addPlayer.center()}
          >
            C
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="2: Slant"
            onClick={() => addPlayer.wr1()}
          >
            W1
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="2: Slant"
            onClick={() => addPlayer.wr2()}
          >
            W2
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="2: Slant"
            onClick={() => addPlayer.red()}
          >
            R
          </Button>
        </div>

        {/* GRUPPE 4: Routen (Nummern-Block) */}
        <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
          <RouteIcon className="h-4 w-4 mx-2 text-muted-foreground" />

          {/* Kurz */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="1: Quick Out"
            onClick={() => addRoute.quickOut()}
          >
            1
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="2: Slant"
            onClick={() => addRoute.slant()}
          >
            2
          </Button>

          <Separator orientation="vertical" className="h-4 mx-1 my-auto" />

          {/* Mittel / Lang */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="3: Hitch"
            onClick={() => addRoute.comeBack()}
          >
            3
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="4: In / Dig"
            onClick={() => addRoute.hitch()}
          >
            4
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="5: Out"
            onClick={() => addRoute.out()}
          >
            5
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="6: Comeback"
            onClick={() => addRoute.in()}
          >
            6
          </Button>

          <Separator orientation="vertical" className="h-4 mx-1 my-auto" />

          {/* Tief */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="7: Post"
            onClick={() => addRoute.corner()}
          >
            7
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="8: Corner"
            onClick={() => addRoute.post()}
          >
            8
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-xs"
            title="9: Go / Fly"
            onClick={() => addRoute.go()}
          >
            9
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2 my-auto" />

        <Button
          variant="outline"
          size="icon"
          onClick={() => engine.deleteSelectedObject()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2 my-auto" />

        <input
          type="text"
          value={saveId}
          onChange={handleChange}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />

        <Button onClick={() => play.save(saveId)}>
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="secondary" onClick={() => play.load(saveId)}>
          <Folder className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
