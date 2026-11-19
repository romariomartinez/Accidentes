import { TrafficAccidentDeclaration } from '../types/declaration';
import { noticeSections, noticeTitle } from '../utils/accidentNotice';
import { emptyText, formatColombianDate } from '../utils/formatters';

export const AccidentNoticePreview = ({ data }: { data: TrafficAccidentDeclaration }) => (
  <article className="document-sheet notice-sheet" id="print-document">
    <header className="notice-header">
      <div className="notice-brand">
        <img src="/hospital-logo.bmp" alt="Hospital Camilo Villazón Pumarejo" />
        <div className="notice-identity"><p className="notice-institution-kind">Empresa Social del Estado</p><p className="notice-institution">Hospital Camilo Villazón<br />Pumarejo</p><p className="notice-nit">NIT 824002672</p></div>
      </div>
      <h2>{noticeTitle}</h2>
      <div className="notice-meta"><p><span>Consecutivo</span><strong>{emptyText(data.accident.declarationNumber)}</strong></p><p><span>Fecha de registro</span><strong>{emptyText(formatColombianDate(data.accident.registrationDate))}</strong></p></div>
    </header>
    {noticeSections(data).map(({ title, text, fields }) => (
      <section key={title} className={`notice-section ${title === 'Aviso' || title === 'Destinatario' ? 'notice-intro' : ''}`}>
        <h3>{title}</h3>
        {fields ? <dl className="notice-fields">{fields.map(({ label, value }) => <div key={label} className={`notice-field ${label === 'Nombres y apellidos' || label.startsWith('Dirección') ? 'notice-field-wide' : ''}`}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p className="notice-prose">{emptyText(text)}</p>}
      </section>
    ))}
    <footer className="notice-signature">
      <img src="/firma-gerente.png" alt="Firma de Camilo Rojas Criales, gerente ESE HCVP" />
      <p>C.C. 87101709</p>
    </footer>
  </article>
);
