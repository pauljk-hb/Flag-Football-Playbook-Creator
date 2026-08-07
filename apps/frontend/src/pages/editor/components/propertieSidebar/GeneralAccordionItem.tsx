import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

interface SidebarProps {
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (title: string) => void;
}

export function GeneralAccordionItem({
  title,
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
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Field>
            <FieldLabel htmlFor="textarea-message">Anmerkungen</FieldLabel>
            <Textarea
              id="textarea-message"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Anmerkungen..."
            />
          </Field>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
