/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/layout/Shell';
import { TooltipProvider } from './components/ui/tooltip';
import { useAuth } from './lib/AuthContext';
import LandingPage from './components/LandingPage';
import PublicResume from './components/preview/PublicResume';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/50"
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="/share/:resumeId" element={<PublicResume />} />
          <Route path="/" element={
            !user ? <LandingPage /> : <Shell />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TooltipProvider>
  );
}
