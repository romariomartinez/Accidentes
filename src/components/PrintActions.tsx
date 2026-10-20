import { Eye, FileDown, Printer } from 'lucide-react';

interface PrintActionsProps {
  onPreview: () => void;
  onPrint: () => void;
  onPdf: () => void;
  busy?: boolean;
}

export const PrintActions = ({ onPreview, onPrint, onPdf, busy }: PrintActionsProps) => (
  <div className="flex flex-wrap gap-2">
    <button type="button" onClick={onPreview} disabled={busy} className="btn-secondary">
      <Eye className="h-4 w-4" />
      Vista previa
    </button>
    <button type="button" onClick={onPrint} disabled={busy} className="btn-primary">
      <Printer className="h-4 w-4" />
      Imprimir
    </button>
    <button type="button" onClick={onPdf} disabled={busy} className="btn-green">
      <FileDown className="h-4 w-4" />
      Descargar PDF
    </button>
  </div>
);
