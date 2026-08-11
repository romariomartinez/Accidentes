import { CalendarDays, FileDown, ListChecks, Printer, Save, Trash2, UserRound } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useFomagSignatures } from '../hooks/useFomagSignatures';
import { FomagSignatureFormData, FomagSignatureRecord } from '../types/fomag';
import { emptyText, formatColombianDate, normalizeDocument, normalizePhone } from '../utils/formatters';
import { FormField } from './FormField';

const documentTypes = [
  { value: 'CC', label: 'CC' },
  { value: 'TI', label: 'TI' },
  { value: 'CE', label: 'CE' },
  { value: 'PAS', label: 'PAS' },
  { value: 'Otro', label: 'Otro' },
];

const consentText = (data: FomagSignatureFormData | FomagSignatureRecord) =>
  `El usuario ${emptyText(data.patientName)}, identificado con ${data.documentType} ${emptyText(data.documentNumber)}, firma el presente consentimiento y deja constancia de que recibio atencion en ${emptyText(data.serviceDescription)} el dia ${formatColombianDate(data.serviceDate)}.`;

const FomagPrintSheet = ({ data }: { data: FomagSignatureFormData | FomagSignatureRecord }) => (
  <article className="fomag-sheet" id="fomag-print-document">
    <header className="fomag-doc-header">
      <div className="doc-logo">
        <img src="/hospital-logo.bmp" alt="Hospital Camilo Villazon Pumarejo" />
      </div>
      <h2>CONSENTIMIENTO USUARIO FOMAG</h2>
      <div className="doc-number">
        <span>No.</span>
        <strong>{emptyText(data.recordNumber)}</strong>
      </div>
    </header>

    <div className="fomag-doc-summary">
      <div>
        <CalendarDays className="h-4 w-4" />
        Registro: {formatColombianDate(data.registerDate)}
      </div>
      <div>
        <UserRound className="h-4 w-4" />
        Usuario: {emptyText(data.patientName)}
      </div>
      <div>
        <ListChecks className="h-4 w-4" />
        Entidad: FOMAG
      </div>
    </div>

    <section className="doc-section">
      <h3>Datos del usuario</h3>
      <div className="doc-grid">
        <div className="doc-cell">
          <span>Nombre completo</span>
          <strong>{emptyText(data.patientName)}</strong>
        </div>
        <div className="doc-cell">
          <span>Documento</span>
          <strong>{data.documentType} {emptyText(data.documentNumber)}</strong>
        </div>
        <div className="doc-cell">
          <span>Telefono</span>
          <strong>{emptyText(data.phone)}</strong>
        </div>
      </div>
    </section>

    <section className="doc-section">
      <h3>Datos de la atencion</h3>
      <div className="doc-grid">
        <div className="doc-cell">
          <span>Fecha de atencion</span>
          <strong>{formatColombianDate(data.serviceDate)}</strong>
        </div>
        <div className="doc-cell">
          <span>Entidad</span>
          <strong>FOMAG</strong>
        </div>
        <div className="doc-cell">
          <span>Registro</span>
          <strong>{emptyText(data.recordNumber)}</strong>
        </div>
        <div className="doc-cell doc-cell-wide">
          <span>Atencion recibida</span>
          <strong>{emptyText(data.serviceDescription)}</strong>
        </div>
        <div className="doc-cell">
          <span>Observacion</span>
          <strong>{emptyText(data.observation)}</strong>
        </div>
      </div>
    </section>

    <section className="doc-section">
      <h3>Consentimiento</h3>
      <p className="fomag-consent-text">{consentText(data)}</p>
    </section>

    <section className="doc-section fomag-manual-signature">
      <h3>Firma manual</h3>
      <div className="fomag-signature-line" />
      <p className="fomag-signature-label">Firma del usuario o acudiente</p>
    </section>
  </article>
);

export const FomagSignatureModule = () => {
  const { form, records, saveRecord, resetForm, removeRecord } = useFomagSignatures();
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;
  const data = watch();

  const printCurrent = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    document.body.classList.add('print-fomag');
    window.print();
    window.setTimeout(() => document.body.classList.remove('print-fomag'), 500);
  };

  return (
    <main className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 xl:grid-cols-[minmax(540px,0.96fr)_minmax(520px,1.04fr)]">
      <form className="app-chrome space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-hospital-navy">
            <ListChecks className="h-5 w-5 text-hospital-teal" />
            Modulo de consentimientos FOMAG
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Limpiar
            </button>
            <button type="button" className="btn-primary" onClick={saveRecord}>
              <Save className="h-4 w-4" />
              Guardar registro
            </button>
            <button type="button" className="btn-green" onClick={printCurrent}>
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
          </div>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-hospital-navy">Datos principales</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField<FomagSignatureFormData> label="Numero de registro" name="recordNumber" register={register} readOnly />
            <FormField<FomagSignatureFormData> label="Fecha de registro" name="registerDate" register={register} type="date" readOnly />
            <FormField<FomagSignatureFormData> label="Nombre del usuario" name="patientName" register={register} required />
            <Controller
              control={control}
              name="documentType"
              render={({ field }) => (
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo documento</span>
                  <select {...field} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-hospital-teal focus:ring-2 focus:ring-hospital-teal/20">
                    {documentTypes.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              )}
            />
            <FormField<FomagSignatureFormData>
              label="Documento"
              name="documentNumber"
              register={register}
              required
              onInput={(event) => {
                event.currentTarget.value = normalizeDocument(event.currentTarget.value);
              }}
              error={errors.documentNumber}
            />
            <FormField<FomagSignatureFormData>
              label="Telefono"
              name="phone"
              register={register}
              onInput={(event) => {
                event.currentTarget.value = normalizePhone(event.currentTarget.value);
              }}
            />
            <FormField<FomagSignatureFormData> label="Fecha de atencion" name="serviceDate" register={register} type="date" required />
            <div className="md:col-span-2">
              <FormField<FomagSignatureFormData>
                label="Atencion recibida"
                name="serviceDescription"
                register={register}
                as="textarea"
                rows={3}
                required
                placeholder="Ejemplo: Consulta medica, procedimiento, medicamento, apoyo diagnostico..."
              />
            </div>
            <div className="md:col-span-2">
              <FormField<FomagSignatureFormData> label="Observacion" name="observation" register={register} as="textarea" rows={2} />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-hospital-navy">Registros guardados</h2>
          <div className="space-y-2">
            {records.length ? records.map((record) => (
              <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-bold text-hospital-navy">{record.patientName}</p>
                  <p className="text-xs text-slate-500">{record.recordNumber} - {record.documentType} {record.documentNumber} - {formatColombianDate(record.serviceDate)}</p>
                </div>
                <button type="button" className="btn-ghost min-h-8 px-2 py-1 text-xs" onClick={() => removeRecord(record.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Quitar
                </button>
              </div>
            )) : <p className="text-sm text-slate-500">Todavia no hay registros guardados.</p>}
          </div>
        </section>
      </form>

      <aside className="preview-pane">
        <div className="app-chrome mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-hospital-navy">Vista previa FOMAG</h2>
            <p className="text-sm text-slate-500">Consentimiento listo para imprimir y firmar a mano</p>
          </div>
          <button type="button" className="btn-green" onClick={printCurrent}>
            <FileDown className="h-4 w-4" />
            PDF
          </button>
        </div>
        <div className="fomag-print-area">
          <FomagPrintSheet data={data} />
        </div>
      </aside>
    </main>
  );
};
