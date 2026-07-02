import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Mail, 
  Phone, Globe, MapPin
} from 'lucide-react';

const ContactsModule = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Team Contacts</h2>
        <button className="btn-primary" style={{ padding: '10px 20px' }}>Add Contact</button>
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search team..." className="glass" style={{ width: '100%', padding: '12px 16px 12px 48px', border: '1px solid var(--glass-border)' }} />
        </div>
        <button className="glass" style={{ padding: '12px 20px' }}><Filter size={18} /></button>
      </div>

      {/* Empty State */}
      <div className="glass" style={{ padding: '80px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Users size={32} color="var(--text-muted)" style={{ opacity: 0.3 }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Your Team is Empty</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Invite members to your workspace to start collaborating.</p>
        </div>
        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Invite Members</button>
      </div>
    </motion.div>
  );
};

export default ContactsModule;
