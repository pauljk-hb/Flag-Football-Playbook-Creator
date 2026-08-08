import { useEffect } from "react";
import { toast } from "sonner";
import { usePlaybook } from "@/hooks/usePlaybook";

export function useEngineNotifications() {
  const { engine } = usePlaybook();

  useEffect(() => {
    if (!engine) return;

    const unsubscribe = engine.subscribeToNotification((notification) => {
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

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [engine]);
}
