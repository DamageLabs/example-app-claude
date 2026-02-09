import { useState, useEffect } from 'react';

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>CellarSync</h1>
      <p>Wine Collection Inventory Management</p>
      {health ? (
        <div style={{ padding: '1rem', background: '#f0f9f0', borderRadius: '8px', marginTop: '1rem' }}>
          <p>API Status: {health.status}</p>
          <p>Version: {health.version}</p>
        </div>
      ) : (
        <p style={{ color: '#999', marginTop: '1rem' }}>Connecting to API...</p>
      )}
    </div>
  );
}
