````mermaid
classDiagram
    %% --- SCHICHT 1: API (Fassade) ---
    class PlaybookAPI {
        +loadFormation(presetId: string)
        +addRoute(playerId: string, nodes: RouteNode[])
        +undo()
        +redo()
    }

    %% --- SCHICHT 2: ORCHESTRATOR ---
    class PlaybookEngine {
        +loadFormation(presetId: string)
        +addRoute(playerId: string, nodes: RouteNode[])
        +undo()
    }

    %% --- SCHICHT 3: MANAGER ---
    class PlayManager {
        <<State Holder>>
        -Map~String, BaseEntity~ entities
        +addEntity(entity: BaseEntity)
        +removeEntity(id: string)
        +getEntity(id: string)
        +serializePlay()
        +loadPlay(data)
    }

    class CanvasManager {
        <<Renderer>>
        -fabric.Canvas canvas
        +addEntity(entity: BaseEntity)
        +removeEntity(entity: BaseEntity)
        +requestRenderAll()
    }

    class SelectionManager {
        <<State Holder>>
        -BaseEntity currentSelection
        +select(entity: BaseEntity)
        +clearSelection()
        +getCurrentSelection()
    }

    class FieldManager {
        <<Renderer>>
        +drawGrid()
        +drawHashmarks()
    }

    class HistoryManager {
        <<Command Invoker>>
        -ICommand[] undoStack
        -ICommand[] redoStack
        +execute(cmd: ICommand)
        +undo()
        +redo()
    }

    %% --- COMMAND PATTERN ---
    class ICommand {
        <<Interface>>
        +execute()
        +undo()
    }

    class LoadFormationCommand {
        +execute()
        +undo()
    }

    class MoveRouteCommand {
        +execute()
        +undo()
    }

    %% --- UTILS / BUILDER ---
    class FormationBuilder {
        <<Static>>
        +buildFromPreset(preset): PlayerEntity[]
    }

    class RouteDataBuilder {
        <<Static>>
        +presetToNodes(preset): RouteNode[]
    }

    %% --- ENTITIES ---
    class BaseEntity {
        <<Abstract>>
        +id: string
        +getFabricObjects(): fabric.Object[]
    }

    class PlayerEntity {
        +fabricObject: fabric.Group
        +route: RouteEntity
        +updatePosition(x, y)
    }

    class RouteEntity {
        +nodes: RouteNode[]
        +fabricObject: fabric.Path
        -handles: IControlHandle[]
        +initializeControls()
        +showControls()
        +hideControls()
        -updatePathVisuals()
    }

    %% --- CONTROL HANDLES ---
    class IControlHandle {
        <<Interface>>
        +setVisible(visible: boolean)
        +destroy()
        +onMoved(x, y)
        +onMoveComplete()
    }

    class WaypointHandle {
        -fabric.Circle shape
    }
    class BezierHandle {
        -fabric.Circle shape
        -fabric.Line tether
    }
    class StretchHandle {
        -fabric.Rect shape
    }

    %% --- BEZIEHUNGEN ---

    %% API to Engine
    PlaybookAPI --> PlaybookEngine : "delegiert Aufrufe"

    %% Engine owns Managers
    PlaybookEngine *-- PlayManager : "hält"
    PlaybookEngine *-- CanvasManager : "hält"
    PlaybookEngine *-- SelectionManager : "hält"
    PlaybookEngine *-- FieldManager : "hält"
    PlaybookEngine *-- HistoryManager : "hält"
    PlaybookEngine ..> FormationBuilder : "nutzt zur Datenwandlung"

    %% Command Pattern
    HistoryManager o-- ICommand : "verwaltet"
    ICommand <|.. LoadFormationCommand : "implementiert"
    ICommand <|.. MoveRouteCommand : "implementiert"
    ICommand ..> PlayManager : "verändert State"
    ICommand ..> CanvasManager : "verändert View"

    %% Managers and Entities
    PlayManager *-- BaseEntity : "speichert"
    CanvasManager ..> BaseEntity : "zieht Render-Objekte"
    SelectionManager --> BaseEntity : "triggert (z.B. showControls)"

    %% Entity Hierarchy
    BaseEntity <|-- PlayerEntity : "erbt"
    BaseEntity <|-- RouteEntity : "erbt"
    PlayerEntity o-- RouteEntity : "besitzt (optional)"

    %% Handle Composition
    RouteEntity *-- IControlHandle : "komponiert 1..n"
    IControlHandle <|.. WaypointHandle : "implementiert"
    IControlHandle <|.. BezierHandle : "implementiert"
    IControlHandle <|.. StretchHandle : "implementiert"

    RouteEntity ..> RouteDataBuilder : "nutzt zur SVG-Generierung"
    ```
````
