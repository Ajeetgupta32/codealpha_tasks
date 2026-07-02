import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './components/Login';
import Register from './components/Register';
import MeetingRoom from './components/MeetingRoom';
import WorldClassPreloader from './components/Preloader';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MeetingsModule from './components/MeetingsModule';
import SettingsModule from './components/SettingsModule';
import ContactsModule from './components/ContactsModule';
import CollaborationModule from './components/CollaborationModule';
import FilesModule from './components/FilesModule';
import AnalyticsModule from './components/AnalyticsModule';
import AdminModule from './components/AdminModule';
import { AuthProvider, useAuth } from './context/AuthContext';

// Global Axios Configuration
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || '';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) return null; // Or a simple spinner

  const MainApp = () => {
    const navigate = useNavigate();
    return (
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                onCreateMeeting={() => navigate(`/room/${Math.random().toString(36).substring(7)}`)} 
                onJoinMeeting={() => {
                  const id = prompt('Enter Room ID:');
                  if (id) navigate(`/room/${id}`);
                }}
              />
            )}
            {activeTab === 'meetings' && (
              <MeetingsModule onCreateMeeting={() => navigate(`/room/${Math.random().toString(36).substring(7)}`)} />
            )}
            {activeTab === 'contacts' && <ContactsModule />}
            {activeTab === 'collaboration' && <CollaborationModule />}
            {activeTab === 'files' && <FilesModule />}
            {activeTab === 'analytics' && <AnalyticsModule />}
            {activeTab === 'settings' && <SettingsModule />}
            {activeTab === 'admin' && <AdminModule />}
          </motion.div>
        </AnimatePresence>
      </Layout>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && (
          <motion.div 
            key="world-preloader"
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(30px)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 10001 }}
          >
            <WorldClassPreloader onComplete={() => setShowPreloader(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/room/:roomId" element={user ? <MeetingRoom /> : <Navigate to="/login" />} />
          <Route path="/*" element={user ? <MainApp /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
