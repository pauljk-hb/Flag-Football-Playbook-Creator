import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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

  const isPlaybookActive =
    location.pathname === "/" || location.pathname.startsWith("/editor");

  const isExportActive = location.pathname.startsWith("/export");

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
