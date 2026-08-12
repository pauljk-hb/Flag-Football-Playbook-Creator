import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Play } from "@/types/interface";
import { PlayTags } from "../PlayTags";

interface SidebarProps {
  play: Play;
  playTitle: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (title: string) => void;
}

export function GeneralAccordionItem({
  play,
  playTitle,
  onTitleChange,
  description,
  onDescriptionChange,
}: SidebarProps) {
  return (
    <AccordionItem value="general" className="px-4">
      <AccordionTrigger className="text-sm hover:no-underline">
        Allgemein
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pt-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Play Name
          </label>
          <Input
            placeholder="Play Titel"
            value={playTitle}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Field>
            <label className="text-xs font-medium text-muted-foreground">
              Anmerkungen
            </label>
            <Textarea
              id="textarea-message"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Anmerkungen..."
            />
          </Field>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tags
          </label>
          <PlayTags play={play} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
