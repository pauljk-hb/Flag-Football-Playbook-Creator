import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { usePlaybookActions } from "@/hooks/usePlaybookActions";

export function RouteAccordionItem() {
  const { addRoute } = usePlaybookActions();

  return (
    <AccordionItem value="routes" className="px-4">
      <AccordionTrigger className="text-sm hover:no-underline">
        Route
      </AccordionTrigger>
      <AccordionContent className="pt-2 ">
        <p className="text-xs text-muted-foreground">System</p>
        <div className="mb-1 grid grid-cols-3 gap-2">
          {/* Kurz */}
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="1: Quick Out"
            onClick={() => addRoute.quickOut()}
          >
            Quick Out
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="2: Slant"
            onClick={() => addRoute.slant()}
          >
            Slant
          </Button>

          {/* Mittel / Lang */}
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="3: Hitch"
            onClick={() => addRoute.comeBack()}
          >
            Come Back
          </Button>

          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="4: In / Dig"
            onClick={() => addRoute.hitch()}
          >
            Hitch
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="5: Out"
            onClick={() => addRoute.out()}
          >
            Out
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="6: Comeback"
            onClick={() => addRoute.in()}
          >
            In
          </Button>

          {/* Tief */}
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="7: Post"
            onClick={() => addRoute.corner()}
          >
            Corner
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="8: Corner"
            onClick={() => addRoute.post()}
          >
            Post
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="9: Go / Fly"
            onClick={() => addRoute.go()}
          >
            Go
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="Over"
            onClick={() => addRoute.over()}
          >
            Over
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="Under"
            onClick={() => addRoute.under()}
          >
            Under
          </Button>
          <Button
            variant="secondary"
            className="h-24 text-xs"
            title="Weel"
            onClick={() => addRoute.weel()}
          >
            Weel
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
