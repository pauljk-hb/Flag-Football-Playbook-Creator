// Lucide Icons
import { ChevronLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToolbarButton } from "./ToolbarButton";

interface ToolbarProps {
  title: string;
  onDownload: () => void;
}

export function MobileToolbar({ title, onDownload }: ToolbarProps) {
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate("/");
  };

  return (
    <header className="border-b bg-muted">
      <div className="flex justify-between space-b px-2 items-center py-1 border-b">
        <ToolbarButton
          icon={ChevronLeft}
          onClick={handleBack}
          label="Zur Übersicht"
        />

        <h2 className="text-lg text-center whitespace-nowrap px-4">{title}</h2>

        <ToolbarButton
          icon={Download}
          onClick={() => onDownload()}
          label="Download PLay"
        />
      </div>
    </header>
  );
}
