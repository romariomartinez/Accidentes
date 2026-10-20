import { HistoryPanel } from './components/HistoryPanel';
import { HistoryRecord, HistoryModule } from './types/history';
import { TrafficAccidentDeclaration } from './types/declaration';
import { FomagSignatureFormData } from './types/fomag';
import { HistoryAccessError, historyRequest, restoreReservation, saveHistory } from './utils/history';
import { WelcomeScreen } from './components/WelcomeScreen';
import { reserveNumber, waitForDocument } from './utils/centralNumber';
import { getMissingPrintFields } from './utils/validators';
import { useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { AccidentForm } from './components/AccidentForm';
import { AppHeader, AppModule } from './components/AppHeader';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DocumentPreview } from './components/DocumentPreview';
import { FomagSignatureModule } from './components/FomagSignatureModule';
import { PreviewModal } from './components/PreviewModal';
import { useDeclarationForm } from './hooks/useDeclarationForm';
import { useFomagSignatures } from './hooks/useFomagSignatures';
import { usePrint } from './hooks/usePrint';

const App = () => {
  const { form, data, savedAt, saveDraft, clearDraft, loadExample, restoreDeclaration } = useDeclarationForm();
  const fomag = useFomagSignatures();
  const { print } = usePrint();
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeModule, setActiveModule] = useState<AppModule>('accident');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [recordToOpen, setRecordToOpen] = useState<HistoryRecord | null>(null);
  const busyRef = useRef(false);
  const pendingAction = useRef<{ module: HistoryModule; action: 'save' | 'print' | 'pdf' } | null>(null);

  const runDocumentAction = async (module: HistoryModule, action: 'save' | 'print' | 'pdf'): Promise<boolean> => {
    if (busyRef.current) return false;
    busyRef.current = true; setBusy(true); setMissingFields([]); setNotice('');
    try {
      const activeForm = module === 'accident' ? form : fomag.form;
      if (!await activeForm.trigger()) throw new Error('Revise los campos obligatorios marcados en el formulario.');
      if (module === 'accident') {
        const missing = getMissingPrintFields(form.getValues());
        if (missing.length) throw new Error(`Complete: ${missing.join(', ')}.`);
      }
      const session = await historyRequest<{ authenticated: boolean; configured: boolean }>(undefined, '?action=session');
      if (!session.authenticated) {
        pendingAction.current = { module, action };
        setHistoryOpen(true);
        setPreviewOpen(false);
        setNotice('Ingrese la clave del historial para guardar el documento y continuar.');
        return false;
      }
      const number = await reserveNumber(module, module === 'accident' ? form.getValues('accident.declarationNumber') : fomag.form.getValues('recordNumber'));
      if (module === 'accident') { form.setValue('accident.declarationNumber', number); saveDraft(); }
      else { fomag.form.setValue('recordNumber', number); fomag.saveDraft(); }
      const snapshot = JSON.parse(JSON.stringify(module === 'accident' ? form.getValues() : fomag.form.getValues())) as TrafficAccidentDeclaration | FomagSignatureFormData;
      await saveHistory(module, snapshot);
      setNotice(`Documento ${number} guardado en el historial compartido.`);
      if (action === 'pdf') {
        const { downloadPdf } = await import('./utils/downloadPdf');
        await downloadPdf(module, snapshot);
      } else if (action === 'print') {
        await waitForDocument();
        if (module === 'accident') print(snapshot as TrafficAccidentDeclaration, setMissingFields);
        else {
          document.body.classList.add('print-fomag');
          try { window.print(); } finally { document.body.classList.remove('print-fomag'); }
        }
      }
      return true;
    } catch (error) {
      if (error instanceof HistoryAccessError) { pendingAction.current = { module, action }; setHistoryOpen(true); setPreviewOpen(false); }
      setMissingFields([error instanceof Error ? error.message : 'No se pudo completar la operacion. Intente nuevamente.']);
      return false;
    } finally { busyRef.current = false; setBusy(false); }
  };

  const handlePrint = () => runDocumentAction('accident', 'print');
  const handleFomagPrint = () => runDocumentAction('fomag', 'print');

  const openHistoryRecord = (record: HistoryRecord) => {
    restoreReservation(record);
    if (record.module === 'accident') {
      restoreDeclaration({ ...record.data as TrafficAccidentDeclaration, metadata: { createdAt: record.createdAt, savedAt: record.createdAt } });
    } else { fomag.form.reset(record.data as FomagSignatureFormData); fomag.saveDraft(); }
    setActiveModule(record.module); setHistoryOpen(false); setMissingFields([]);
    setNotice(`Documento ${record.number} recuperado. Puede imprimirlo o descargarlo con su consecutivo original. Para cambios, inicie un documento nuevo.`);
  };

  const requestOpenHistoryRecord = (record: HistoryRecord) => {
    const hasDraft = record.module === 'accident' ? Boolean(form.getValues('victim.fullName')) : Boolean(fomag.form.getValues('patientName'));
    if (hasDraft) { setRecordToOpen(record); return; }
    openHistoryRecord(record);
  };

  const handleHeaderSave = () => {
    if (activeModule === 'accident') {
      saveDraft();
      return;
    }
    fomag.saveDraft();
  };

  const handleHeaderPreview = () => {
    if (activeModule === 'accident') {
      setPreviewOpen(true);
      return;
    }
    document.getElementById('fomag-print-document')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleHeaderPrint = () => {
    if (activeModule === 'accident') {
      handlePrint();
      return;
    }
    handleFomagPrint();
  };

  const confirmClear = () => {
    clearDraft();
    setClearOpen(false);
    setMissingFields([]);
  };

  const confirmFomagClear = () => {
    fomag.clearDraft();
    setClearOpen(false);
    setMissingFields([]);
  };

  const requestClosePreview = () => {
    if (form.formState.isDirty) {
      setCloseOpen(true);
      return;
    }
    setPreviewOpen(false);
  };

  if (showWelcome) return <WelcomeScreen onDismiss={setShowWelcome} />;

  return (
    <div className="min-h-screen bg-hospital-bg text-slate-800">
      <AppHeader
        savedAt={activeModule === 'accident' ? savedAt : fomag.savedAt}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        onSave={handleHeaderSave}
        onClear={() => setClearOpen(true)}
        onPreview={handleHeaderPreview}
        onPrint={handleHeaderPrint}
        onPdf={() => void runDocumentAction(activeModule, 'pdf')}
        onArchive={() => void runDocumentAction(activeModule, 'save')}
        onHistory={() => { pendingAction.current = null; setHistoryOpen((open) => !open); }}
        busy={busy}
      />

      {historyOpen ? <HistoryPanel
        onClose={() => { setHistoryOpen(false); pendingAction.current = null; }}
        onOpenRecord={requestOpenHistoryRecord}
        onAuthenticated={() => {
          const pending = pendingAction.current; pendingAction.current = null;
          if (pending) { setHistoryOpen(false); void runDocumentAction(pending.module, pending.action); }
        }}
      /> : null}
      {busy || notice ? <div className="app-chrome mx-auto max-w-[1500px] px-4 pt-4"><p role="status" className="rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm text-hospital-navy">{busy ? 'Preparando documento…' : notice}</p></div> : null}
      {missingFields.length ? (
        <div className="app-chrome mx-auto mt-4 max-w-[1500px] px-4">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <strong>No se pudo completar la operación.</strong>
              <p className="mt-1">{missingFields.join(', ')}</p>
            </div>
          </div>
        </div>
      ) : null}

      <fieldset disabled={busy} className="contents">
      {activeModule === 'accident' ? (
        <main className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 xl:grid-cols-[minmax(540px,0.96fr)_minmax(520px,1.04fr)]">
          <AccidentForm form={form} onLoadExample={loadExample} />
          <aside className="preview-pane">
            <div className="app-chrome mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-hospital-navy">Vista previa en tiempo real</h2>
                <p className="text-sm text-slate-500">Hoja tamano carta lista para imprimir</p>
              </div>
            </div>
            <DocumentPreview data={data} />
          </aside>
        </main>
      ) : (
        <FomagSignatureModule
          form={fomag.form}
          data={fomag.data}
          records={fomag.records}
          onSaveRecord={() => runDocumentAction('fomag', 'save')}
          onRemoveRecord={fomag.removeRecord}
          onPrint={handleFomagPrint}
          onPdf={() => void runDocumentAction('fomag', 'pdf')}
          onHistory={() => { pendingAction.current = null; setHistoryOpen(true); }}
          busy={busy}
        />
      )}

      </fieldset>

      <PreviewModal open={previewOpen} data={data} onClose={requestClosePreview} onPrint={handlePrint} onPdf={() => void runDocumentAction('accident', 'pdf')} busy={busy} />
      <ConfirmDialog
        open={recordToOpen !== null}
        title="Abrir documento del historial"
        message="Se reemplazará el borrador actual de este módulo. Guárdelo en el historial antes de continuar si necesita conservarlo."
        confirmText="Abrir documento"
        onCancel={() => setRecordToOpen(null)}
        onConfirm={() => { if (recordToOpen) openHistoryRecord(recordToOpen); setRecordToOpen(null); }}
      />
      <ConfirmDialog
        open={clearOpen}
        title={activeModule === 'accident' ? 'Limpiar formulario' : 'Limpiar FOMAG'}
        message={activeModule === 'accident' ? 'Se borrara el borrador local y se reiniciara la declaracion.' : 'Se borrara el borrador FOMAG y se iniciara un consentimiento nuevo.'}
        confirmText="Limpiar"
        onCancel={() => setClearOpen(false)}
        onConfirm={activeModule === 'accident' ? confirmClear : confirmFomagClear}
      />
      <ConfirmDialog
        open={closeOpen}
        title="Cerrar vista previa"
        message="Hay cambios recientes en el formulario. El borrador se guarda automaticamente, pero puede volver a editar antes de imprimir."
        confirmText="Cerrar"
        onCancel={() => setCloseOpen(false)}
        onConfirm={() => {
          setCloseOpen(false);
          setPreviewOpen(false);
        }}
      />
    </div>
  );
};

export default App;
