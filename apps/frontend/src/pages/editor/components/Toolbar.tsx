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
  Pencil,
  LayoutDashboard,
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
import { ToolbarButton } from "./ToolbarButton";
import { RouteToolbarGroup } from "./RouteToolbarGroup";
import { useEditorStore } from "../store/useEditorStore";

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

  return (
    <header className="border-b bg-muted">
      <div className="flex px-2 items-center py-1 border-b">
        <div className="flex-1 flex justify-start">
          <ToolbarButton
            icon={LayoutDashboard}
            onClick={handleBack}
            label="Zur Übersicht"
          />
        </div>

        <h2 className="text-lg text-center whitespace-nowrap px-4">{title}</h2>

        <div className="flex-1" />
      </div>
      <div className="flex items-center px-2 py-2 shrink-0">
        {/* GRUPPE 1: Verlauf (Undo/Redo) */}
        <div className="flex items-center">
          <ToolbarButton
            icon={Undo2}
            onClick={() => history.undo()}
            disabled={!canUndo}
            label="Rückgängig"
            shortcut="strg+Z"
          />

          <ToolbarButton
            icon={Redo2}
            onClick={() => history.redo()}
            disabled={!canRedo}
            label="Wiederholen"
            shortcut="strg+shift+Z"
          />
        </div>

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <ToolbarButton
          icon="Q"
          onClick={() => addPlayer.qb()}
          label="Hinzufügen: QB"
          shortcut="Q"
        />

        <ToolbarButton
          icon="C"
          onClick={() => addPlayer.center()}
          label="Hinzufügen: Center"
          shortcut="C"
        />

        <ToolbarButton
          icon="X"
          onClick={() => addPlayer.wr1()}
          label="Hinzufügen: X"
          shortcut="X"
        />

        <ToolbarButton
          icon="Z"
          onClick={() => addPlayer.wr2()}
          label="Hinzufügen: Z"
          shortcut="Z"
        />

        <ToolbarButton
          icon="R"
          onClick={() => addPlayer.red()}
          label="Hinzufügen: Red"
          shortcut="R"
        />

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <RouteToolbarGroup />

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <ToolbarButton
          icon={Pencil}
          onClick={() => drawRoute(useEditorStore.getState().routeMode)}
          label="Route zeichnen - doppel Klick zum beenden"
        />

        {/* Kurz */}
        <ToolbarButton
          icon={QuickOutRoute}
          onClick={() => addRoute.quickOut(useEditorStore.getState().routeMode)}
          label="Quick Out"
          shortcut="1"
        />

        <ToolbarButton
          icon={SlantRoute}
          onClick={() => addRoute.slant(useEditorStore.getState().routeMode)}
          label="Slant"
          shortcut="2"
        />

        {/* Mittel / Lang */}
        <ToolbarButton
          icon={ComeBackRoute}
          onClick={() => addRoute.comeBack(useEditorStore.getState().routeMode)}
          label="Comeback"
          shortcut="3"
        />

        <ToolbarButton
          icon={HitchRoute}
          onClick={() => addRoute.hitch(useEditorStore.getState().routeMode)}
          label="Hitch"
          shortcut="4"
        />

        <ToolbarButton
          icon={OutRoute}
          onClick={() => addRoute.out(useEditorStore.getState().routeMode)}
          label="Out"
          shortcut="5"
        />

        <ToolbarButton
          icon={InRoute}
          onClick={() => addRoute.in(useEditorStore.getState().routeMode)}
          label="In"
          shortcut="6"
        />

        {/* Tief */}

        <ToolbarButton
          icon={CornerRoute}
          onClick={() => addRoute.corner(useEditorStore.getState().routeMode)}
          label="Corner"
          shortcut="7"
        />

        <ToolbarButton
          icon={PostRoute}
          onClick={() => addRoute.post(useEditorStore.getState().routeMode)}
          label="Post"
          shortcut="8"
        />

        <ToolbarButton
          icon={GoRoute}
          onClick={() => addRoute.go(useEditorStore.getState().routeMode)}
          label="Go"
          shortcut="9"
        />

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        <ToolbarButton
          icon={Trash2}
          onClick={() => engine?.deleteSelectedObject()}
          label="Löschen"
          shortcut="delete"
        />

        <Separator orientation="vertical" className="h-9 mx-2 my-auto" />

        {/* <ToolbarButton
          icon={Save}
          onClick={() => onSave()}
          label="Speichern"
          shortcut="strg+s"
        /> */}

        <ToolbarButton
          icon={Download}
          onClick={() => onDownload()}
          label="Download PLay"
        />
      </div>
    </header>
  );
}
