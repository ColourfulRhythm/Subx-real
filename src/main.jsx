import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('Application starting...');
console.log('Environment variables check:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('VITE_SITE_URL:', import.meta.env.VITE_SITE_URL);
console.log('Mode:', import.meta.env.MODE);

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to render application:', error);
  document.getElementById('root').innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #f3f4f6;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        max-width: 32rem;
        width: 100%;
      ">
        <h2 style="
          color: #dc2626;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        ">Application Error</h2>
        <p style="
          color: #4b5563;
          margin-bottom: 1rem;
        ">${error.message}</p>
        <button
          onclick="window.location.reload()"
          style="
            background-color: #3b82f6;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            border: none;
            cursor: pointer;
          "
        >
          Reload Page
        </button>
      </div>
    </div>
  `;
}
