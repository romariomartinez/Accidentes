import { useEffect, useRef } from 'react';
import { Archive, Check, ChevronDown, ClipboardList, Eraser, Eye, FileDown, FileSignature, History, Printer, Save } from 'lucide-react';

export type AppModule = 'accident' | 'fomag' | 'history';

interface AppHeaderProps {
  savedAt: string;
  activeModule: AppModule;
  onModuleChange: (module: AppModule) => void;
  onSave: () => void;
  onClear: () => void;
  onPreview: () => void;
  onPrint: () => void;
  onPdf: () => void;
  onArchive: () => void;
  busy: boolean;
}

const modules = [
  { id: 'accident', label: 'Accidentes', icon: ClipboardList },
  { id: 'fomag', label: 'FOMAG', icon: FileSignature },
  { id: 'history', label: 'Historial', icon: History },
] as const;
const titles: Record<AppModule, string> = {
  accident: 'Declaración de accidente de tránsito',
  fomag: 'Consentimiento FOMAG',
  history: 'Historial de documentos',
};

export const AppHeader = ({ savedAt, activeModule, onModuleChange, onSave, onClear, onPreview, onPrint, onPdf, onArchive, busy }: AppHeaderProps) => {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) menu.current?.removeAttribute('open');
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.removeAttribute('open');
        menu.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  const action = (callback: () => void) => {
    menu.current?.removeAttribute('open');
    callback();
  };

  return (
    <header className="app-chrome app-header sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="border-b border-slate-100">
        <div className="header-brand-row mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <img src="/hospital-logo.bmp" alt="Hospital Camilo Villazón Pumarejo" className="h-11 w-28 shrink-0 object-contain" />
            <div className="hidden border-l border-slate-200 pl-4 sm:block">
              <p className="text-xs font-semibold text-hospital-navy">Hospital Camilo Villazón Pumarejo</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Gestión de documentos</p>
            </div>
          </div>
          <nav aria-label="Módulos" className="header-navigation flex gap-1 rounded-xl bg-slate-100/80 p-1">
            {modules.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" disabled={busy} aria-current={activeModule === id ? 'page' : undefined}
                onClick={() => action(() => onModuleChange(id))}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 md:px-4 md:text-sm ${activeModule === id ? 'bg-white text-hospital-navy shadow-sm' : 'text-slate-500 hover:bg-white/60 hover:text-hospital-navy'}`}>
                <Icon className="h-4 w-4" /><span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="header-toolbar mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight text-hospital-navy md:text-lg">{titles[activeModule]}</h1>
          {activeModule !== 'history' ? (
            <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500" title={savedAt ? `Último guardado local: ${new Date(savedAt).toLocaleTimeString('es-CO')}` : undefined}>
              <Check className="h-3 w-3 text-teal-600" />{busy ? 'Preparando documento…' : savedAt ? 'Borrador guardado automáticamente' : 'Guardado automático activado'}
            </p>
          ) : <p className="mt-1 text-xs text-slate-500">Consulte y recupere sus documentos guardados</p>}
        </div>
        {activeModule !== 'history' ? (
          <div className="header-document-actions flex items-center gap-2">
            <button type="button" onClick={onPrint} disabled={busy} className="btn-ghost border-slate-200 text-slate-600"><Printer className="h-4 w-4" />Imprimir</button>
            <button type="button" onClick={onPdf} disabled={busy} className="btn-primary"><FileDown className="h-4 w-4" /><span>Descargar PDF</span></button>
            <details ref={menu} className="header-more relative">
              <summary aria-disabled={busy} onClick={(event) => { if (busy) event.preventDefault(); }} className="inline-flex min-h-10 cursor-pointer list-none items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">Más<ChevronDown className="h-3.5 w-3.5" /></summary>
              <div className="header-action-menu absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                <button type="button" disabled={busy} onClick={() => action(onPreview)}><Eye />Vista previa ampliada</button>
                <button type="button" disabled={busy} onClick={() => action(onArchive)}><Archive />Guardar en historial</button>
                <button type="button" disabled={busy} onClick={() => action(onSave)}><Save />Guardar borrador ahora</button>
                <div className="my-1 border-t border-slate-100" />
                <button type="button" disabled={busy} onClick={() => action(onClear)} className="header-new-document"><Eraser />Iniciar documento nuevo</button>
              </div>
            </details>
          </div>
        ) : null}
      </div>
    </header>
  );
};
