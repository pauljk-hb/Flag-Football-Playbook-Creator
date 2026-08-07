import { usePlaybookHistory } from "../../hooks/usePlaybookHistory";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Lucide Icons
import {
  Undo2,
  Redo2,
  UserPlus,
  Route as RouteIcon,
  Save,
  Trash2,
  ChevronLeft,
  GitBranch,
  GitMerge,
  Pen,
} from "lucide-react";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";
import { useNavigate } from "react-router-dom";
import { usePlaybook } from "@/hooks/usePlaybook";
import { useState } from "react";

interface ToolbarProps {
  title: string;
  onSave: () => void;
  drawRoute: (routeMode: string) => void;
}

export function Toolbar({ title, onSave, drawRoute }: ToolbarProps) {
  const { engine } = usePlaybook();
  const { canUndo, canRedo } = usePlaybookHistory();
  const { addPlayer, addRoute, history } = usePlaybookActions();
  const navigate = useNavigate();

  type RouteMode = "default" | "option_1" | "option_2";
  const [routeMode, setRouteMode] = useState<RouteMode>("default");

  if (!engine) return null;

  return (
    <header className="px-4 border-b py-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="Zurück zur Übersicht"
          aria-label="Zurück"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="flex items-center gap-2 bg-card shrink-0">
        {/* GRUPPE 1: Verlauf (Undo/Redo) */}
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            onClick={() => history.undo()}
            disabled={!canUndo}
            title="Rückgängig"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => history.redo()}
            disabled={!canRedo}
            title="Wiederholen"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2 my-auto" />

        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="1: Quick Out"
          onClick={() => addPlayer.qb()}
        >
          Q
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="2: Slant"
          onClick={() => addPlayer.center()}
        >
          C
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="2: Slant"
          onClick={() => addPlayer.wr1()}
        >
          W1
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="2: Slant"
          onClick={() => addPlayer.wr2()}
        >
          W2
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="2: Slant"
          onClick={() => addPlayer.red()}
        >
          R
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2 my-auto" />

        <div className="flex items-center bg-muted/50 p-1 rounded-md border">
          <Button
            variant="secondary"
            size="sm"
            className={`h-7 px-3 text-xs ${routeMode === "default" ? "bg-white shadow-sm text-slate-900 font-medium" : "text-slate-500"}`}
            onClick={() => setRouteMode("default")}
          >
            <RouteIcon className="w-3.5 h-3.5 mr-1" />
            Std.
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className={`h-7 px-3 text-xs ${routeMode === "option_1" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-slate-500"}`}
            onClick={() => setRouteMode("option_1")}
          >
            <GitBranch className="w-3.5 h-3.5 mr-1" />
            Opt. 1
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className={`h-7 px-3 text-xs ${routeMode === "option_2" ? "bg-white shadow-sm text-emerald-600 font-medium" : "text-slate-500"}`}
            onClick={() => setRouteMode("option_2")}
          >
            <GitMerge className="w-3.5 h-3.5 mr-1" />
            Opt. 2
          </Button>
        </div>

        <Button variant="secondary" onClick={() => drawRoute(routeMode)}>
          <Pen className="h-4 w-4" />
        </Button>

        {/* Kurz */}
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="1: Quick Out"
          onClick={() => addRoute.quickOut(routeMode)}
        >
          1
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="2: Slant"
          onClick={() => addRoute.slant(routeMode)}
        >
          2
        </Button>

        {/* Mittel / Lang */}
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="3: Hitch"
          onClick={() => addRoute.comeBack(routeMode)}
        >
          3
        </Button>

        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="4: In / Dig"
          onClick={() => addRoute.hitch(routeMode)}
        >
          4
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="5: Out"
          onClick={() => addRoute.out(routeMode)}
        >
          5
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="6: Comeback"
          onClick={() => addRoute.in(routeMode)}
        >
          6
        </Button>

        {/* Tief */}
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="7: Post"
          onClick={() => addRoute.corner(routeMode)}
        >
          7
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="8: Corner"
          onClick={() => addRoute.post(routeMode)}
        >
          8
        </Button>
        <Button
          variant="secondary"
          className="h-7 w-7 text-xs"
          title="9: Go / Fly"
          onClick={() => addRoute.go(routeMode)}
        >
          9
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2 my-auto" />

        <Button
          variant="secondary"
          onClick={() => engine.deleteSelectedObject()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2 my-auto" />

        <Button variant="secondary" onClick={() => onSave()}>
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
