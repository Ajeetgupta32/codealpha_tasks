import React from 'react';
import { motion } from 'framer-motion';
import { 
  File, Folder, Upload, Search, 
  Grid, List as ListIcon
} from 'lucide-react';

const FilesModule = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Cloud Storage</h2>
          <p style={{ color: 'var(--text-muted)' }}>Secure file hosting for your enterprise team</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="glass" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Folder size={18} /> New Folder
          </button>
          <button className="btn-primary" style={{ padding: '10px 25px' }}>
            <Upload size={18} /> Upload
          </button>
        </div>
      </div>

      {/* Storage Analytics Row (Zeroed) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <StorageStat label="Documents" value="0 B" color="var(--primary)" progress={0} />
        <StorageStat label="Images" value="0 B" color="var(--accent)" progress={0} />
        <StorageStat label="Videos" value="0 B" color="var(--secondary)" progress={0} />
        <StorageStat label="Other" value="0 B" color="var(--warning)" progress={0} />
      </div>

      {/* Browser Empty State */}
      <div className="glass" style={{ padding: '100px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Folder size={36} color="var(--text-muted)" style={{ opacity: 0.3 }} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>No Files Uploaded</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Drag and drop files here to start building your workspace library.</p>
        </div>
        <button className="btn-primary" style={{ padding: '12px 30px' }}>Upload First File</button>
      </div>
    </motion.div>
  );
};

const StorageStat = ({ label, value, color, progress }) => (
  <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>{label}</p>
      <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{value}</span>
    </div>
    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${progress}%`, background: color, boxShadow: `0 0 10px ${color}55` }} />
    </div>
  </div>
);

export default FilesModule;
