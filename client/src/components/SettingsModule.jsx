import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, Bell, Monitor, 
  Smartphone, CreditCard, ExternalLink, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsModule = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', icon: <User size={20} />, label: 'Profile' },
    { id: 'security', icon: <Shield size={20} />, label: 'Security' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { id: 'appearance', icon: <Monitor size={20} />, label: 'Appearance' },
    { id: 'billing', icon: <CreditCard size={20} />, label: 'Billing' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal profile and workspace preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '40px' }}>
        
        {/* Settings Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', 
                borderRadius: '14px', background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? '700' : '600', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s ease', textAlign: 'left'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="glass" style={{ padding: '40px' }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))' }} />
                  <button style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--primary)', padding: '8px', borderRadius: '50%', border: '4px solid var(--bg-dark)' }}>
                    <Camera size={16} color="white" />
                  </button>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{user?.username}</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Enterprise Administrator</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="form-field">
                  <label>Full Name</label>
                  <input className="glass" style={{ padding: '12px' }} value={user?.username} />
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <input className="glass" style={{ padding: '12px' }} value={user?.email} disabled />
                </div>
                <div className="form-field">
                  <label>Role</label>
                  <input className="glass" style={{ padding: '12px' }} value="Enterprise Admin" disabled />
                </div>
                <div className="form-field">
                  <label>Timezone</label>
                  <input className="glass" style={{ padding: '12px' }} value="UTC+5:30 (India Standard Time)" />
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                <button className="btn-primary" style={{ padding: '14px 28px' }}>Save Changes</button>
                <button className="glass" style={{ padding: '14px 28px' }}>Discard</button>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Smartphone size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3>Feature Coming Soon</h3>
              <p>We're currently perfecting the {activeTab} module for the enterprise upgrade.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsModule;
