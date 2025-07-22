import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationContainer';
import Generator from './pages/Generator';
import Icons from './pages/Icons';
import Settings from './pages/Settings';
import Backup from './pages/Backup';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Generator />} />
                <Route path="/icons" element={<Icons />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/backup" element={<Backup />} />
              </Routes>
            </main>
          </div>
        </LanguageProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;