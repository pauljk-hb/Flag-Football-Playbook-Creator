
classDiagram


class PlaybookAPI{
            -engine: PlaybookEngine
            +init() void
+dispose() void
+handleResize() void
+setMode() void
+addPlayer() void
+addRouteFromPreset() void
+startDrawingRoute() void
+stopDrawingRoute() void
+deleteSelectedObject() void
+loadFormation() void
+changeFieldPreset() void
+exportPlay() string
+generateThumbnail() string
+exportToPDF() Promise~Blob | null~
+loadPlay() void
+getAllSystemFormations() string[]
+getAllSystemRoutes() string[]
+getAllSystemFields() string[]
+undo() void
+redo() void
+canUndo() boolean
+canRedo() boolean
+subscribeToHistoryChanges() () =~ void
+subscribeToNotification() () =~ void
+subscribeToDrawingMode() () =~ void
        }
class PlaybookEngine{
            -historyManager: HistoryManager
-playManager: PlayManager
-canvasManager: CanvasManager
-exportManager: ExportManager
-selectionManager: SelectionManager
-fieldManager: FieldManager
-routeDrawingManager: RouteDrawingManager
-notificationManager: NotificationManager
-currentFieldPresetId: string
-mode: PlaybookMode
            +init() void
+dispose() void
+setMode() void
+getMode() PlaybookMode
+handleResize() void
+addPlayer() void
+addRouteFromPreset() void
+startDrawingRoute() void
+stopDrawingRoute() void
+deleteSelectedObject() void
+loadFormation() void
+changeFieldPreset() void
+exportPlay() string
+loadPlay() void
+getAllSystemRoutes() string[]
+getAllSystemFormations() string[]
+getAllSystemFields() string[]
+generateThumbnail() string
+exportToPDF() Promise~Blob | null~
+exportFormationThumbnail() string
+undo() void
+redo() void
+canUndo() boolean
+canRedo() boolean
+subscribeToHistoryChanges() () =~ void
+onNotification() () =~ void
+subscribeToDrawingMode() () =~ void
-removePlayer() void
-addRoute() void
-deleteRoute() void
        }
class BaseEntity{
            +id: string
            +getFabricObjects() FabricObject~Partial~FabricObjectProps~, SerializedObjectProps, ObjectEvents~[]*
+setSelectable() void*
+showControls() void*
+hideControls() void*
        }
IEntity<|..BaseEntity
class PlayerEntity{
            +fabricGroup: Group
-role: string
-style: PlayerStyle
-styleOverride: PlayerStyleOverride
+onMoveComplete?: ((playerId: string, startX: number, startY: number, endX: number, endY: number) =~ void)
-dragStartX: number
-dragStartY: number
            -setupEvents() void
+getFabricObjects() FabricObject~Partial~FabricObjectProps~, SerializedObjectProps, ObjectEvents~[]
+setSelectable() void
+setPosition() void
+showControls() void
+hideControls() void
+serialize() PlayerExportData
        }
BaseEntity<|--PlayerEntity
class RouteEntity{
            +playerId: string
+routeType: string
+nodes: RouteNode[]
+color: string
-fabricPath: Path~Partial~PathProps~, SerializedPathProps, ObjectEvents~
-arrowHead: Triangle~Partial~FabricObjectProps~, SerializedObjectProps, ObjectEvents~
-handles: IControlHandle[]
+onNodesModified?: ((routeId: string, oldNodes: RouteNode[], newNodes: RouteNode[]) =~ void)
-dragStartNodes: RouteNode[] | null
            -getPathStyleConfig() any
+getFabricObjects() FabricObject~Partial~FabricObjectProps~, SerializedObjectProps, ObjectEvents~[]
+setSelectable() void
+initializeControls() void
-fireModifiedEvent() void
+showControls() void
+hideControls() void
+destroyAllHandles() void
-updatePathVisuals() void
+translate() void
+applyNodes() void
-updateArrowPosition() void
+serialize() RouteExportData
        }
class RouteConfig {
            <<interface>>
            +id?: string
+playerId: string
+routeType: string
+nodes: RouteNode[]
+color: string
            
        }
BaseEntity<|--RouteEntity
class HistoryManager{
            -undoStack: ICommand[]
-redoStack: ICommand[]
-listeners: HistoryListener[]
            +subscribe() () =~ void
-notify() void
+execute() void
+undo() void
+redo() void
+clear() void
+canUndo() boolean
+canRedo() boolean
        }
class CanvasManager{
            -canvas: Canvas | null
+LOGICAL_WIDTH: number
+LOGICAL_HEIGHT: number
            +init() Canvas
+dispose() void
+handleResize() void
+requestRender() void
+getRawCanvas() Canvas
+addEntity() void
+removeEntity() void
+addFabricObject() void
+removeFabricObject() void
+clear() void
+generateThumbnail() string
+sendToBack() void
+bringObjectToFront() void
        }
class ExportManager{
            
            +generatePDF() Promise~Blob~
-getOrientation() "landscape" | "portrait"
-calculateGridLayout() GridLayout
-createHeadlessEnvironment() HeadlessEnvironment
-renderHeader() void
-generateCells() PlayCell[]
-renderTable() void
-renderCell() void
        }
