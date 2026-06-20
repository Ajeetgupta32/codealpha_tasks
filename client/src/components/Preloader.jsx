import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import { Zap } from 'lucide-react';

const messages = [
  "Initializing Experience...",
  "Loading Innovation...",
  "Preparing Workspace...",
  "Almost Ready..."
];

const ParticleBackground = () => {
  const ref = useRef();
  
  // Manual particle generation for maximum stability
  const points = useMemo(() => {
    const p = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
        p[i * 3] = (Math.random() - 0.5) * 4;
        p[i * 3 + 1] = (Math.random() - 0.5) * 4;
        p[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.1;
      ref.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#6366f1"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const WorldClassPreloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, [onComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050816', zIndex: 10000, overflow: 'hidden' }}>
      {/* 3D Starfield Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
        </Canvas>
      </div>

      {/* Cinematic Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(5, 8, 22, 0.8) 100%)', zIndex: 1 }} />
      
      {/* Interactive Cursor Glow (CSS) */}
      <InteractiveGlow />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        
        {/* Animated Central Logo */}
        <div style={{ position: 'relative' }}>
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 50, duration: 1 }}
            style={{ 
              width: '120px', height: '120px', background: 'var(--primary)', 
              borderRadius: '30px', display: 'flex', justifyContent: 'center', 
              alignItems: 'center', boxShadow: '0 0 80px var(--primary-glow)',
              position: 'relative', zIndex: 5
            }}
          >
            <Zap size={60} color="white" fill="white" />
          </motion.div>

          {/* Energy Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ 
              position: 'absolute', inset: '-20px', border: '2px dashed var(--primary)', 
              borderRadius: '45px', opacity: 0.3 
            }} 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{ 
              position: 'absolute', inset: '-40px', border: '1px solid var(--secondary)', 
              borderRadius: '55px', opacity: 0.2 
            }} 
          />
        </div>

        {/* Brand Text */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{ marginTop: '40px', fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.06em', textShadow: '0 0 20px var(--primary-glow)' }}
        >
          ETHER
        </motion.h1>

        {/* Dynamic Loading Message */}
        <AnimatePresence mode="wait">
          <motion.p 
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }}
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Progress System */}
        <div style={{ marginTop: '60px', width: '300px', textAlign: 'center' }}>
          <div style={{ position: 'relative', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <motion.div 
              style={{ 
                position: 'absolute', left: 0, top: 0, height: '100%', 
                background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                width: `${progress}%`,
                boxShadow: '0 0 20px var(--primary)'
              }} 
            />
          </div>
          <p style={{ marginTop: '15px', fontSize: '1.2rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>
            {progress}%
          </p>
        </div>

      </div>

      <style>{`
        .netflix-sweep {
          position: absolute;
          width: 5px;
          height: 100vh;
          background: var(--primary);
          box-shadow: 0 0 100px var(--primary);
          left: -10%;
          animation: sweep 4s infinite linear;
          opacity: 0.3;
        }
        @keyframes sweep {
          from { left: -10%; }
          to { left: 110%; }
        }
      `}</style>
      <div className="netflix-sweep" />
      <div className="netflix-sweep" style={{ animationDelay: '2s', background: 'var(--secondary)', boxShadow: '0 0 100px var(--secondary)' }} />
    </div>
  );
};

const InteractiveGlow = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div style={{ 
      position: 'fixed', left: pos.x, top: pos.y, 
      width: '400px', height: '400px', 
      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 2
    }} />
  );
};

export default WorldClassPreloader;
