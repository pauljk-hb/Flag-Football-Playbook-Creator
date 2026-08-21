import { ExportManager } from "@/managers/ExportManager";
import type { PlayImportData } from "@/types/interfaces";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const mockJsPdfInstance = {
    output: vi.fn().mockReturnValue(new Blob(["mock-pdf-blob"])),
    addPage: vi.fn(),
    addImage: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    rect: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
  };

  const jsPDFMock = vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mockJsPdfInstance);
  });

  return {
    mockJsPdfInstance,
    jsPDF: jsPDFMock,

    mockCanvasManager: {
      init: vi.fn(),
      getRawCanvas: vi.fn().mockReturnValue({}),
      generateThumbnail: vi.fn().mockReturnValue("mock-base64-image"),
      clear: vi.fn(),
    },
    mockPlayManager: {
      getAllEntities: vi.fn().mockReturnValue([]),
      getRouteByPlayerAndType: vi.fn(),
      addEntity: vi.fn(),
      removeEntity: vi.fn(),
      clearPlay: vi.fn(),
      exportPlay: vi.fn().mockReturnValue({ test: "play-data" }),
      loadPlay: vi.fn().mockReturnValue({ players: [], routes: [] }),
    },
    mockHistoryManager: {},
    mockNotificationManager: {},
    mockFieldManager: {},
  };
});

vi.mock("jspdf", () => ({
  jsPDF: mocks.jsPDF,
}));

vi.mock("@/managers/CanvasManager", () => ({
  CanvasManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockCanvasManager);
  }),
}));

vi.mock("@/managers/PlayManager", () => ({
  PlayManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockPlayManager);
  }),
}));

vi.mock("@/managers/FieldManager", () => ({
  FieldManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockFieldManager);
  }),
}));

vi.mock("@/history/HistoryManager", () => ({
  HistoryManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockHistoryManager);
  }),
}));

vi.mock("@/managers/NotificationManager", () => ({
  NotificationManager: vi.fn().mockImplementation(function (this: any) {
    Object.assign(this, mocks.mockNotificationManager);
  }),
}));

describe("ExportManager", () => {
  let exportManager: ExportManager;

  beforeEach(() => {
    vi.clearAllMocks();
    exportManager = new ExportManager();
  });

  describe("generatePDF()", () => {
    it("sollte ein PDF generieren und einen Blob zurückgeben (Happy Path)", async () => {
      const plays: (PlayImportData & { title?: string })[] = [
        { id: "play-1", title: "Test Play 1" } as any,
      ];

      // Act
      const result = await exportManager.generatePDF(plays);

      expect(mocks.jsPDF).toHaveBeenCalledWith({
        orientation: "landscape",
        unit: "mm",
        format: [135, 80],
      });

      // Assert: CanvasManager wurde initialisiert und Thumbnail abgefragt
      expect(mocks.mockCanvasManager.init).toHaveBeenCalled();
      expect(mocks.mockPlayManager.loadPlay).toHaveBeenCalledWith(plays[0]);
      expect(mocks.mockCanvasManager.generateThumbnail).toHaveBeenCalled();

      // Assert: Aufräumen (clear) wurde am Ende aufgerufen
      expect(mocks.mockPlayManager.clearPlay).toHaveBeenCalled();
      expect(mocks.mockCanvasManager.clear).toHaveBeenCalled();

      // Assert: PDF Renderer Methoden wurden aufgerufen
      expect(mocks.mockJsPdfInstance.addImage).toHaveBeenCalledTimes(1);
      expect(mocks.mockJsPdfInstance.rect).toHaveBeenCalledTimes(1);
      expect(mocks.mockJsPdfInstance.text).toHaveBeenCalledWith(
        "Test Play 1",
        expect.any(Number),
        expect.any(Number),
      );

      // Assert: Blob wurde zurückgegeben
      expect(mocks.mockJsPdfInstance.output).toHaveBeenCalledWith("blob");
      expect(result).toBeInstanceOf(Blob);
    });

    it('sollte Fallback-Titel ("Play X") nutzen, wenn kein title übergeben wurde', async () => {
      const plays: any[] = [{ id: "play-without-title" }];

      await exportManager.generatePDF(plays);

      expect(mocks.mockJsPdfInstance.text).toHaveBeenCalledWith(
        "Play 1",
        expect.any(Number),
        expect.any(Number),
      );
    });

    it("sollte Paginierung anwenden und addPage() aufrufen, wenn mehr Plays existieren als in ein Grid passen", async () => {
      const plays = Array.from({ length: 13 }).map(
        (_, i) => ({ id: `play-${i}` }) as any,
      );

      // Act
      await exportManager.generatePDF(plays);

      // Assert
      expect(mocks.mockJsPdfInstance.addPage).toHaveBeenCalledTimes(1);
      expect(mocks.mockJsPdfInstance.addImage).toHaveBeenCalledTimes(13);
    });
  });

  describe("Interne Geometrie & Layout (Private Methoden)", () => {
    it("sollte das GridLayout korrekt berechnen (calculateGridLayout)", () => {
      const margin = { top: 10, bottom: 10, left: 10, right: 10 };

      const layout = (exportManager as any).calculateGridLayout(
        100,
        100,
        2,
        2,
        margin,
        10,
      );

      expect(layout.cellWidth).toBe(35);
      expect(layout.cellHeight).toBe(35);
    });

    it("sollte renderHeader korrekt verarbeiten", () => {
      const layout = {
        margin: { top: 5, left: 10, right: 10 },
        pageWidth: 200,
      };

      (exportManager as any).renderHeader(
        mocks.mockJsPdfInstance,
        "Mein Playbook",
        1,
        5,
        layout,
      );

      expect(mocks.mockJsPdfInstance.text).toHaveBeenCalledWith(
        "Mein Playbook",
        10,
        9,
      );
      expect(mocks.mockJsPdfInstance.text).toHaveBeenCalledWith(
        "Seite 1 von 5",
        200 - 10 - 25,
        9,
      );
    });
  });

  describe("Headless Environment", () => {
    it("sollte ein Offscreen-Canvas mit berechneten Dimensionen erstellen", () => {
      const createElementSpy = vi.spyOn(document, "createElement");
      const layout = { imgWidth: 16, imgHeight: 9 }; // Aspect Ratio 16:9

      (exportManager as any).createHeadlessEnvironment(layout);

      // Assert: Element wurde erstellt
      expect(createElementSpy).toHaveBeenCalledWith("canvas");

      // Assert: Dimensionen anhand der BASE_WIDTH (1920) berechnet
      // 1920 / (16/9) = 1920 / 1.777... = 1080
      const canvasInstance = createElementSpy.mock.results[0].value;
      expect(canvasInstance.width).toBe(1920);
      expect(canvasInstance.height).toBe(1080);
    });
  });
});
