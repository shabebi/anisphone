import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function Admin() {
  return (
    <main style={{ padding: 40, fontFamily: 'system-ui' }}>
      <p style={{ color: '#2563eb', fontWeight: 800 }}>ANIS PHONE ADMIN</p>
      <h1>Admin foundation is ready.</h1>
      <p>Dashboard and management modules will be added here.</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><Admin /></StrictMode>,
);
