import { useEffect, useState } from 'react';
import { PlaybookEngine } from '@playbook/core';
import './App.css';

function App() {
  const [engineStatus, setEngineStatus] = useState<string>("Lade Engine...");

  useEffect(() => {
    // Hier instanziieren wir unsere Engine aus dem Core-Paket
    const engine = new PlaybookEngine();
    setEngineStatus(engine.getStatus());
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>Playbook App</h1>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f0fdf4', 
        border: '1px solid #16a34a',
        borderRadius: '8px',
        display: 'inline-block'
      }}>
        <strong>Status:</strong> {engineStatus}
      </div>
      <p style={{ marginTop: '2rem', color: '#666' }}>
        Ändere den Text in der <code>PlaybookEngine.ts</code> im Core-Ordner 
        und speichere. Du solltest die Änderung hier sofort sehen!
      </p>
    </div>
  );
}

export default App;