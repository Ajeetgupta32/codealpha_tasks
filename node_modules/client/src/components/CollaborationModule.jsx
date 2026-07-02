import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Hash, MessageSquare, Send, Paperclip, 
  Smile, Settings, 
  Lock, Bell
} from 'lucide-react';

const channels = [
  { id: 'general', name: 'general', locked: false },
];

const CollaborationModule = () => {
  const [activeChannel, setActiveChannel] = useState(channels[0]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2px', height: 'calc(100vh - 140px)', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden' }}
    >
      {/* Sidebar Channels */}
      <div style={{ background: 'rgba(5, 8, 22, 0.4)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Channels</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {channels.map(ch => (
              <ChannelItem 
                key={ch.id} 
                channel={ch} 
                active={activeChannel.id === ch.id} 
                onSelect={() => setActiveChannel(ch)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Direct Messages</h3>
          <div style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recent conversations.
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(2, 4, 10, 0.2)' }}>
        {/* Chat Header */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hash size={20} color="var(--text-muted)" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{activeChannel.name}</h4>
          </div>
          <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)' }}>
            <Bell size={20} />
            <Settings size={20} />
          </div>
        </div>

        {/* Messages Empty State */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px' }}>
          <div style={{ textAlign: 'center', maxWidth: '300px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
              <MessageSquare size={28} color="var(--text-muted)" style={{ opacity: 0.3 }} />
            </div>
            <h5 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Beginning of #{activeChannel.name}</h5>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>This is the start of the #{activeChannel.name} channel. Send a message to start the conversation.</p>
          </div>
        </div>

        {/* Input */}
        <div style={{ padding: '24px 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px 20px', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
            <Paperclip size={20} color="var(--text-muted)" />
            <input type="text" placeholder={`Message #${activeChannel.name}`} style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.95rem' }} />
            <Smile size={20} color="var(--text-muted)" />
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
            <Send size={20} color="var(--primary)" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChannelItem = ({ channel, active, onSelect }) => (
  <button 
    onClick={onSelect}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', borderRadius: '10px',
      background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
      color: active ? 'var(--primary-light)' : 'var(--text-muted)',
      fontWeight: '700', border: 'none', cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    {channel.locked ? <Lock size={14} /> : <Hash size={16} />}
    {channel.name}
  </button>
);

export default CollaborationModule;