class FieldManager{
            -fieldObjects: FabricObject~Partial~FabricObjectProps~, SerializedObjectProps, ObjectEvents~[]
-currentPresetId: string
-canvasManager: CanvasManager
            +getCurrentPresetId() string
+drawField() void
+clearField() void
        }
class NotificationManager{
            -listeners: ((notification: CoreNotification) =~ void)[]
            +subscribe() () =~ void
+sendFeedback() void
        }
class PlayManager{
            -entities: Map~string, BaseEntity~
-canvasManager: CanvasManager
-historyManager: HistoryManager
-fieldManager: FieldManager
-notificationManager: NotificationManager
            +addEntity() void
+removeEntity() void
+getEntity() T | undefined
+getAllEntities() BaseEntity[]
+getAllRoutesFromPlayer() RouteEntity[]
+getRouteByPlayerAndType() RouteEntity | undefined
+clearPlay() void
+exportPlay() PlaySavePayload
+loadPlay() #123; players: PlayerEntity[]; routes: RouteEntity[]; #125;
        }
class RouteDrawingManager{
            -isDrawing: boolean
-activePlayer: PlayerEntity | null
-routeType: string
-collectedNodes: RouteNode[]
-previewPath: Path~Partial~PathProps~, SerializedPathProps, ObjectEvents~ | null
+onDrawingComplete?: ((player: PlayerEntity, nodes: RouteNode[], routeType: string) =~ void)
-stateListeners: ((isDrawing: boolean) =~ void)[]
-handleMouseMove: (options: any) =~ void
-handleMouseDown: (options: any) =~ void
-handleFinish: () =~ void
-handleKeyDown: (e: KeyboardEvent) =~ void
-canvasManager: CanvasManager
-selectionManager: SelectionManager
            +onStateChange() () =~ void
-notifyStateChange() void
+startDrawing() void
-bindEvents() void
-unbindEvents() void
-getPointer() #123; x: number; y: number; #125; | null
-updatePreviewPath() void
+cancelDrawing() void
-stopDrawing() void
-toggleCanvasInteractions() void
        }
class SelectionManager{
            -canvasManager: CanvasManager
-playManager: PlayManager
            +setupSelectionEvents() void
+hideAllRouteControls() void
+getSelectedObject() BaseEntity | null
+clearCurrentSelection() void
+setInteractionsEnabled() void
        }
class IEntity {
            <<interface>>
            +id: string
            +getFabricObjects() FabricObject~Partial~FabricObjectProps~, SerializedObjectProps, ObjectEvents~[]
        }
class PDFExportOptions {
            <<interface>>
            +pageWidth?: number
+pageHeight?: number
+columns?: number
+rows?: number
+playbookTitle?: string
+margin?: Margin
+gap?: number
            
        }
class Margin {
            <<interface>>
            +top: number
+bottom: number
+left: number
+right: number
            
        }
class GridLayout {
            <<interface>>
            +cellWidth: number
+cellHeight: number
+imgWidth: number
+imgHeight: number
+titleSpace: number
+headerHeight: number
+margin: Margin
+gap: number
+pageWidth: number
+pageHeight: number
            
        }
class HeadlessEnvironment {
            <<interface>>
            +canvasManager: CanvasManager
+playManager: PlayManager
+width: number
+height: number
            
        }
class PlayCell {
            <<interface>>
            +title: string
+imgData: string
            
        }
class ICommand {
            <<interface>>
            
            +execute() void
+undo() void
        }
class SavedPoint {
            <<interface>>
            +x: number
+y: number
            
        }
class RouteNode {
            <<interface>>
            +x: number
+y: number
+type: SegmentType
+cpInX?: number
+cpInY?: number
+cpOutX?: number
+cpOutY?: number
            
        }
class PlayerStyleOverride {
            <<interface>>
            +color?: string
+label?: string
+showLabel?: boolean
+shape?: "circle" | "square"
            
        }
class PlayerStyle {
            <<interface>>
            +color: string
+label: string
+showLabels: boolean
+shape: "circle" | "square"
            
        }
class RouteExportData {
            <<interface>>
            +id: string
+playerId: string
+routeType: string
+color: string
+nodes: RouteNode[]
            
        }
class PlayerImportData {
            <<interface>>
            +id?: string
+role: string
+x: number
+y: number
+style: PlayerStyle
+styleOverride?: PlayerStyleOverride
            
        }
class PlayImportData {
            <<interface>>
            +fieldPresetId: string
+players: PlayerImportData[]
+routes: RouteExportData[]
            
        }
class PlayerExportData {
            <<interface>>
            +id: string
+role: string
+x: number
+y: number
+styleOverride?: PlayerStyleOverride
            
        }
class PlaySavePayload {
            <<interface>>
            +fieldPresetId: string
+players: PlayerExportData[]
+routes: RouteExportData[]
            
        }
class ThumbnailOptions {
            <<interface>>
            +format?: "png" | "jpeg" | "webp"
+quality?: number
+width?: number
            
        }
