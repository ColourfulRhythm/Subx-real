import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';

console.log('🚀 Application starting...');
console.log('Environment variables check:');
console.log('VITE_SITE_URL:', import.meta.env.VITE_SITE_URL);
console.log('Mode:', import.meta.env.MODE);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
