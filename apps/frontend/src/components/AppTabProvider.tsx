import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BackendTest } from "./BackendTest";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

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

  const isPlaybookActive =
    location.pathname === "/" || location.pathname.startsWith("/editor");

  const isExportActive = location.pathname.startsWith("/export");

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/login", { replace: true });
    }
  }, [session, isPending, navigate]);

  if (isPending || !session) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground text-sm">
        Lade Anwendung...
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
