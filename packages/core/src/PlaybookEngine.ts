export class PlaybookEngine {
  private version: string = "0.1.0";

  constructor() {
    console.log("PlaybookEngine initialisiert!");
  }

  public getStatus(): string {
    return `Die Core-Engine (v${this.version}) läuft und ist mit dem Frontend verbunden! 🏈`;
  }
}