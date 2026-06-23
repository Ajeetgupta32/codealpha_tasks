import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import Whiteboard from './Whiteboard';
import Chat from './Chat';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, 
  ScreenShare, XCircle, Users, MessageSquare, 
  Edit3, PhoneOff, Copy, FileUp, Languages, Zap, MoreVertical
} from 'lucide-react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const MeetingRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [peers, setPeers] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('video'); // video, whiteboard, chat
  const [reactions, setReactions] = useState([]); 
  const [activeSpeakers, setActiveSpeakers] = useState({}); 
  const [videoBlur, setVideoBlur] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const userStream = useRef();
  const screenStream = useRef();

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    socketRef.current = io.connect(SOCKET_URL);
    
    // Get media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      userVideo.current.srcObject = stream;
      userStream.current = stream;

      socketRef.current.emit('join-room', { roomId, username: user.username, userId: user.id });

      socketRef.current.on('all-users', users => {
        const peers = [];
        users.forEach(otherUser => {
          const peer = createPeer(otherUser.socketId, socketRef.current.id, stream);
          peersRef.current.push({ peerID: otherUser.socketId, peer, username: otherUser.username });
          peers.push({ peerID: otherUser.socketId, peer, username: otherUser.username });
        });
        setPeers(peers);
      });

      socketRef.current.on('user-joined', payload => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({ peerID: payload.callerID, peer, username: payload.username });
        setPeers(prev => [...prev, { peerID: payload.callerID, peer, username: payload.username }]);
      });

      socketRef.current.on('receiving-returned-signal', payload => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        if (item) item.peer.signal(payload.signal);
      });

      socketRef.current.on('user-left', id => {
        const peerObj = peersRef.current.find(p => p.peerID === id);
        if (peerObj) peerObj.peer.destroy();
        const remainingPeers = peersRef.current.filter(p => p.peerID !== id);
        peersRef.current = remainingPeers;
        setPeers(remainingPeers);
      });

      socketRef.current.on('receive-reaction', (payload) => {
        const id = Math.random().toString(36).substr(2, 9);
        setReactions(prev => [...prev, { id, ...payload }]);
        setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 4000);
      });
    });

    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (e) => {
        const current = e.resultIndex;
        setTranscript(e.results[current][0].transcript);
      };
    }

    return () => {
      socketRef.current.disconnect();
      if (userStream.current) userStream.current.getTracks().forEach(t => t.stop());
    };
  }, [roomId, user]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => socketRef.current.emit('sending-signal', { userToSignal, callerID, signal, username: user.username }));
    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => socketRef.current.emit('returning-signal', { signal, callerID }));
    peer.signal(incomingSignal);
    return peer;
  }

  const toggleMic = () => { userStream.current.getAudioTracks()[0].enabled = !micOn; setMicOn(!micOn); };
  const toggleVideo = () => { userStream.current.getVideoTracks()[0].enabled = !videoOn; setVideoOn(!videoOn); };
  
  const shareScreen = async () => {
    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
        screenStream.current = stream;
        peersRef.current.forEach(p => p.peer.replaceTrack(userStream.current.getVideoTracks()[0], stream.getVideoTracks()[0], userStream.current));
        userVideo.current.srcObject = stream;
        stream.getVideoTracks()[0].onended = () => stopScreenShare();
        setScreenSharing(true);
      } catch (err) { console.error(err); }
    } else { stopScreenShare(); }
  };

  const stopScreenShare = () => {
    const videoTrack = userStream.current.getVideoTracks()[0];
    peersRef.current.forEach(p => p.peer.replaceTrack(screenStream.current.getVideoTracks()[0], videoTrack, userStream.current));
    userVideo.current.srcObject = userStream.current;
    screenStream.current.getTracks().forEach(t => t.stop());
    setScreenSharing(false);
  };

  const sendReaction = (emoji) => {
    socketRef.current.emit('send-reaction', emoji);
    const id = Math.random().toString(36).substr(2, 9);
    setReactions(prev => [...prev, { id, emoji, socketId: socketRef.current.id }]);
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 4000);
  };

  const leaveMeeting = () => navigate('/');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', padding: '15px' }}>
      
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass" 
        style={{ padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '10px' }}><Users size={18}/></div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Ether Live Session</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room Code: <span style={{ color: 'var(--primary)' }}>{roomId}</span></p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px' }}>
          <TabBtn active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon size={18} />} label="Video" />
          <TabBtn active={activeTab === 'whiteboard'} onClick={() => setActiveTab('whiteboard')} icon={<Edit3 size={18} />} label="Board" />
          <TabBtn active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare size={18} />} label="Chat" />
        </div>

        <button className="glass" style={{ width: '40px', height: '40px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <MoreVertical size={20} />
        </button>
      </motion.div>

      {/* Main Grid View */}
      <div style={{ flex: 1, display: 'flex', gap: '15px', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'video' ? (
              <motion.div 
                key="video"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={gridStyle}
              >
                {/* Local Video */}
                <div className="glass video-container" style={{
                  ...videoBoxStyle,
                  border: activeSpeakers[socketRef.current?.id] ? '3px solid var(--primary)' : '1.5px solid var(--glass-border)',
                  boxShadow: activeSpeakers[socketRef.current?.id] ? '0 0 30px var(--primary-glow)' : 'var(--glass-shadow)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <video muted ref={userVideo} autoPlay playsInline style={{
                    ...videoStyle,
                    filter: videoBlur ? 'blur(15px)' : 'none'
                  }} />
                  <div className="video-label">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: micOn ? '--accent' : '--danger' }} />
                    You ({user.username})
                  </div>
                  <FloatingReactions reactions={reactions} targetSocketId={socketRef.current?.id} />
                </div>

                {/* Remote Peers */}
                {peers.map(peer => (
                  <VideoCard 
                    key={peer.peerID} 
                    peer={peer.peer} 
                    username={peer.username} 
                    socketId={peer.peerID} 
                    isTalking={activeSpeakers[peer.peerID]}
                    onTalk={(talking) => setActiveSpeakers(p => ({...p, [peer.peerID]: talking}))}
                    reactions={reactions}
                  />
                ))}
              </motion.div>
            ) : activeTab === 'whiteboard' ? (
              <motion.div key="board" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass" style={{ height: '100%', padding: '15px' }}>
                <Whiteboard socket={socketRef.current} />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass" style={{ height: '100%', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                <Chat socket={socketRef.current} roomId={roomId} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Captions Overlay */}
          {captionsOn && transcript && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass" style={captionBarStyle}>
              <Languages size={18} color="var(--primary)" /> {transcript}
            </motion.div>
          )}
        </div>
      </div>

      {/* Control Bar - Premium Floating Design */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="glass" 
        style={{ marginTop: '15px', padding: '15px', display: 'flex', justifyContent: 'center', gap: '15px', alignSelf: 'center', width: 'auto', minWidth: '500px' }}
      >
        <ControlBtn active={micOn} onClick={toggleMic} icon={micOn ? <Mic size={22}/> : <MicOff size={22}/>} danger={!micOn} />
        <ControlBtn active={videoOn} onClick={toggleVideo} icon={videoOn ? <VideoIcon size={22}/> : <VideoOff size={22}/>} danger={!videoOn} />
        
        <div style={{ position: 'relative' }} className="reaction-group">
          <button className="glass" style={controlBtnStyle}>❤️</button>
          <div className="reaction-popover glass">
            {['❤️', '👍', '🔥', '😂', '👏', '😮'].map(e => <button key={e} onClick={() => sendReaction(e)} style={emojiBtnStyle}>{e}</button>)}
          </div>
        </div>

        <ControlBtn active={screenSharing} onClick={shareScreen} icon={<ScreenShare size={22}/>} primary={screenSharing} />
        <ControlBtn active={videoBlur} onClick={() => setVideoBlur(!videoBlur)} icon={<Zap size={22}/>} primary={videoBlur} />
        <ControlBtn active={captionsOn} onClick={() => {
            if (!recognition) return alert('Not supported');
            if (!captionsOn) recognition.start(); else recognition.stop();
            setCaptionsOn(!captionsOn);
          }} icon={<Languages size={22}/>} primary={captionsOn} />

        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 5px' }} />
        
        <button onClick={leaveMeeting} style={{ ...controlBtnStyle, background: 'var(--danger)', color: 'white', width: '60px' }}>
          <PhoneOff size={22} />
        </button>
      </motion.div>

      <style>{`
        .reaction-group:hover .reaction-popover { display: flex; animation: fadeUp 0.3s ease; }
        .reaction-popover { display: none; position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); padding: 12px; gap: 12px; border-radius: 20px; z-index: 100; }
        @keyframes floatEmoji {
          0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
          10% { opacity: 1; transform: translate(-50%, -20px) scale(1.3); }
          100% { transform: translate(-50%, -250px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const VideoCard = ({ peer, username, socketId, isTalking, onTalk, reactions }) => {
  const ref = useRef();
  useEffect(() => {
    peer.on('stream', stream => {
      ref.current.srcObject = stream;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const check = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        onTalk(avg > 12);
        requestAnimationFrame(check);
      };
      check();
    });
  }, [peer, onTalk]);

  return (
    <motion.div 
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass video-container" 
      style={{
        ...videoBoxStyle,
        border: isTalking ? '3px solid var(--primary)' : '1.5px solid var(--glass-border)',
        boxShadow: isTalking ? '0 0 30px var(--primary-glow)' : 'none',
        transition: 'all 0.4s ease'
      }}
    >
      <video playsInline autoPlay ref={ref} style={videoStyle} />
      <div className="video-label">{username}</div>
      <FloatingReactions reactions={reactions} targetSocketId={socketId} />
    </motion.div>
  );
};

const TabBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    background: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem'
  }}>
    {icon} {label}
  </button>
);

const ControlBtn = ({ active, onClick, icon, danger, primary }) => (
  <button onClick={onClick} style={{
    ...controlBtnStyle,
    background: danger ? 'rgba(239, 68, 68, 0.2)' : primary ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
    border: active ? '1.5px solid var(--primary)' : '1.5px solid transparent',
    color: danger ? 'var(--danger)' : active ? 'var(--primary)' : 'white',
    transform: active ? 'scale(1.05)' : 'scale(1)',
  }}>{icon}</button>
);

const FloatingReactions = ({ reactions, targetSocketId }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {reactions.filter(r => r.socketId === targetSocketId).map(r => (
      <div key={r.id} style={{ position: 'absolute', bottom: '20px', left: '50%', fontSize: '2.5rem', animation: 'floatEmoji 3s ease-out forwards' }}>{r.emoji}</div>
    ))}
  </div>
);

// Styles (same as before but some updates)
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '15px', height: '100%', overflowY: 'auto' };
const videoBoxStyle = { position: 'relative', aspectRatio: '16/9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const videoStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const captionBarStyle = { position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(2, 6, 23, 0.9)', padding: '12px 24px', borderRadius: '16px', border: '1px solid var(--glass-border)', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', maxWidth: '80%', zIndex: 10 };
const controlBtnStyle = { width: '54px', height: '54px', borderRadius: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0, transition: 'all 0.3s ease' };
const emojiBtnStyle = { background: 'transparent', fontSize: '1.8rem', padding: '5px', transition: 'transform 0.2s', border: 'none', cursor: 'pointer' };

export default MeetingRoom;
