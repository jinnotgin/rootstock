import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { App } from './app/index';

async function prepare() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./testing/mocks/browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
  }
}

prepare().then(() => {
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
