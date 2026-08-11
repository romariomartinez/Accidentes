import { Eraser, Save } from 'lucide-react';
import { PrintActions } from './PrintActions';

export type AppModule = 'accident' | 'fomag';

interface AppHeaderProps {
  savedAt: string;
  activeModule: AppModule;
  onModuleChange: (module: AppModule) => void;
  onSave: () => void;
  onClear: () => void;
  onPreview: () => void;
  onPrint: () => void;
}

export const AppHeader = ({
  savedAt,
  activeModule,
  onModuleChange,
  onSave,
  onClear,
  onPreview,
  onPrint,
}: AppHeaderProps) => (
  <header className="app-chrome sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-32 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
          <img src="/hospital-logo.bmp" alt="Hospital Camilo Villazon Pumarejo" className="max-h-full max-w-full object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-hospital-navy md:text-2xl">
            {activeModule === 'accident' ? 'Declaracion de Accidente de Transito' : 'Firmas Usuarios FOMAG'}
          </h1>
          <p className="text-sm text-slate-600">
            {activeModule === 'accident'
              ? 'Diligencie la informacion y revise el documento antes de imprimir'
              : 'Genere el consentimiento para imprimir y firmar a mano'}
          </p>
          <p className="mt-1 text-xs font-medium text-hospital-green">
            {savedAt ? `Cambios guardados ${new Date(savedAt).toLocaleTimeString('es-CO')}` : 'Borrador listo'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => onModuleChange('accident')}
            className={`rounded px-3 py-2 text-sm font-semibold ${activeModule === 'accident' ? 'bg-white text-hospital-navy shadow-sm' : 'text-slate-600'}`}
          >
            Accidente
          </button>
          <button
            type="button"
            onClick={() => onModuleChange('fomag')}
            className={`rounded px-3 py-2 text-sm font-semibold ${activeModule === 'fomag' ? 'bg-white text-hospital-navy shadow-sm' : 'text-slate-600'}`}
          >
            FOMAG
          </button>
        </div>

        <button type="button" onClick={onSave} className="btn-secondary">
          <Save className="h-4 w-4" />
          Guardar borrador
        </button>
        <button type="button" onClick={onClear} className="btn-ghost">
          <Eraser className="h-4 w-4" />
          Limpiar
        </button>
        <PrintActions onPreview={onPreview} onPrint={onPrint} />
      </div>
    </div>
  </header>
);
