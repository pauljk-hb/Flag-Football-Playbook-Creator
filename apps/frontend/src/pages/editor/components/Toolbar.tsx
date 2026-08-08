import { usePlaybookHistory } from "../../../hooks/usePlaybookHistory";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useHotkeys } from "react-hotkeys-hook";

// Lucide Icons
import {
  Undo2,
  Redo2,
  Route as RouteIcon,
  Save,
  Trash2,
  ChevronLeft,
  GitBranch,
  GitMerge,
  Pen,
  Download,
  FileQuestionMark,
} from "lucide-react";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";
import { useNavigate } from "react-router-dom";
import { usePlaybook } from "@/hooks/usePlaybook";
import { useState } from "react";
import {
  AddQB,
  ComeBackRoute,
  CornerRoute,
  GoRoute,
  HitchRoute,
  InRoute,
  OutRoute,
  PostRoute,
  QuickOutRoute,
  SlantRoute,
} from "@/components/ui/icons/custom.icons";
import {
  CPlayerIcon,
  QbPlayerIcon,
  RPlayerIcon,
  XPlayerIcon,
  ZPlayerIcon,
} from "@/components/ui/icons/PlayerIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";

interface ToolbarProps {
  title: string;
  onSave: () => void;
  onDownload: () => void;
  drawRoute: (routeMode: string) => void;
}

