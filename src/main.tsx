import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppShell } from './components/app/AppShell';
import { initializeIframeBridge } from './utils/iframeBridge';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

rootElement.setAttribute('tabindex', '-1');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
);

const teardownBridge = initializeIframeBridge(rootElement);

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    teardownBridge();
  });
}
