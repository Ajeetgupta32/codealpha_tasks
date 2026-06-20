import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, Trash2, Download, Square, Circle, Type, Image as ImageIcon } from 'lucide-react';

const Whiteboard = ({ socket }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pencil'); // pencil, eraser, rect, circle, text
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth - 20;
      canvas.height = parent.clientHeight - 80;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    socket.on('draw-action', (data) => {
      const { type, x, y, lastX, lastY, color, width, text, startX, startY } = data;
      drawOnCanvas(ctx, type, x, y, lastX, lastY, color, width, text, startX, startY, false);
    });

    socket.on('clear-canvas', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      socket.off('draw-action');
      socket.off('clear-canvas');
    };
  }, [socket]);

  const drawOnCanvas = (ctx, type, x, y, lastX, lastY, color, width, text, startX, startY, emit = true) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    if (type === 'pencil' || type === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (type === 'rect') {
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (type === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (type === 'text') {
      ctx.font = `${width * 5}px var(--font-family)`;
      ctx.fillText(text, x, y);
    }

    if (emit) {
      socket.emit('draw-action', { type, x, y, lastX, lastY, color, width, text, startX, startY });
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setStartPos({ x: offsetX, y: offsetY });
    canvasRef.current.lastX = offsetX;
    canvasRef.current.lastY = offsetY;

    if (tool === 'text') {
      const text = prompt('Enter your text:');
      if (text) {
        const ctx = canvasRef.current.getContext('2d');
        drawOnCanvas(ctx, 'text', offsetX, offsetY, null, null, color, lineWidth, text);
      }
      setIsDrawing(false);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    
    // For shapes, we need to clear the temporary drawing or use a ghost layer
    // For simplicity in this demo, lines and eraser work in real-time, 
    // shapes only emit on mouseUp or we can clear/redraw.
    // Let's implement real-time feedback for pencil/eraser only.
    
    if (tool === 'pencil' || tool === 'eraser') {
      const drawColor = tool === 'eraser' ? '#0f172a' : color;
      const drawWidth = tool === 'eraser' ? 20 : lineWidth;
      drawOnCanvas(ctx, tool, offsetX, offsetY, canvasRef.current.lastX, canvasRef.current.lastY, drawColor, drawWidth);
      canvasRef.current.lastX = offsetX;
      canvasRef.current.lastY = offsetY;
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext('2d');

    if (tool === 'rect' || tool === 'circle') {
      drawOnCanvas(ctx, tool, offsetX, offsetY, null, null, color, lineWidth, null, startPos.x, startPos.y);
    }
    
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-canvas');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '5px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '10px' }}>
            <ToolBtn active={tool === 'pencil'} onClick={() => setTool('pencil')} icon={<Pencil size={18} />} />
            <ToolBtn active={tool === 'rect'} onClick={() => setTool('rect')} icon={<Square size={18} />} />
            <ToolBtn active={tool === 'circle'} onClick={() => setTool('circle')} icon={<Circle size={18} />} />
            <ToolBtn active={tool === 'text'} onClick={() => setTool('text')} icon={<Type size={18} />} />
            <ToolBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser size={18} />} />
          </div>
          
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '35px', height: '35px', border: 'none', background: 'transparent' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Width</span>
            <input 
              type="range" min="1" max="20" 
              value={lineWidth} 
              onChange={(e) => setLineWidth(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearCanvas} className="glass" style={{ width: '40px', height: '40px', color: 'var(--danger)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, background: '#0f172a', borderRadius: '15px', position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          style={{ cursor: tool === 'pencil' ? 'crosshair' : 'default' }}
        />
      </div>
    </div>
  );
};

const ToolBtn = ({ active, onClick, icon }) => (
  <button 
    onClick={onClick} 
    style={{ 
      width: '35px', height: '35px', borderRadius: '8px', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      padding: 0, color: 'white',
      background: active ? 'var(--primary)' : 'transparent' 
    }}
  >
    {icon}
  </button>
);

export default Whiteboard;
