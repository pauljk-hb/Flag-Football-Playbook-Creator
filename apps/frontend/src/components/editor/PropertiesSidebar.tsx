import { Accordion } from "@/components/ui/accordion";
import { GeneralAccordionItem } from "./propertieSidebar/GeneralAccordionItem";
import { FormationAccordionItem } from "./propertieSidebar/FormationsAccordionItem";
import { FieldAccordionItem } from "./propertieSidebar/FieldAccordionItem";
import { RouteAccordionItem } from "./propertieSidebar/RouteAccordionItem";

export function PropertiesSidebar() {
  return (
    <aside className="w-100 border-l bg-card overflow-y-auto shrink-0">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">Eigenschaften</h2>
      </div>

      <Accordion defaultValue={["general"]} className="w-full">
        <GeneralAccordionItem />

        <FormationAccordionItem />

        <RouteAccordionItem />

        <FieldAccordionItem />
      </Accordion>
    </aside>
  );
}
