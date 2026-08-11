import { useState } from 'react';
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
  const { form, data, savedAt, saveDraft, clearDraft, loadExample } = useDeclarationForm();
  const fomag = useFomagSignatures();
  const { print } = usePrint();
  const [activeModule, setActiveModule] = useState<AppModule>('accident');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handlePrint = async () => {
    const valid = await form.trigger();
    if (!valid) {
      setMissingFields(['Revise los campos obligatorios marcados en el formulario.']);
      return;
    }
    setMissingFields([]);
    print(form.getValues(), setMissingFields);
  };

  const handleFomagPrint = async () => {
    const valid = await fomag.form.trigger();
    if (!valid) {
      setMissingFields(['Revise los campos obligatorios marcados en el formulario FOMAG.']);
      return;
    }
    setMissingFields([]);
    document.body.classList.add('print-fomag');
    window.print();
    window.setTimeout(() => document.body.classList.remove('print-fomag'), 500);
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
      />

      {missingFields.length ? (
        <div className="app-chrome mx-auto mt-4 max-w-[1500px] px-4">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <strong>No se puede imprimir todavia.</strong>
              <p className="mt-1">Campos pendientes: {missingFields.join(', ')}</p>
            </div>
          </div>
        </div>
      ) : null}

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
          onSaveRecord={fomag.saveRecord}
          onRemoveRecord={fomag.removeRecord}
          onPrint={handleFomagPrint}
        />
      )}

      <PreviewModal open={previewOpen} data={data} onClose={requestClosePreview} onPrint={handlePrint} />
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
