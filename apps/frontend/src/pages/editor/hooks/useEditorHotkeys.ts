import { usePlaybook } from "@/hooks/usePlaybook";
import { useHotkeys } from "react-hotkeys-hook";
import { useEditorStore } from "../store/useEditorStore";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";

export function useEditorHotkeys() {
  const { engine } = usePlaybook();
  const { addPlayer, addRoute, history } = usePlaybookActions();

  //History
  useHotkeys("mod+y", () => {
    history.undo();
  });
  useHotkeys("mod+shift+y", () => {
    history.redo();
  });

  //Player
  useHotkeys("q", () => addPlayer.qb());
  useHotkeys("c", () => addPlayer.center());
  useHotkeys("x", () => addPlayer.wr1());
  useHotkeys("y", () => addPlayer.wr2());
  useHotkeys("r", () => addPlayer.red());

  // Routen
  useHotkeys("1", () => addRoute.quickOut(useEditorStore.getState().routeMode));
  useHotkeys("2", () => addRoute.slant(useEditorStore.getState().routeMode));
  useHotkeys("3", () => addRoute.comeBack(useEditorStore.getState().routeMode));
  useHotkeys("4", () => addRoute.hitch(useEditorStore.getState().routeMode));
  useHotkeys("5", () => addRoute.out(useEditorStore.getState().routeMode));
  useHotkeys("6", () => addRoute.in(useEditorStore.getState().routeMode));
  useHotkeys("7", () => addRoute.corner(useEditorStore.getState().routeMode));
  useHotkeys("8", () => addRoute.post(useEditorStore.getState().routeMode));
  useHotkeys("9", () => addRoute.go(useEditorStore.getState().routeMode));

  useHotkeys("u", () => addRoute.under(useEditorStore.getState().routeMode));
  useHotkeys("o", () => addRoute.over(useEditorStore.getState().routeMode));
  useHotkeys("w", () => addRoute.weel(useEditorStore.getState().routeMode));

  // Löschen
  useHotkeys("delete, backspace", () => {
    engine?.deleteSelectedObject();
  });
}
