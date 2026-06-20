import React from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Calendar, Clock, Plus, 
  Search, Filter, ChevronRight, MoreVertical, 
  Play, Download, Trash2, Link as LinkIcon
} from 'lucide-react';

const MeetingsModule = ({ onCreateMeeting }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Meetings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your workspace video conferences</p>
        </div>
        <button onClick={onCreateMeeting} className="btn-primary" style={{ padding: '12px 24px' }}>
          <Plus size={20} /> Create New Meeting
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
        <Tab active label="Upcoming" count={0} />
        <Tab label="Recent" count={0} />
        <Tab label="Templates" />
        <Tab label="Recordings" count={0} />
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search meetings..." className="glass" style={{ width: '100%', padding: '12px 16px 12px 48px', border: '1px solid var(--glass-border)', outline: 'none' }} />
        </div>
        <button className="glass" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Empty State */}
      <div className="glass" style={{ padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Video size={36} color="var(--text-muted)" style={{ opacity: 0.3 }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>No Meetings Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Get started by creating your first collaboration session.</p>
        </div>
        <button onClick={onCreateMeeting} className="btn-primary" style={{ padding: '10px 25px' }}>Start a Meeting</button>
      </div>
    </motion.div>
  );
};

const Tab = ({ label, count, active }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: '8px', 
    color: active ? 'var(--primary-light)' : 'var(--text-muted)', 
    fontWeight: '700', cursor: 'pointer', borderBottom: active ? '2px solid var(--primary)' : 'none',
    paddingBottom: '15px', marginBottom: '-17px'
  }}>
    {label}
    {count !== undefined && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>{count}</span>}
  </div>
);

export default MeetingsModule;
