import { usePlaybook } from "@/hooks/usePlaybook";
import { useEffect } from "react";
import { toast } from "sonner";

export function useEngineNotifications() {
  const { engine } = usePlaybook();

  useEffect(() => {
    if (!engine) return;

    return engine.on("system:notification", (notification) => {
      switch (notification.level) {
        case "warning":
          toast.warning(notification.message);
          break;
        case "error":
          toast.error(notification.message);
          break;
        case "success":
          toast.success(notification.message);
          break;
        case "info":
        default:
          toast.info(notification.message);
          break;
      }
    });
  }, [engine]);
}
