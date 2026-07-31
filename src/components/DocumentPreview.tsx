import { CalendarDays, FileBadge2, UserRound } from 'lucide-react';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { emptyText, formatColombianDate, formatTime12h } from '../utils/formatters';

interface Props {
  data: TrafficAccidentDeclaration;
  scale?: 'normal' | 'full';
}

const roleLabel = (value: string) => value.replace('Peaton', 'Peatón').replace('Policia', 'Policía').replace('victima', 'víctima');

const InfoRow = ({ label, value }: { label: string; value: string | boolean }) => (
  <div className="doc-cell">
    <span>{label}</span>
    <strong>{emptyText(value)}</strong>
  </div>
);

const DocumentSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="doc-section">
    <h3>{title}</h3>
    {children}
  </section>
);

export const DocumentPreview = ({ data, scale = 'normal' }: Props) => (
  <article className={`document-sheet ${scale === 'full' ? 'document-sheet-full' : ''}`} id="print-document">
    <header className="doc-header">
      <div className="doc-logo">
        <img src="/hospital-logo.bmp" alt="Hospital Camilo Villazón Pumarejo" />
      </div>
      <div>
        <h2>DECLARACIÓN DE ACCIDENTE DE TRÁNSITO</h2>
      </div>
      <div className="doc-number">
        <span>No.</span>
        <strong>{emptyText(data.accident.declarationNumber)}</strong>
      </div>
    </header>

    <div className="doc-summary">
      <div>
        <FileBadge2 className="h-4 w-4" />
        Calidad: {roleLabel(data.accident.victimRole)}
      </div>
      <div>
        <CalendarDays className="h-4 w-4" />
        Registro: {formatColombianDate(data.accident.registrationDate)}
      </div>
      <div>
        <UserRound className="h-4 w-4" />
        Víctima: {emptyText(data.victim.fullName)}
      </div>
    </div>

    <DocumentSection title="Relato de los hechos">
      <p className="doc-story">{emptyText(data.accident.story)}</p>
    </DocumentSection>

    <DocumentSection title="Datos del accidente y atención">
      <div className="doc-grid">
        <InfoRow label="Lugar del accidente" value={data.accident.place} />
        <InfoRow label="Municipio" value={data.accident.municipality} />
        <InfoRow label="Departamento" value={data.accident.department} />
        <InfoRow label="Fecha y hora del accidente" value={`${formatColombianDate(data.accident.accidentDate)} ${formatTime12h(data.accident.accidentTime)}`} />
        <InfoRow label="Fecha y hora de ingreso" value={`${formatColombianDate(data.accident.admissionDate)} ${formatTime12h(data.accident.admissionTime)}`} />
        <InfoRow label="Fecha y hora de egreso" value={`${formatColombianDate(data.accident.dischargeDate)} ${formatTime12h(data.accident.dischargeTime)}`} />
        <InfoRow label="Vehículo involucrado" value={data.accident.vehicleType} />
        <InfoRow label="Placa" value={data.accident.licensePlate} />
      </div>
    </DocumentSection>

    <DocumentSection title="Información de la víctima">
      <div className="doc-grid">
        <InfoRow label="Nombre" value={data.victim.fullName} />
        <InfoRow label="Documento" value={`${data.victim.documentType} ${data.victim.documentNumber}`} />
        <InfoRow label="Dirección" value={data.victim.address} />
        <InfoRow label="Municipio / Departamento" value={`${data.victim.municipality} / ${data.victim.department}`} />
        <InfoRow label="Teléfono" value={data.victim.phone} />
      </div>
    </DocumentSection>

    <DocumentSection title="Información del conductor">
      <div className="doc-grid">
        <InfoRow label="Conductor huyó" value={data.driver.fled} />
        <InfoRow label="Nombre" value={data.driver.fullName} />
        <InfoRow label="Documento" value={`${data.driver.documentType} ${data.driver.documentNumber}`} />
        <InfoRow label="Dirección" value={data.driver.address} />
        <InfoRow label="Teléfono" value={data.driver.phone} />
      </div>
    </DocumentSection>

    <DocumentSection title="Información del propietario">
      <div className="doc-grid">
        <InfoRow label="Propietario desconocido" value={data.owner.unknown} />
        <InfoRow label="Nombre" value={data.owner.fullName} />
        <InfoRow label="Documento" value={`${data.owner.documentType} ${data.owner.documentNumber}`} />
        <InfoRow label="Dirección" value={data.owner.address} />
        <InfoRow label="Teléfono" value={data.owner.phone} />
      </div>
    </DocumentSection>

    <DocumentSection title="Información del declarante">
      <div className="doc-grid">
        <InfoRow label="Declarante es" value={roleLabel(data.declarant.role)} />
        <InfoRow label="Nombre" value={data.declarant.fullName} />
        <InfoRow label="Documento" value={`${data.declarant.documentType} ${data.declarant.documentNumber}`} />
        <InfoRow label="Teléfono" value={data.declarant.phone} />
      </div>
    </DocumentSection>
  </article>
);
