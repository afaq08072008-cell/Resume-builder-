import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './lib/AuthContext';
import { ResumeProvider } from './ResumeContext';
import { AIProvider } from './lib/AIContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ResumeProvider>
        <AIProvider>
          <App />
        </AIProvider>
      </ResumeProvider>
    </AuthProvider>
  </StrictMode>,
);
