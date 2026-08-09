import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { Play } from "@/types/interface";
import { useNavigate } from "react-router-dom";

interface PlayCardProps {
  play: Play;
}

export function PlayCard({ play }: PlayCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden cursor-pointer bg-muted"
      onClick={() => navigate(`/editor/${play.id}`)}
    >
      {play.thumbnail ? (
        <img
          src={play.thumbnail}
          alt={play.title}
          className="aspect-4/3 w-full object-cover"
        />
      ) : (
        <div className="aspect-4/3 w-full bg-muted/50 flex items-center justify-center border-b border-border/50 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">
            [ Field Preview ]
          </span>
        </div>
      )}

      <CardHeader className="px-4">
        <div className="mb-1.5">
          <Badge variant="secondary" className="text-[10px] py-0">
            Offense
          </Badge>
        </div>

        <CardTitle className="text-sm font-semibold line-clamp-2">
          {play.title}
        </CardTitle>
      </CardHeader>

      <CardFooter className="px-4 py-1 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-medium">
          {new Date(play.updatedAt).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:bg-primary/10"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
