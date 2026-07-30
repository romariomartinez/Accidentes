import { Eye, FileDown, Printer } from 'lucide-react';

interface PrintActionsProps {
  onPreview: () => void;
  onPrint: () => void;
}

export const PrintActions = ({ onPreview, onPrint }: PrintActionsProps) => (
  <div className="flex flex-wrap gap-2">
    <button type="button" onClick={onPreview} className="btn-secondary">
      <Eye className="h-4 w-4" />
      Vista previa
    </button>
    <button type="button" onClick={onPrint} className="btn-primary">
      <Printer className="h-4 w-4" />
      Imprimir
    </button>
    <button type="button" onClick={onPrint} className="btn-green">
      <FileDown className="h-4 w-4" />
      Guardar PDF
    </button>
  </div>
);
