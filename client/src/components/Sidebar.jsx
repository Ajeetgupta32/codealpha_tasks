import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Video, Users, FileText, Settings, 
  PieChart, Bell, LogOut, Zap, Shield, HelpCircle, ChevronRight, MessageSquare
} from 'lucide-react';
import { useAuth } from '../App';

const Sidebar = ({ activeTab, setActiveTab, collapsed }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: <Home size={22} />, label: 'Dashboard' },
    { id: 'meetings', icon: <Video size={22} />, label: 'Meetings' },
    { id: 'contacts', icon: <Users size={22} />, label: 'Contacts' },
    { id: 'collaboration', icon: <MessageSquare size={22} />, label: 'Workspace' },
    { id: 'files', icon: <FileText size={22} />, label: 'Files' },
    { id: 'analytics', icon: <PieChart size={22} />, label: 'Analytics' },
    { id: 'admin', icon: <Shield size={22} />, label: 'Platform' },
  ];

  return (
    <motion.aside 
      animate={{ width: collapsed ? '90px' : '280px' }}
      className="glass"
      style={{ 
        margin: '15px', 
        borderRadius: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px', 
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        height: 'calc(100vh - 30px)' 
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px', padding: '0 8px' }}>
        <div style={{ 
          background: 'var(--primary)', minWidth: '42px', height: '42px', 
          borderRadius: '12px', display: 'flex', justifyContent: 'center', 
          alignItems: 'center', boxShadow: '0 8px 16px var(--primary-glow)' 
        }}>
          <Zap size={22} color="white" fill="white" />
        </div>
        {!collapsed && (
          <motion.h2 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.04em' }}
          >
            Ether
          </motion.h2>
        )}
      </div>

      {/* Nav Section */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', padding: '0 10px' }}>
          {!collapsed ? 'Main Menu' : '•••'}
        </p>
        
        {menuItems.map(item => (
          <NavButton 
            key={item.id}
            active={activeTab === item.id} 
            onClick={() => setActiveTab(item.id)}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}

        <div style={{ margin: '20px 0', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        
        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', padding: '0 10px' }}>
          {!collapsed ? 'Support' : '•••'}
        </p>
        <NavButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
          icon={<Settings size={22} />}
          label="Settings"
          collapsed={collapsed}
        />
        <NavButton 
          active={false} 
          onClick={() => {}}
          icon={<HelpCircle size={22} />}
          label="Help Center"
          collapsed={collapsed}
        />
      </nav>

      {/* User Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))' }} />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{user?.username}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Enterprise Plan</p>
            </div>
          </div>
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', marginBottom: '15px' }} />
        )}
        <button 
          onClick={logout} 
          className="glass" 
          style={{ 
            width: '100%', padding: '12px', color: 'var(--danger)', 
            fontSize: '0.9rem', fontWeight: '700', borderRadius: '12px',
            display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', alignItems: 'center', gap: '10px'
          }}
        >
          <LogOut size={18} /> {!collapsed && 'Log out'}
        </button>
      </div>
    </motion.aside>
  );
};

const NavButton = ({ active, icon, label, onClick, collapsed }) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 14px', borderRadius: '14px',
      background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
      color: active ? 'var(--primary-light)' : 'var(--text-muted)',
      fontWeight: active ? '700' : '600',
      transition: 'all 0.2s ease',
      border: active ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
      justifyContent: collapsed ? 'center' : 'flex-start',
      overflow: 'hidden'
    }}
  >
    <div style={{ color: active ? 'var(--primary)' : 'inherit' }}>{icon}</div>
    {!collapsed && <span style={{ fontSize: '0.95rem' }}>{label}</span>}
    {active && !collapsed && <motion.div layoutId="dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginLeft: 'auto' }} />}
  </button>
);

export default Sidebar;
