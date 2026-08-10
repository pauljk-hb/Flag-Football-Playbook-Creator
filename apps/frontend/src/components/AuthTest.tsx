import { useState } from "react";
import { signUp, signIn, useSession } from "../lib/auth-client"; // Achte darauf, dass der Pfad stimmt

export function AuthTest() {
  const [email, setEmail] = useState("test@playbook.com");
  const [password, setPassword] = useState("geheim123");
  const [name, setName] = useState("Coach");
  const [status, setStatus] = useState("");

  // React Hook von Better Auth: Aktualisiert sich vollautomatisch, wenn die Session sich ändert
  const { data: session } = useSession();

  const handleRegister = async () => {
    setStatus("Registriere...");
    const { data, error } = await signUp.email({ email, password, name });

    if (error) {
      setStatus(`❌ Fehler: ${error.message}`);
    } else {
      setStatus(`✅ Registriert als: ${data?.user.email}`);
    }
  };

  const handleLogin = async () => {
    setStatus("Logge ein...");
    const { data, error } = await signIn.email({ email, password });

    if (error) {
      setStatus(`❌ Fehler: ${error.message}`);
    } else {
      setStatus(`✅ Eingeloggt! Hallo ${data?.user.name}`);
    }
  };

  return (
    <div
      style={{
        border: "2px solid #3b82f6",
        padding: "20px",
        margin: "20px",
        borderRadius: "8px",
        maxWidth: "400px",
      }}
    >
      <h3>🏈 Playbook Auth Test</h3>

      {session ? (
        <div
          style={{
            backgroundColor: "#dcfce7",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "10px",
            color: "#166534",
          }}
        >
          <strong>Aktive Session:</strong> Du bist eingeloggt als{" "}
          {session.user.name} ({session.user.email})
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#fee2e2",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "10px",
            color: "#991b1b",
          }}
        >
          Kein User eingeloggt.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={{ padding: "8px" }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleRegister}
            style={{ flex: 1, padding: "8px", cursor: "pointer" }}
          >
            Registrieren
          </button>
          <button
            onClick={handleLogin}
            style={{ flex: 1, padding: "8px", cursor: "pointer" }}
          >
            Einloggen
          </button>
        </div>
      </div>

      {status && (
        <p style={{ marginTop: "10px" }}>
          <strong>Status:</strong> {status}
        </p>
      )}
    </div>
  );
}
