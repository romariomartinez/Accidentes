import { RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
}

export const SignaturePad = ({ value, onChange }: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 2.4;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#071f36';
    if (value) {
      const image = new Image();
      image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = value;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    return {
      x: event.clientX - (rect?.left ?? 0),
      y: event.clientY - (rect?.top ?? 0),
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-hospital-navy">Firma del usuario</span>
        <button type="button" className="btn-ghost min-h-8 px-2 py-1 text-xs" onClick={clearSignature}>
          <RotateCcw className="h-3.5 w-3.5" />
          Borrar firma
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-48 w-full touch-none rounded-md border border-dashed border-teal-300 bg-slate-50"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
      {!value ? <p className="mt-2 text-xs text-slate-500">Firme dentro del recuadro.</p> : null}
    </div>
  );
};
