/* ============================================
   WhiteboardCanvas.tsx — Shared Canvas Sketchpad
   Supports mouse drawing, clearing canvas, exporting PNG
   ============================================ */
import { useRef, useState, useEffect } from 'react';
import { Trash, Download, Palette, Square, Type, Pen } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useUserActivityStore } from '@/stores/userActivityStore';
import './WhiteboardCanvas.css';

export default function WhiteboardCanvas() {
  const { incrementWhiteboardSketches } = useUserActivityStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366F1');
  const [brushSize, setBrushSize] = useState(4);
  const { addToast } = useUIStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 500;

    // Fill canvas background
    ctx.fillStyle = '#050816';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
    incrementWhiteboardSketches();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050816';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    addToast({
      type: 'info',
      title: 'Canvas Cleared',
      message: 'All drawings have been wiped.',
    });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'codesphere_whiteboard.png';
    link.href = url;
    link.click();
    addToast({
      type: 'success',
      title: 'Whiteboard Exported',
      message: 'Drawing downloaded as PNG.',
    });
  };

  return (
    <div className="whiteboard-container">
      <div className="whiteboard-toolbar">
        <div className="toolbar-section">
          <button className="btn btn-secondary btn-icon" onClick={handleClear} title="Clear Drawing">
            <Trash size={14} />
          </button>
          <button className="btn btn-secondary btn-icon" onClick={handleExport} title="Download PNG">
            <Download size={14} />
          </button>
        </div>

        <div className="toolbar-section colors-picker">
          {['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#F1F5F9'].map((col) => (
            <button
              key={col}
              className={`color-dot ${color === col ? 'active' : ''}`}
              style={{ backgroundColor: col }}
              onClick={() => setColor(col)}
            />
          ))}
        </div>

        <div className="toolbar-section brush-size-wrapper">
          <span className="brush-label">Brush: {brushSize}px</span>
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="brush-range"
          />
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="whiteboard-canvas"
        />
      </div>
    </div>
  );
}
export { WhiteboardCanvas };
