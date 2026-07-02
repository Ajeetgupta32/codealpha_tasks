import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Line, Sphere } from '@react-three/drei';
import { Share2 } from 'lucide-react';
import * as THREE from 'three';

const messages = [
  "Synchronizing Nodes...",
  "establishing Secure Channels...",
  "Optimizing Real-Time Bridge...",
  "Welcome to RealConnect"
];

const ConnectionNetwork = () => {
  const ref = useRef();
  
  // Create a more "connected" network of points
  const points = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
        p[i * 3] = (Math.random() - 0.5) * 5;
        p[i * 3 + 1] = (Math.random() - 0.5) * 5;
        p[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.05;
      ref.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.008}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Subtle pulsing core */}
      <mesh scale={0.5}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.05} wireframe />
      </mesh>
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
          setTimeout(onComplete, 1200);
          return 100;
        }
        // Quadratic easing for a more natural feel
        const step = prev < 50 ? 1 : prev < 85 ? 0.7 : 0.4;
        return Math.min(100, prev + step);
      });
    }, 25);

    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, [onComplete]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', zIndex: 10000, overflow: 'hidden' }}>
      {/* 3D Global Connection Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 1.5] }}>
          <ambientLight intensity={0.5} />
          <ConnectionNetwork />
        </Canvas>
      </div>

      {/* Atmospheric Shaders & Glows */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, rgba(2, 6, 23, 0.95) 100%)', 
        zIndex: 1 
      }} />
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        
        {/* Central Brand Symbol */}
        <div style={{ position: 'relative' }}>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{ 
              width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '50%', display: 'flex', justifyContent: 'center', 
              alignItems: 'center', border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 0 50px rgba(59, 130, 246, 0.2)',
              position: 'relative', zIndex: 5
            }}
          >
            <Share2 size={40} color="#60a5fa" />
            
            {/* Pulsing Aura */}
            <motion.div 
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #3b82f6' }}
            />
          </motion.div>
        </div>

        {/* Brand Text Section */}
        <div style={{ marginTop: '50px', textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.1em' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ 
              fontSize: '3.5rem', fontWeight: '900', color: '#f8fafc',
              textTransform: 'uppercase', marginBottom: '10px'
            }}
          >
            Real<span style={{ color: '#3b82f6' }}>Connect</span>
          </motion.h1>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={msgIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.3em' }}
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Precision Progress Bar */}
        <div style={{ marginTop: '80px', width: '320px' }}>
          <div style={{ height: '2px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #2dd4bf)', boxShadow: '0 0 15px #3b82f6' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <span style={{ color: '#475569', fontSize: '0.7rem', fontWeight: '800' }}>ESTABLISHING LINK</span>
            <span style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>{Math.floor(progress)}%</span>
          </div>
        </div>

      </div>

      {/* Modern Scanline Effect */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', 
        zIndex: 2, backgroundSize: '100% 4px, 3px 100%', pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.2
      }} />
    </div>
  );
};

export default WorldClassPreloader;
