import { api } from "@/api/client";
import { usePlaybookStore } from "@/hooks/useAppStore";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

interface TabButtonProps {
  to: string;
  isActive: boolean;
  label: string;
}

function TabButton({ to, isActive, label }: TabButtonProps) {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex items-center justify-center w-28 h-full text-sm transition-colors text-foreground hover:bg-primary/5",
        isActive && "bg-primary/10 font-bold",
      )}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
      )}
    </Link>
  );
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: session, isPending } = useSession();
  const { activePlaybookId, setActivePlaybookId } = usePlaybookStore();
  const [isInitializingPlaybook, setIsInitializingPlaybook] = useState(true);

  const isPlaybookActive =
    location.pathname === "/" || location.pathname.startsWith("/editor");
  const isExportActive = location.pathname.startsWith("/export");

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/login", { replace: true });
    }
  }, [session, isPending, navigate]);

  useEffect(() => {
    async function initializeActivePlaybook() {
      if (!session?.user) return;

      if (activePlaybookId) {
        setIsInitializingPlaybook(false);
        return;
      }

      try {
        const userLastPlaybookId = (session.user as any).lastPlaybookId;
        if (userLastPlaybookId) {
          setActivePlaybookId(userLastPlaybookId);
          setIsInitializingPlaybook(false);
          return;
        }

        const playbooks = await api.playbooks.getAll();
        if (playbooks && playbooks.length > 0) {
          setActivePlaybookId(playbooks[0].id);
        }
      } catch (error) {
        console.error(
          "Fehler beim Initialisieren des aktiven Playbooks:",
          error,
        );
      } finally {
        setIsInitializingPlaybook(false);
      }
    }

    if (!isPending && session) {
      initializeActivePlaybook();
    }
  }, [session, isPending, activePlaybookId, setActivePlaybookId]);

  if (isPending || !session || isInitializingPlaybook) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      <header className="h-12 border-b border-border bg-muted flex">
        <TabButton to="/" isActive={isPlaybookActive} label="Playbook" />
        <TabButton to="/export" isActive={isExportActive} label="Export" />
      </header>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
