import { SYSTEM_PLAYERS } from "@playbook/core/dist/data/presets/players";
import { usePlaybook } from "../contexts/PlaybookContext";
import { usePlaybookHistory } from "../hooks/usePlaybookHistory";

// shadcn UI Komponenten
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup, // WICHTIG: Neuer Import für das Base UI Fix
} from "@/components/ui/dropdown-menu";

// Lucide Icons
import {
  Undo2,
  Redo2,
  UserPlus,
  Users,
  Route as RouteIcon,
  Map as MapIcon,
  ChevronDown,
  Delete,
} from "lucide-react";

export function Toolbar() {
  const { engine } = usePlaybook();
  const { canUndo, canRedo } = usePlaybookHistory();

  if (!engine) return null;

  const addPlayerFromPreset = (presetId: string) => {
    try {
      const preset = SYSTEM_PLAYERS[presetId];
      if (!preset) return;
      engine.addPlayer({
        x: 200,
        y: 300,
        label: preset.label,
        color: preset.color,
        shape: preset.shape,
      });
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Spielers:", error);
    }
  };

  const handleAssignRoute = (routeId: string) => {
    try {
      engine.assignRouteToSelectedPlayer(routeId);
    } catch (error) {
      console.warn(
        "Konnte Route nicht zuweisen. Ist ein Spieler markiert?",
        error,
      );
    }
  };

  return (
    <header className="h-14 border-b flex items-center px-4 gap-2 bg-card shrink-0">
      {/* GRUPPE 1: Verlauf (Undo/Redo) */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => engine.undo()}
          disabled={!canUndo}
          title="Rückgängig"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => engine.redo()}
          disabled={!canRedo}
          title="Wiederholen"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2 my-auto" />
      {/* GRUPPE 2: Spieler hinzufügen */}
      <DropdownMenu>
        {/* FIX 1: Kein innerer <Button> mehr */}
        <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <UserPlus className="h-4 w-4" />
          Spieler
          <ChevronDown className="h-3 w-3 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {/* FIX 2: Labels zwingend in <DropdownMenuGroup> packen */}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Offense</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => addPlayerFromPreset("QB")}>
              Quarterback (QB)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addPlayerFromPreset("CENTER")}>
              Center (C)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addPlayerFromPreset("WR1")}>
              Wide Receiver 1 (WR1)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addPlayerFromPreset("WR2")}>
              Wide Receiver 2 (WR2)
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Defense</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => addPlayerFromPreset("RED")}>
              Rusher (RED)
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* GRUPPE 3: Formationen */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <Users className="h-4 w-4" />
          Formationen
          <ChevronDown className="h-3 w-3 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {/* Hier gibt es kein Label, also wird auch keine Group zwingend benötigt */}
          <DropdownMenuItem onClick={() => engine.loadFormation("EMPTY_LEFT")}>
            Empty Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => engine.loadFormation("EMPTY_RIGHT")}>
            Empty Right
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => engine.loadFormation("TOWER_LEFT")}>
            Tower Left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => engine.loadFormation("TOWER_RIGHT")}>
            Tower Right
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* GRUPPE 4: Routen (Nummern-Block) */}
      <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
        <RouteIcon className="h-4 w-4 mx-2 text-muted-foreground" />

        {/* Kurz */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs"
          title="1: Quick Out"
          onClick={() => handleAssignRoute("QUICK_OUT")}
        >
          1
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs"
          title="2: Slant"
          onClick={() => handleAssignRoute("SLANT")}
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
          onClick={() => handleAssignRoute("COMEBACK")}
        >
          3
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs"
          title="4: In / Dig"
          onClick={() => handleAssignRoute("HITCH")}
        >
          4
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs"
          title="5: Out"
          onClick={() => handleAssignRoute("OUT")}
        >
          5
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs"
          title="6: Comeback"
          onClick={() => handleAssignRoute("IN")}
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
          onClick={() => handleAssignRoute("CORNER")}
        >
          7
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs"
          title="8: Corner"
          onClick={() => handleAssignRoute("POST")}
        >
          8
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-xs"
          title="9: Go / Fly"
          onClick={() => handleAssignRoute("GO")}
        >
          9
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2 my-auto" />

      {/* GRUPPE 5: Spielfeld */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <MapIcon className="h-4 w-4" />
          Spielfeld
          <ChevronDown className="h-3 w-3 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => engine.changeFieldPreset("STANDARD")}
          >
            Standard Feld
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => engine.changeFieldPreset("TWO_POINT_TRY")}
          >
            2-Point Try (5yd)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="default"
        size="icon"
        onClick={() => engine.removeSelectedPlayer()}
      >
        <Delete className="h-4 w-4" />
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={() => engine.deleteRoute()}
      >
        <Delete className="h-4 w-4" />
      </Button>
    </header>
  );
}
