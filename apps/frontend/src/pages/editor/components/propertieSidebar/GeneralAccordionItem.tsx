import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { PlayTags } from "../PlayTags";
import { Input } from "@/components/ui/input";
import type { Play } from "@/types/interface";

interface SidebarProps {
  play: Play;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (title: string) => void;
}

export function GeneralAccordionItem({
  play,
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
            value={play.name}
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
