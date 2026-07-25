import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export function PropertiesSidebar() {
  return (
    <aside className="w-80 border-l bg-card overflow-y-auto shrink-0">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">Eigenschaften</h2>
      </div>
      
      {/* Fix: type="multiple" entfernt */}
      <Accordion defaultValue={["general", "routes"]} className="w-full">
        <AccordionItem value="general" className="px-4">
          <AccordionTrigger className="text-sm hover:no-underline">Allgemein</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Play Name</label>
              <input 
                type="text" 
                defaultValue="" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Field>
      <FieldLabel htmlFor="textarea-message">Anmerkungen</FieldLabel>
      <Textarea id="textarea-message" placeholder="Anmerkungen..." />
    </Field>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="routes" className="px-4">
          <AccordionTrigger className="text-sm hover:no-underline">Routen-Optionen</AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-xs text-muted-foreground">
              Wähle eine Route auf dem Feld aus, um ihre Eigenschaften zu bearbeiten.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}