import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Eraser, Pencil, Trash2, Download, Square, Circle,
  Type, Minus, ArrowRight, Undo2, Redo2, Grid3x3
} from 'lucide-react';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#3b82f6', '#ffffff',
];

const STROKE_SIZES = [2, 4, 7, 12, 20];

const Whiteboard = ({ socket }) => {
  const mainCanvasRef = useRef(null);
  const tempCanvasRef = useRef(null);
  const containerRef  = useRef(null);

  const [tool,      setTool]      = useState('pencil');
  const [color,     setColor]     = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(4);
  const [showGrid,  setShowGrid]  = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Internal refs — no re-render needed
  const drawing   = useRef(false);
  const points    = useRef([]);
  const startPos  = useRef({ x: 0, y: 0 });
  const lastPos   = useRef({ x: 0, y: 0 });
  const history   = useRef([]);
  const histIdx   = useRef(-1);

  /* ─────────── HISTORY ─────────── */
  const saveState = useCallback(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    const snap  = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Truncate redo branch
    history.current = history.current.slice(0, histIdx.current + 1);
    history.current.push(snap);
    histIdx.current = history.current.length - 1;
    // Cap at 40 states
    if (history.current.length > 40) {
      history.current.shift();
      histIdx.current--;
    }
  }, []);

  const undo = useCallback(() => {
    if (histIdx.current <= 0) return;
    histIdx.current--;
    const ctx = mainCanvasRef.current.getContext('2d');
    ctx.putImageData(history.current[histIdx.current], 0, 0);
  }, []);

  const redo = useCallback(() => {
    if (histIdx.current >= history.current.length - 1) return;
    histIdx.current++;
    const ctx = mainCanvasRef.current.getContext('2d');
    ctx.putImageData(history.current[histIdx.current], 0, 0);
  }, []);

  /* ─────────── CANVAS SETUP ─────────── */
  const setupCanvases = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Save main canvas content before resize
    let savedData = null;
    if (mainCanvasRef.current && mainCanvasRef.current.width > 0) {
      savedData = mainCanvasRef.current.getContext('2d')
        .getImageData(0, 0, mainCanvasRef.current.width, mainCanvasRef.current.height);
    }

    [mainCanvasRef.current, tempCanvasRef.current].forEach(canvas => {
      if (!canvas) return;
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.lineCap              = 'round';
      ctx.lineJoin             = 'round';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    });

    if (savedData) {
      mainCanvasRef.current.getContext('2d').putImageData(savedData, 0, 0);
    }

    if (history.current.length === 0) saveState();
  }, [saveState]);

  /* ─────────── DRAWING HELPERS ─────────── */
  const drawArrow = (ctx, x1, y1, x2, y2, col, lw) => {
    const headLen = 14 + lw * 2;
    const angle   = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = col;
    ctx.fillStyle   = col;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLen * Math.cos(angle - Math.PI / 6),
      y2 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      x2 - headLen * Math.cos(angle + Math.PI / 6),
      y2 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();
  };

  const drawSmoothPath = (ctx, pts, col, lw, compositeOp = 'source-over') => {
    if (pts.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = compositeOp;
    ctx.strokeStyle = col;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
    ctx.restore();
  };

  const renderToMain = (type, data) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { color: col, width: lw, pts, startX, startY, endX, endY, text } = data;

    if (type === 'smooth-path') {
      drawSmoothPath(ctx, pts, col, lw);
    } else if (type === 'eraser-path') {
      drawSmoothPath(ctx, pts, col, lw, 'destination-out');
    } else if (type === 'rect') {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    } else if (type === 'circle') {
      const radius = Math.hypot(endX - startX, endY - startY);
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (type === 'line') {
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (type === 'arrow') {
      drawArrow(ctx, startX, startY, endX, endY, col, lw);
    } else if (type === 'text') {
      ctx.fillStyle = col;
      ctx.font = `${lw * 5}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillText(text.content, text.x, text.y);
    }

    saveState();
  };

  /* ─────────── SHAPE PREVIEW (temp canvas) ─────────── */
  const drawPreview = (x, y) => {
    const temp = tempCanvasRef.current;
    if (!temp) return;
    const ctx = temp.getContext('2d');
    ctx.clearRect(0, 0, temp.width, temp.height);
    const { x: sx, y: sy } = startPos.current;
    ctx.strokeStyle = color;
    ctx.fillStyle   = color;
    ctx.lineWidth   = lineWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    if (tool === 'rect') {
      ctx.strokeRect(sx, sy, x - sx, y - sy);
    } else if (tool === 'circle') {
      const r = Math.hypot(x - sx, y - sy);
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, 2 * Math.PI); ctx.stroke();
    } else if (tool === 'line') {
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x, y); ctx.stroke();
    } else if (tool === 'arrow') {
      drawArrow(ctx, sx, sy, x, y, color, lineWidth);
    }
  };

  /* ─────────── REMOTE SOCKET EVENTS ─────────── */
  useEffect(() => {
    setupCanvases();
    window.addEventListener('resize', setupCanvases);

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault(); redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const onDrawAction = ({ type, ...data }) => renderToMain(type, data);
    const onClearCanvas = () => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      saveState();
    };

    socket.on('draw-action',  onDrawAction);
    socket.on('clear-canvas', onClearCanvas);

    return () => {
      window.removeEventListener('resize',   setupCanvases);
      window.removeEventListener('keydown',  handleKeyDown);
      socket.off('draw-action',  onDrawAction);
      socket.off('clear-canvas', onClearCanvas);
    };
  }, [socket, setupCanvases, undo, redo, saveState]);

  /* ─────────── MOUSE HANDLERS ─────────── */
  const getXY = (e) => ({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });

  const handleMouseDown = (e) => {
    const { x, y } = getXY(e);
    startPos.current = { x, y };
    lastPos.current  = { x, y };
    points.current   = [{ x, y }];
    drawing.current  = true;
    setIsDrawing(true);

    if (tool === 'text') {
      drawing.current = false;
      setIsDrawing(false);
      const canvas  = mainCanvasRef.current;
      const canRect = canvas.getBoundingClientRect();
      const inputEl = document.createElement('input');
      Object.assign(inputEl.style, {
        position:   'fixed',
        left:       `${canRect.left + x}px`,
        top:        `${canRect.top  + y - 22}px`,
        background: 'rgba(15,23,42,0.95)',
        color,
        border:     `2px solid ${color}`,
        borderRadius: '6px',
        padding:    '4px 10px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize:   `${Math.max(14, lineWidth * 4)}px`,
        outline:    'none',
        minWidth:   '120px',
        zIndex:     '99999',
        boxShadow:  `0 0 12px ${color}55`,
      });
      document.body.appendChild(inputEl);
      inputEl.focus();

      const commit = () => {
        if (inputEl.value.trim()) {
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = color;
          ctx.font      = `${Math.max(14, lineWidth * 4)}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillText(inputEl.value, x, y);
          socket.emit('draw-action', {
            type: 'text', text: { content: inputEl.value, x, y }, color, width: lineWidth,
          });
          saveState();
        }
        if (document.body.contains(inputEl)) document.body.removeChild(inputEl);
      };
      inputEl.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter')  { ev.preventDefault(); commit(); }
        if (ev.key === 'Escape') { if (document.body.contains(inputEl)) document.body.removeChild(inputEl); }
      });
      inputEl.addEventListener('blur', commit);
    }
  };

  const handleMouseMove = (e) => {
    if (!drawing.current) return;
    const { x, y } = getXY(e);

    const canvas = mainCanvasRef.current;
    const ctx    = canvas.getContext('2d');

    if (tool === 'pencil') {
      points.current.push({ x, y });
      const pts = points.current;
      ctx.strokeStyle = color;
      ctx.lineWidth   = lineWidth;
      ctx.beginPath();
      if (pts.length >= 3) {
        const i = pts.length - 1;
        ctx.moveTo(
          (pts[i - 2].x + pts[i - 1].x) / 2,
          (pts[i - 2].y + pts[i - 1].y) / 2,
        );
        ctx.quadraticCurveTo(
          pts[i - 1].x, pts[i - 1].y,
          (pts[i - 1].x + pts[i].x) / 2,
          (pts[i - 1].y + pts[i].y) / 2,
        );
      } else {
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 4;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();
      points.current.push({ x, y });
    } else {
      drawPreview(x, y);
    }

    lastPos.current = { x, y };
  };

  const handleMouseUp = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    setIsDrawing(false);

    const x = e.nativeEvent?.offsetX ?? lastPos.current.x;
    const y = e.nativeEvent?.offsetY ?? lastPos.current.y;

    // Clear temp canvas
    const temp = tempCanvasRef.current;
    if (temp) temp.getContext('2d').clearRect(0, 0, temp.width, temp.height);

    const canvas = mainCanvasRef.current;
    const ctx    = canvas.getContext('2d');
    const { x: sx, y: sy } = startPos.current;

    if (tool === 'pencil') {
      socket.emit('draw-action', { type: 'smooth-path', pts: points.current, color, width: lineWidth });
    } else if (tool === 'eraser') {
      socket.emit('draw-action', { type: 'eraser-path', pts: points.current, width: lineWidth * 4 });
    } else if (tool === 'rect') {
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
      ctx.strokeRect(sx, sy, x - sx, y - sy);
      socket.emit('draw-action', { type: 'rect', startX: sx, startY: sy, endX: x, endY: y, color, width: lineWidth });
    } else if (tool === 'circle') {
      const r = Math.hypot(x - sx, y - sy);
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, 2 * Math.PI); ctx.stroke();
      socket.emit('draw-action', { type: 'circle', startX: sx, startY: sy, endX: x, endY: y, color, width: lineWidth });
    } else if (tool === 'line') {
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x, y); ctx.stroke();
      socket.emit('draw-action', { type: 'line', startX: sx, startY: sy, endX: x, endY: y, color, width: lineWidth });
    } else if (tool === 'arrow') {
      drawArrow(ctx, sx, sy, x, y, color, lineWidth);
      socket.emit('draw-action', { type: 'arrow', startX: sx, startY: sy, endX: x, endY: y, color, width: lineWidth });
    }

    points.current = [];
    saveState();
  };

  const clearAll = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-canvas');
    saveState();
  };

  const downloadPNG = () => {
    const link       = document.createElement('a');
    link.download    = 'realconnect-whiteboard.png';
    link.href        = mainCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  /* ─────────── CURSOR ─────────── */
  const cursor =
    tool === 'eraser' ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${lineWidth * 4}' height='${lineWidth * 4}' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E") ${lineWidth * 2} ${lineWidth * 2}, cell`
    : tool === 'text'  ? 'text'
    : 'crosshair';

  /* ─────────── TOOLS CONFIG ─────────── */
  const TOOLS = [
    { id: 'pencil', icon: <Pencil   size={17} />, tip: 'Pen (smooth)' },
    { id: 'eraser', icon: <Eraser   size={17} />, tip: 'Eraser' },
    { id: 'line',   icon: <Minus    size={17} />, tip: 'Straight Line' },
    { id: 'arrow',  icon: <ArrowRight size={17} />, tip: 'Arrow' },
    { id: 'rect',   icon: <Square   size={17} />, tip: 'Rectangle' },
    { id: 'circle', icon: <Circle   size={17} />, tip: 'Circle' },
    { id: 'text',   icon: <Type     size={17} />, tip: 'Text (click canvas)' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
        padding: '10px 14px', background: 'rgba(0,0,0,0.25)',
        borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* Tools */}
        <div style={{ display: 'flex', gap: '3px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => setTool(t.id)} title={t.tip} style={{
              width: '34px', height: '34px', borderRadius: '7px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: tool === t.id ? 'var(--primary)' : 'transparent',
              color: tool === t.id ? 'white' : 'var(--text-muted)',
              transition: 'background 0.2s, color 0.2s, transform 0.15s',
              transform: tool === t.id ? 'scale(1.08)' : 'scale(1)',
            }}>
              {t.icon}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Color swatches */}
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {PRESET_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} title={c} style={{
              width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer',
              border: color === c ? '3px solid rgba(255,255,255,0.9)' : '2px solid rgba(255,255,255,0.2)',
              transform: color === c ? 'scale(1.25)' : 'scale(1)',
              transition: 'transform 0.15s, border 0.15s',
            }} />
          ))}
          <label title="Custom color" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.35)', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+</span>
          </label>
        </div>

        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Stroke sizes */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {STROKE_SIZES.map(s => (
            <button key={s} onClick={() => setLineWidth(s)} title={`Size ${s}`} style={{
              width: '32px', height: '32px', borderRadius: '7px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              background: lineWidth === s ? 'rgba(99,102,241,0.25)' : 'transparent',
              border: lineWidth === s ? '1px solid var(--primary)' : '1px solid transparent',
              transition: 'background 0.2s',
            }}>
              <div style={{ background: 'white', borderRadius: '50%', width: `${Math.min(s + 3, 18)}px`, height: `${Math.min(s + 3, 18)}px` }} />
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />

        {/* Undo / Redo */}
        {[
          { fn: undo, icon: <Undo2 size={16} />, tip: 'Undo (Ctrl+Z)' },
          { fn: redo, icon: <Redo2 size={16} />, tip: 'Redo (Ctrl+Y)' },
        ].map(({ fn, icon, tip }) => (
          <button key={tip} onClick={fn} title={tip} style={{
            width: '34px', height: '34px', borderRadius: '7px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'var(--text-muted)', transition: 'color 0.2s, background 0.2s',
          }}>
            {icon}
          </button>
        ))}

        {/* Right actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button onClick={() => setShowGrid(g => !g)} title="Toggle grid" style={{
            width: '34px', height: '34px', borderRadius: '7px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: showGrid ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: showGrid ? 'var(--primary)' : 'var(--text-muted)',
            border: showGrid ? '1px solid var(--primary)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>
            <Grid3x3 size={16} />
          </button>
          <button onClick={downloadPNG} title="Download PNG" style={{
            width: '34px', height: '34px', borderRadius: '7px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'var(--text-muted)',
          }}>
            <Download size={16} />
          </button>
          <button onClick={clearAll} title="Clear board" style={{
            width: '34px', height: '34px', borderRadius: '7px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'rgba(239,68,68,0.12)', color: 'var(--danger)',
          }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Canvas area ── */}
      <div
        ref={containerRef}
        style={{
          flex: 1, position: 'relative', borderRadius: '14px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)',
          backgroundImage: showGrid
            ? 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)'
            : 'none',
          backgroundSize: showGrid ? '30px 30px' : 'auto',
          backgroundColor: '#0b1120',
        }}
      >
        {/* Persistent drawing layer */}
        <canvas
          ref={mainCanvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ position: 'absolute', inset: 0, cursor }}
        />
        {/* Shape-preview layer (pointer-events off) */}
        <canvas
          ref={tempCanvasRef}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        />

        {/* Active tool badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(5,8,22,0.75)', backdropFilter: 'blur(12px)',
          padding: '4px 12px', borderRadius: '20px',
          fontSize: '0.7rem', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: '7px',
          border: '1px solid rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
          {TOOLS.find(t => t.id === tool)?.tip} · {lineWidth}px
          {isDrawing && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>● drawing</span>}
        </div>

        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(5,8,22,0.75)', backdropFilter: 'blur(12px)',
          padding: '4px 12px', borderRadius: '20px',
          fontSize: '0.7rem', color: 'var(--text-muted)',
          border: '1px solid rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }}>
          Ctrl+Z undo · Ctrl+Y redo
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
