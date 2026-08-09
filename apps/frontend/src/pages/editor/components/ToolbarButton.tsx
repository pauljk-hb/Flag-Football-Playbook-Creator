import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  icon: React.ElementType | string;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
}

export function ToolbarButton({
  icon: IconOrText,
  label,
  shortcut,
  onClick,
  disabled,
  isActive = false,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="secondary"
            className={cn(
              "cursor-pointer h-10 w-10 flex bg-muted items-center justify-center transition-colors hover:bg-foreground/20",

              isActive &&
                "bg-primary text-primary-foreground hover:bg-primary/80",
            )}
            onClick={onClick}
            disabled={disabled}
          >
            {typeof IconOrText === "string" ? (
              <span className="leading-none">{IconOrText}</span>
            ) : (
              <IconOrText className="size-5" />
            )}
          </Button>
        }
      />
      <TooltipContent side="bottom" className="flex items-center gap-2">
        {label}
        {shortcut && <Kbd>{shortcut}</Kbd>}
      </TooltipContent>
    </Tooltip>
  );
}
