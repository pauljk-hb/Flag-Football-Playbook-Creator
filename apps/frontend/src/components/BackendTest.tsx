import { useState } from "react";

export function BackendTest() {
  const [status, setStatus] = useState<string>("Wartet auf Test...");

  const pingBackend = async () => {
    setStatus("Lade...");
    console.log("Lade Backend...");
    try {
      // Wir rufen den Health-Check-Endpunkt auf, den wir vorhin in der app.ts gebaut haben
      const response = await fetch("http://localhost:4000/api/health");
      console.log(response);

      if (!response.ok) throw new Error("Netzwerkantwort war nicht ok");

      const data = await response.json();
      setStatus(`✅ Erfolg! Backend sagt: "${data.message}"`);
    } catch (error) {
      setStatus("❌ Fehler: Backend ist nicht erreichbar. Läuft es?");
      console.error(error);
    }
  };

  return (
    <div
      style={{
        border: "2px dashed #4ade80",
        padding: "20px",
        margin: "20px",
        borderRadius: "8px",
      }}
    >
      <h3>🔌 Backend-Verbindungstest</h3>
      <button
        onClick={pingBackend}
        style={{ padding: "8px 16px", cursor: "pointer", marginBottom: "10px" }}
      >
        Ping Backend
      </button>
      <p>
        <strong>Status:</strong> {status}
      </p>
    </div>
  );
}