class CoreNotification {
            <<interface>>
            +level: LogLevel
+message: string
+messageKey?: string
            
        }
class SegmentType {
        <<enumeration>>
        STRAIGHT
CURVE
      }
class IPoint {
            <<interface>>
            +x: number
+y: number
            
        }
class BoundingBox {
            <<interface>>
            +minX: number
+maxX: number
+minY: number
+maxY: number
+width: number
+height: number
            
        }
class PolylineMetrics {
            <<interface>>
            +width: number
+height: number
+pathOffset: IPoint
+dx: number
+dy: number
            
        }
class RoutePreset {
            <<interface>>
            +id: string
+name: string
+waypoints: #123; dx: number; dy: number; type: SegmentType; cpInDx?: number | undefined; cpInDy?: number | undefined; #125;[]
+breakDirection?: "inside" | "outside" | "straight"
            
        }
class FormationPreset {
            <<interface>>
            +id: string
+name: string
+thumbnail?: string
+positions: FormationPosition[]
            
        }
class FormationPosition {
            <<interface>>
            +playerPresetId: string
+dx: number
+dy: number
            
        }
class FieldLineConfig {
            <<interface>>
            +yardsFromLos: number
+type: "los" | "yardline" | "endzone"
            
        }
class FieldPreset {
            <<interface>>
            +id: string
+name: string
+lines: FieldLineConfig[]
+anchor: #123; x: number; y: number; #125;
            
        }
class FormationBuilder{
            
            +build() PlayerImportData[]$
        }
class WaypointHandle{
            +circle: Circle~Partial~CircleProps~, SerializedCircleProps, ObjectEvents~
+onMoved?: ((x: number, y: number) =~ void)
+onMoveComplete?: (() =~ void)
-bezierHandles: BezierHandle[]
-canvas: Canvas
            +attachBezier() void
-setupEvents() void
+show() void
+hide() void
+destroy() void
        }
class BezierHandle{
            +controlPoint: Circle~Partial~CircleProps~, SerializedCircleProps, ObjectEvents~
-tetherLine: Line~Partial~FabricObjectProps~, SerializedLineProps, ObjectEvents~
+onMoved?: ((x: number, y: number) =~ void)
+onMoveComplete?: (() =~ void)
-canvas: Canvas
            -setupEvents() void
+updateAnchorPosition() void
+show() void
+hide() void
+destroy() void
        }
class StretchHandle{
            +rect: Triangle~Partial~FabricObjectProps~, SerializedObjectProps, ObjectEvents~
+onMoved?: ((x: number, y: number) =~ void)
+onMoveComplete?: (() =~ void)
-canvas: Canvas
            -setupEvents() void
+show() void
+hide() void
+destroy() void
        }
class IControlHandle {
            <<interface>>
            +onMoved?: ((newX: number, newY: number) =~ void)
+onMoveComplete?: (() =~ void)
            +show() void
+hide() void
+destroy() void
        }
IControlHandle<|..WaypointHandle
IControlHandle<|..BezierHandle
IControlHandle<|..StretchHandle
class AddPlayerCommand{
            -playerEntity: PlayerEntity
-canvasMngr: CanvasManager
-playMngr: PlayManager
            +execute() void
+undo() void
        }
ICommand<|..AddPlayerCommand
class AddRouteCommand{
            -player: PlayerEntity
-newRouteEntity: RouteEntity
-playManager: PlayManager
-canvasManager: CanvasManager
-oldRouteEntity: RouteEntity | null
            +execute() void
+undo() void
        }
ICommand<|..AddRouteCommand
class LoadFormationCommand{
            -previousPlayers: PlayerEntity[]
-newPlayers: PlayerEntity[]
-spawnData: PlayerImportData[]
-playManager: PlayManager
-canvasManager: CanvasManager
-historyManager: HistoryManager
-notificationManager: NotificationManager
            +execute() void
+undo() void
        }
ICommand<|..LoadFormationCommand
class MovePlayerCommand{
            -dx: number
-dy: number
-playerId: string
-startX: number
-startY: number
-endX: number
-endY: number
-playMngr: PlayManager
-canvasMngr: CanvasManager
-notificationManager: NotificationManager
            +execute() void
+undo() void
        }
class MoveRouteCommand{
            -oldNodes: RouteNode[]
-newNodes: RouteNode[]
-routeId: string
-playMngr: PlayManager
-canvasMngr: CanvasManager
-notificationManager: NotificationManager
            +execute() void
+undo() void
        }
ICommand<|..MovePlayerCommand
ICommand<|..MoveRouteCommand
class RemovePlayerCommand{
            -player: PlayerEntity
-routes: RouteEntity[]
-playerId: string
-playMngr: PlayManager
-canvasMngr: CanvasManager
-notificationManager: NotificationManager
            +execute() void
+undo() void
        }
ICommand<|..RemovePlayerCommand
class RemoveRouteCommand{
            -route: RouteEntity
-player: PlayerEntity
-routeId: string
-playMngr: PlayManager
-canvasMngr: CanvasManager
-notificationManager: NotificationManager
            +execute() void
+undo() void
        }
ICommand<|..RemoveRouteCommand