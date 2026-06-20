import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
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

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Global Axios Configuration
axios.defaults.baseURL = 'http://localhost:5001';
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || 'Something went wrong';
    toast.error(message);
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await axios.post('/api/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

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
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
          <Route path="/*" element={user ? <MainApp /> : <Navigate to="/login" />} />
          <Route path="/room/:roomId" element={user ? <MeetingRoom /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