export function Toolbar({
  title,
  onSave,
  onDownload,
  drawRoute,
}: ToolbarProps) {
  const { engine } = usePlaybook();
  const { canUndo, canRedo } = usePlaybookHistory();
  const { addPlayer, addRoute, history } = usePlaybookActions();
  const navigate = useNavigate();

  const handleBack = async () => {
    onSave();
    navigate("/");
  };

  type RouteMode = "default" | "option_1" | "option_2";
  const [routeMode, setRouteMode] = useState<RouteMode>("default");

  useHotkeys("mod+y", () => {
    history.undo();
  });
  useHotkeys("mod+shift+y", () => {
    history.redo();
  });
  useHotkeys("1", () => {
    addRoute.quickOut(routeMode);
  });
  useHotkeys("2", () => {
    addRoute.slant(routeMode);
  });
  useHotkeys("3", () => {
    addRoute.comeBack(routeMode);
  });
  useHotkeys("4", () => {
    addRoute.hitch(routeMode);
  });
  useHotkeys("5", () => {
    addRoute.out(routeMode);
  });
  useHotkeys("6", () => {
    addRoute.in(routeMode);
  });
  useHotkeys("7", () => {
    addRoute.corner(routeMode);
  });
  useHotkeys("8", () => {
    addRoute.post(routeMode);
  });
  useHotkeys("9", () => {
    addRoute.go(routeMode);
  });

  useHotkeys("delete, backspace", () => {
    engine?.deleteSelectedObject();
  });

  return (
    <header className="px-4 border-b py-2 bg-card">
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          onClick={handleBack}
          title="Zurück zur Übersicht"
        >
          <ChevronLeft className="size-6" />
        </Button>

        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {/* GRUPPE 1: Verlauf (Undo/Redo) */}
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            onClick={() => history.undo()}
            disabled={!canUndo}
            title="Rückgängig"
            className="h-11 w-11"
          >
            <Undo2 className="size-5" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => history.redo()}
            disabled={!canRedo}
            title="Wiederholen"
            className="h-11 w-11"
          >
            <Redo2 className="size-5" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <Button
          variant="secondary"
          className="h-11 w-11"
          title="1: Quick Out"
          onClick={() => addPlayer.qb()}
        >
          <QbPlayerIcon className="size-5 text-black" />
        </Button>
        <Button
          variant="secondary"
          className="h-11 w-11"
          title="2: Slant"
          onClick={() => addPlayer.center()}
        >
          <CPlayerIcon className="size-5 text-lime-500" />
        </Button>
        <Button
          variant="secondary"
          className="h-11 w-11"
          title="2: Slant"
          onClick={() => addPlayer.wr1()}
        >
          <XPlayerIcon className="size-5 text-blue-500" />
        </Button>
        <Button
          variant="secondary"
          className="h-11 w-11"
          title="2: Slant"
          onClick={() => addPlayer.wr2()}
        >
          <ZPlayerIcon className="size-5 text-[#2ebfcc]" />
        </Button>
        <Button
          variant="secondary"
          className="h-11 w-11"
          title="2: Slant"
          onClick={() => addPlayer.red()}
        >
          <RPlayerIcon className="size-5 text-red-500" />
        </Button>

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <div className="flex items-center bg-muted/50 p-1 rounded-md border">
          <Button
            variant="secondary"
            size="sm"
            className={`h-11 px-3 ${routeMode === "default" ? "bg-primary text-white" : "text-slate-500"}`}
            onClick={() => setRouteMode("default")}
          >
            <RouteIcon className="w-3.5 h-3.5 mr-1" />
            Std.
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className={`h-11 px-3 ${routeMode === "option_1" ? "bg-primary text-white" : "text-slate-500"}`}
            onClick={() => setRouteMode("option_1")}
          >
            <GitBranch className="w-3.5 h-3.5 mr-1" />
            Opt. 1
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className={`h-11 px-3 ${routeMode === "option_2" ? "bg-primary text-white" : "text-slate-500"}`}
            onClick={() => setRouteMode("option_2")}
          >
            <GitMerge className="w-3.5 h-3.5 mr-1" />
            Opt. 2
          </Button>
        </div>

        <Button
          variant="secondary"
          className="h-11 w-11"
          onClick={() => drawRoute(routeMode)}
        >
          <Pen className="size-5" />
        </Button>

        {/* Kurz */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                className="h-11 w-11"
                onClick={() => addRoute.quickOut(routeMode)}
              >
                <QuickOutRoute className="size-5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">
            Quick Out <Kbd>1</Kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                title="2: Slant"
                className="h-11 w-11"
                onClick={() => addRoute.slant(routeMode)}
              >
                <SlantRoute className="size-5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">
            Slant <Kbd>2</Kbd>
          </TooltipContent>
        </Tooltip>

        {/* Mittel / Lang */}
        <Button
          variant="secondary"
          title="3: Hitch"
          className="h-11 w-11"
          onClick={() => addRoute.comeBack(routeMode)}
        >
          <ComeBackRoute className="size-5" />
        </Button>

        <Button
          variant="secondary"
          title="4: In / Dig"
          className="h-11 w-11"
          onClick={() => addRoute.hitch(routeMode)}
        >
          <HitchRoute className="size-5" />
        </Button>
        <Button
          variant="secondary"
          title="5: Out"
          className="h-11 w-11"
          onClick={() => addRoute.out(routeMode)}
        >
          <OutRoute className="size-5" />
        </Button>
        <Button
          variant="secondary"
          title="6: Comeback"
          className="h-11 w-11"
          onClick={() => addRoute.in(routeMode)}
        >
          <InRoute className="size-5" />
        </Button>

        {/* Tief */}
        <Button
          variant="secondary"
          title="7: Post"
          className="h-11 w-11"
          onClick={() => addRoute.corner(routeMode)}
        >
          <CornerRoute className="size-5" />
        </Button>
        <Button
          variant="secondary"
          title="8: Corner"
          className="h-11 w-11"
          onClick={() => addRoute.post(routeMode)}
        >
          <PostRoute className="size-5" />
        </Button>
        <Button
          variant="secondary"
          title="9: Go / Fly"
          className="h-11 w-11"
          onClick={() => addRoute.go(routeMode)}
        >
          <GoRoute className="size-5" />
        </Button>

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <Button
          variant="secondary"
          onClick={() => engine?.deleteSelectedObject()}
          className="h-11 w-11"
        >
          <Trash2 className="size-5 " />
        </Button>

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <Button
          variant="secondary"
          onClick={() => onSave()}
          className="h-11 w-11"
        >
          <Save className="size-5" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => onDownload()}
          className="h-11 w-11"
        >
          <Download className="size-5" />
        </Button>

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <Button
          variant="ghost"
          onClick={() => onSave()}
          className="h-11 w-11 border-secondary"
        >
          ?
        </Button>
      </div>
    </header>
  );
}
