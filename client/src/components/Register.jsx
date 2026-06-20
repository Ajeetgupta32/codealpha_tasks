import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      toast.success('Your Ether workspace is ready');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card"
        style={{ maxWidth: '520px' }} // Slightly wider for register
      >
        <div className="auth-header">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            style={{ 
              background: 'linear-gradient(135deg, var(--accent), var(--primary))', 
              width: '64px', height: '64px', borderRadius: '18px', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' 
            }}
          >
            <UserPlus color="white" size={32} />
          </motion.div>
          <h2>Join Ether</h2>
          <p>Create your professional identity</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', 
              padding: '14px', borderRadius: '14px', textAlign: 'center', 
              fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)' 
            }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-field">
            <label>Display Name</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="John Doe" 
              required 
            />
          </div>
          <div className="form-field">
            <label>Work Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@ether.com" 
              required 
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Min. 8 characters" 
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary auth-btn" style={{ background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}>
            Launch Dashboard <ArrowRight size={20} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
