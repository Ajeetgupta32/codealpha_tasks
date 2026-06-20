import React, { useState, useEffect, useRef } from 'react';
import { Send, File, Paperclip, Download } from 'lucide-react';
import { useAuth } from '../App';
import CryptoJS from 'crypto-js';

const Chat = ({ socket, peers, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const { user } = useAuth();
  const scrollRef = useRef();

  useEffect(() => {
    socket.on('receive-message', (data) => {
      if (data.type === 'text' && data.encrypted) {
        try {
          const bytes = CryptoJS.AES.decrypt(data.text, roomId);
          data.text = bytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
          data.text = '[Encrypted Message]';
        }
      }
      setMessages(prev => [...prev, data]);
    });
    return () => socket.off('receive-message');
  }, [socket, roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMsg.trim()) {
      const encryptedText = CryptoJS.AES.encrypt(inputMsg, roomId).toString();
      const msgData = {
        text: encryptedText,
        type: 'text',
        encrypted: true
      };
      socket.emit('send-message', msgData);
      setInputMsg('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const msgData = {
          fileName: file.name,
          fileData: reader.result,
          type: 'file'
        };
        socket.emit('send-message', msgData);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadFile = (data, name) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = name;
    link.click();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={20} /> Chat & Files
        </h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ 
            alignSelf: msg.sender === user.username ? 'flex-end' : 'flex-start',
            maxWidth: '80%'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: msg.sender === user.username ? 'right' : 'left' }}>
              {msg.sender} • {msg.time}
            </div>
            <div style={{ 
              background: msg.sender === user.username ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              padding: '12px 16px',
              borderRadius: '15px',
              borderBottomRightRadius: msg.sender === user.username ? '2px' : '15px',
              borderBottomLeftRadius: msg.sender === user.username ? '15px' : '2px',
            }}>
              {msg.type === 'text' ? (
                <span>{msg.text}</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <File size={18} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{msg.fileName}</div>
                    <button 
                      onClick={() => downloadFile(msg.fileData, msg.fileName)}
                      style={{ background: 'transparent', padding: '5px 0', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: '20px', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <Paperclip size={20} />
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        <input 
          type="text" 
          value={inputMsg} 
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '0 15px', color: 'white', outline: 'none' }}
        />
        <button type="submit" className="btn-primary" style={{ width: '45px', height: '45px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 0 }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

const MessageSquare = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

export default Chat;
