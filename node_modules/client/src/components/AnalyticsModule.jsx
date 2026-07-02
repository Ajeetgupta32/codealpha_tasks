import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, Download, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  Tooltip, ResponsiveContainer
} from 'recharts';

const areaData = [
  { name: 'Jan', val: 0 }, { name: 'Feb', val: 0 },
  { name: 'Mar', val: 0 }, { name: 'Apr', val: 0 },
  { name: 'May', val: 0 }, { name: 'Jun', val: 0 },
];

const barData = [
  { name: 'Mon', active: 0, total: 0 },
  { name: 'Tue', active: 0, total: 0 },
  { name: 'Wed', active: 0, total: 0 },
  { name: 'Thu', active: 0, total: 0 },
  { name: 'Fri', active: 0, total: 0 },
];

const AnalyticsModule = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Platform Analytics</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real-time usage metrics and team productivity insights</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="glass" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} /> Date Range
          </button>
          <button className="btn-primary" style={{ padding: '10px 25px' }}>
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* Top Stats Cards (Zeroed) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StatCard label="Total Meetings" value="0" change="--" />
        <StatCard label="Active Participants" value="0" change="--" />
        <StatCard label="Avg. Duration" value="0m" change="--" />
        <StatCard label="User Sat." value="--" change="--" />
      </div>

      {/* Charts Row 1 (Zeroed) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass" style={{ padding: '30px', height: '400px' }}>
          <h3 style={{ marginBottom: '25px', fontSize: '1.2rem', fontWeight: '800' }}>Session Traffic Over Time</h3>
          <ResponsiveContainer width="100%" height="90%" minWidth={0}>
            <AreaChart data={areaData}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Area type="monotone" dataKey="val" stroke="var(--primary)" strokeWidth={3} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '25px', fontSize: '1.2rem', fontWeight: '800' }}>Engagement</h3>
          <ResponsiveContainer width="100%" height="90%" minWidth={0}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
              <Bar dataKey="total" fill="rgba(255,255,255,0.05)" radius={[10, 10, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, change, up }) => (
  <div className="glass" style={{ padding: '24px' }}>
    <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
      <h4 style={{ fontSize: '1.8rem', fontWeight: '900' }}>{value}</h4>
      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: up ? 'var(--accent)' : 'var(--text-muted)', marginBottom: '5px' }}>
        {change}
      </span>
    </div>
  </div>
);

export default AnalyticsModule;
