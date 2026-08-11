import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Play } from "@/types/interface";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DeletePopUp } from "./DeletePopUp";

interface PlayCardProps {
  play: Play;
  onDelete: (playId: string) => void;
}

export function PlayCard({ play, onDelete }: PlayCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden cursor-pointer bg-muted"
      onClick={() => navigate(`/editor/${play.id}`)}
    >
      {play.thumbnail ? (
        <img
          src={play.thumbnail}
          alt={play.name}
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
        <div className="mb-1.5 flex flex-wrap gap-1 min-h-[20px]">
          {play.tags && play.tags.length > 0 ? (
            play.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 flex items-center gap-1 font-medium"
              >
                {tag.color && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                )}
                {tag.name}
              </Badge>
            ))
          ) : (
            <span className="text-[10px] text-transparent select-none">
              Keine Tags
            </span>
          )}
        </div>

        <CardTitle className="text-sm font-semibold line-clamp-2">
          {play.name}
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

        <div className="flex items-center gap-1">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <DeletePopUp play={play} onDelete={onDelete} />
          </AlertDialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:bg-primary/10"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
