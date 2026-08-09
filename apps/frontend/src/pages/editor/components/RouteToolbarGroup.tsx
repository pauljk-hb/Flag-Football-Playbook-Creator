import { Route as RouteIcon, GitBranch, GitMerge } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import { useEditorStore } from "../store/useEditorStore";

export function RouteToolbarGroup() {
  const routeMode = useEditorStore((state) => state.routeMode);
  const setRouteMode = useEditorStore((state) => state.setRouteMode);

  return (
    <div className="flex items-center gap-0.5">
      <ToolbarButton
        icon={RouteIcon}
        label="Standard Route"
        isActive={routeMode === "default"}
        onClick={() => setRouteMode("default")}
      />

      <ToolbarButton
        icon={GitBranch}
        label="Option 1"
        isActive={routeMode === "option_1"}
        onClick={() => setRouteMode("option_1")}
      />

      <ToolbarButton
        icon={GitMerge}
        label="Option 2"
        isActive={routeMode === "option_2"}
        onClick={() => setRouteMode("option_2")}
      />
    </div>
  );
}
