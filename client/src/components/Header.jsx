import React from 'react';
import { Bell, Search, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../App';

const Header = () => {
  const { user } = useAuth();

  return (
    <header 
      style={{ 
        height: '80px', padding: '0 40px', 
        display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', 
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5, 8, 22, 0.5)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '350px' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Search for meetings, files..."
          style={{ 
            width: '100%', height: '48px', 
            padding: '0 16px 0 48px', 
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '14px',
            color: 'white',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
        <button className="glass" style={{ padding: '10px', borderRadius: '12px', position: 'relative' }}>
          <Bell size={22} />
          <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--bg-dark)' }} />
        </button>
        
        <button className="glass" style={{ padding: '10px', borderRadius: '12px' }}>
          <Globe size={22} />
        </button>

        <div style={{ height: '32px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))' }} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>{user?.username}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin</p>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
};

export default Header;
