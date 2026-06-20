import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Users, Globe, Database, 
  Activity, Settings, Lock, Server,
  AlertTriangle, CheckCircle2, MoreHorizontal
} from 'lucide-react';

const AdminModule = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Platform Control</h2>
          <p style={{ color: 'var(--text-muted)' }}>Global system administration and security monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="glass" style={{ padding: '10px 20px', color: 'var(--danger)', fontWeight: '700' }}>
            Emergency Stop
          </button>
          <button className="btn-primary" style={{ padding: '10px 25px' }}>
            System Audit
          </button>
        </div>
      </div>

      {/* System Health Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <HealthCard label="Global API" status="Operational" latency="24ms" />
        <HealthCard label="Media Clusters" status="Operational" latency="118ms" />
        <HealthCard label="Database Mesh" status="Syncing" latency="480ms" warning />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* User Management Preview */}
        <div className="glass" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '25px', fontSize: '1.2rem', fontWeight: '800' }}>Administrative Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <LogEntry user="SysAdmin" action="Updated Global Security Headers" time="15m ago" />
            <LogEntry user="Root" action="Provisioned AWS Cluster-4 (Mumbai)" time="1h ago" />
            <LogEntry user="SecurityBot" action="Blocked IP (192.168.1.1) - Brute Force" time="2h ago" warning />
          </div>
        </div>

        {/* Platform Overview */}
        <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Cluster Usage</h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '30px' }}>
            <AdminStat label="Compute Load" value="64%" icon={<Server size={20}/>} />
            <AdminStat label="Active Streams" value="842" icon={<Activity size={20}/>} />
            <AdminStat label="Storage Sync" value="99.9%" icon={<Database size={20}/>} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const HealthCard = ({ label, status, latency, warning }) => (
  <div className="glass" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '5px' }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: warning ? 'var(--warning)' : 'var(--accent)' }} />
        <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{status}</h4>
      </div>
    </div>
    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '700' }}>{latency}</span>
  </div>
);

const LogEntry = ({ user, action, time, warning }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      <div style={{ padding: '8px', borderRadius: '8px', background: warning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)' }}>
        {warning ? <AlertTriangle size={16} color="var(--warning)" /> : <ShieldCheck size={16} color="var(--primary)" />}
      </div>
      <div>
        <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{action}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User: <span style={{ color: 'white' }}>{user}</span></p>
      </div>
    </div>
    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{time}</span>
  </div>
);

const AdminStat = ({ label, value, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', color: 'var(--primary-light)' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>{label}</p>
        <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{value}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
        <div style={{ height: '100%', width: value, background: 'var(--primary)', borderRadius: '10px' }} />
      </div>
    </div>
  </div>
);

export default AdminModule;
