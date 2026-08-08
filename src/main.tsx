import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite HMR websocket connection errors - Generated from Mfon Akpabio
// Restored to prevent blank screen in sandbox preview environments where
// the Vite HMR WebSocket cannot establish a connection.
if (typeof window !== 'undefined') {
  const isWebsocketError = (err: any): boolean => {
    if (!err) return false;
    const msg = String(err.message || err.description || err || '');
    return (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('connection failed') ||
      msg.includes('WebSocket closed') ||
      msg.includes('[vite]')
    );
  };

  // Intercept and swallow console.error and console.warn calls from Vite's HMR client
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = args.map(arg => String(arg && arg.stack ? arg.stack : arg)).join(' ');
    if (isWebsocketError(msg)) {
      return;
    }
    originalError.apply(console, args);
  };

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = args.map(arg => String(arg)).join(' ');
    if (isWebsocketError(msg)) {
      return;
    }
    originalWarn.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (isWebsocketError(event.reason)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (isWebsocketError(event.message) || isWebsocketError(event.error)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

