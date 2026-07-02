import React from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Plus, Calendar, Clock, Users, 
  ArrowUpRight, MoreVertical, Search, Zap, 
  MessageSquare, FileText, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', hours: 0 },
  { name: 'Tue', hours: 0 },
  { name: 'Wed', hours: 0 },
  { name: 'Thu', hours: 0 },
  { name: 'Fri', hours: 0 },
  { name: 'Sat', hours: 0 },
  { name: 'Sun', hours: 0 },
];

const Dashboard = ({ onCreateMeeting, onJoinMeeting }) => {
  const now = new Date();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      {/* Hero Welcome Section */}
      <div className="glass" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.04em' }}>
              Welcome back, <span className="gradient-text">Creator</span> 👋
            </h1>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
            You have <span style={{ color: 'var(--primary-light)', fontWeight: '700' }}>3 meetings</span> scheduled for today. Your productivity is up <span style={{ color: 'var(--accent)', fontWeight: '700' }}>12%</span> this week.
          </p>
        </div>
        
        {/* Background Accents */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15 }}></div>
      </div>

      {/* Quick Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <ActionCard 
          icon={<Plus size={28} />} 
          label="New Meeting" 
          desc="Start instantly" 
          color="var(--primary)" 
          onClick={onCreateMeeting}
        />
        <ActionCard 
          icon={<Video size={28} />} 
          label="Join Meeting" 
          desc="Via link or ID" 
          color="var(--accent)" 
          onClick={onJoinMeeting}
        />
        <ActionCard 
          icon={<Calendar size={28} />} 
          label="Schedule" 
          desc="Plan your week" 
          color="var(--warning)" 
        />
        <ActionCard 
          icon={<Zap size={28} />} 
          label="Templates" 
          desc="Workflow quickstart" 
          color="var(--secondary)" 
        />
      </div>

      {/* Analytics & Meeting List */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Productivity Chart */}
        <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Productivity Trends</h3>
            <button className="glass" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: '700' }}>Last 7 Days</button>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming List */}
        <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Upcoming</h3>
            <ChevronRight size={20} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Calendar size={32} style={{ marginBottom: '10px', opacity: 0.2 }} />
              <p style={{ fontSize: '0.85rem' }}>No meetings scheduled for today.</p>
            </div>
          </div>
          <button className="glass" style={{ width: '100%', padding: '15px', fontWeight: '700', marginTop: 'auto' }}>View Calendar</button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StatItem label="Total Meetings" value="0" />
        <StatItem label="Recording Storage" value="0 GB" />
        <StatItem label="Team Members" value="1" />
        <StatItem label="Avg. Productivity" value="--" />
      </div>
    </motion.div>
  );
};

const ActionCard = ({ icon, label, desc, color, onClick }) => (
  <motion.button 
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className="glass"
    style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', cursor: 'pointer' }}
  >
    <div style={{ background: color, width: '56px', height: '56px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: `0 8px 16px ${color}44` }}>
      {React.cloneElement(icon, { color: 'white' })}
    </div>
    <div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{label}</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  </motion.button>
);

const MeetingRow = ({ time, title }) => (
  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
    <div style={{ minWidth: '70px', padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)', fontSize: '0.75rem', fontWeight: '800', textAlign: 'center' }}>
      {time}
    </div>
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <p style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
    </div>
  </div>
);

const StatItem = ({ label, value }) => (
  <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
    <h5 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{value}</h5>
  </div>
);

export default Dashboard;
