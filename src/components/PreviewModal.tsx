import { FileDown, Printer, X } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';
import { TrafficAccidentDeclaration } from '../types/declaration';

interface Props {
  open: boolean;
  data: TrafficAccidentDeclaration;
  onClose: () => void;
  onPrint: () => void;
}

export const PreviewModal = ({ open, data, onClose, onPrint }: Props) => {
  if (!open) return null;

  return (
    <div className="preview-modal fixed inset-0 z-40 overflow-auto bg-slate-900/80">
      <div className="app-chrome sticky top-0 z-10 flex flex-wrap items-center justify-end gap-2 border-b border-white/10 bg-hospital-navy px-4 py-3">
        <button type="button" onClick={onClose} className="btn-light">
          Volver a editar
        </button>
        <button type="button" onClick={onPrint} className="btn-light">
          <Printer className="h-4 w-4" />
          Imprimir
        </button>
        <button type="button" onClick={onPrint} className="btn-light">
          <FileDown className="h-4 w-4" />
          Guardar como PDF
        </button>
        <button type="button" onClick={onClose} className="btn-icon-light" aria-label="Cerrar">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex justify-center px-4 py-8">
        <DocumentPreview data={data} scale="full" />
      </div>
    </div>
  );
};
