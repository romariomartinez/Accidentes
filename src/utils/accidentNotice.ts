import { TrafficAccidentDeclaration } from '../types/declaration';
import { emptyText, formatColombianDate, formatTime12h } from './formatters';

export const noticeTitle = 'AVISO DE ACCIDENTE DE TRÁNSITO';
export const noticeIntroduction = 'E.S.E HOSPITAL CAMILO VILLAZON PUMAREJO en cumplimiento de lo dispuesto en el artículo 218 de la Ley 906 de 2004 y la Resolución N° 0199844 de 2024 de la ADRES, y en virtud de la imposibilidad de acceder al informe descriptivo, emite el presente documento como constancia de que se ha notificado a la autoridad de policía o a la primera autoridad del lugar sobre el ingreso de una víctima de accidente de tránsito a nuestras instalaciones.';
export interface NoticeField { label: string; value: string; }
export interface NoticeSection { title: string; text: string; fields?: NoticeField[]; }
export function noticeSections({ accident: a, victim: v, driver: d, owner: o, declarant: r }: TrafficAccidentDeclaration): NoticeSection[] {
  const line = (label: string, value?: string) => ({ label, value: emptyText(value || '') });
  const group = (title: string, fields: NoticeField[]): NoticeSection => ({ title, fields, text: fields.map(({ label, value }) => label + ': ' + value).join('\n') });
  return [
    { title: 'Destinatario', text: 'Señores: POLICÍA NACIONAL Y/O INSPECCIÓN DE POLICÍA Y/O PRIMERA AUTORIDAD LOCAL' },
    { title: 'Aviso', text: noticeIntroduction },
    group('1. Datos de la víctima', [line('Nombres y apellidos', v.fullName), line('Tipo y número de documento', `${v.documentType} ${v.documentNumber}`), line('Sexo', v.sex), line('Dirección de residencia', v.address), line('Teléfono', v.phone), line('Departamento', v.department), line('Municipio', v.municipality), line('Condición de la víctima', a.victimRole.replace('Peaton', 'Peatón'))]),
    group('2. Identificación del evento', [line('Naturaleza del evento', 'Accidente de tránsito')]),
    group('3. Datos del accidente', [line('Dirección del lugar de ocurrencia', a.place), line('Fecha del evento', formatColombianDate(a.accidentDate)), line('Hora', formatTime12h(a.accidentTime)), line('Departamento', a.department), line('Municipio', a.municipality), line('Zona', a.zone), line('Estado de aseguramiento del vehículo', a.insuranceStatus), line('Tipo de vehículo involucrado', a.vehicleType), line('Placa del vehículo', a.licensePlate)]),
    { title: 'Relato breve del evento', text: a.story },
    group('4. Descripción de la atención médica', [line('4.1 Fecha de ingreso a la IPS', formatColombianDate(a.admissionDate)), line('Hora de ingreso', formatTime12h(a.admissionTime))]),
    { title: '4.2 Signos vitales y examen físico al ingreso', text: `${emptyText(a.admissionExam || '')}\n\nSIGNOS VITALES\n${emptyText(a.vitalSigns || '')}` },
    { title: '4.3 Plan inicial de manejo', text: `${emptyText(a.initialTreatment || '')}\n\nLa fisiopatología del trauma implica que las condiciones iniciales del examen físico pueden variar durante el transcurso de la atención.` },
    group('5. Información del conductor', [line('Conductor huyó del lugar', d.fled ? 'Sí' : 'No'), line('Nombres y apellidos', d.fullName), line('Tipo y número de documento', `${d.documentType} ${d.documentNumber}`), line('Dirección de residencia', d.address), line('Teléfono', d.phone)]),
    group('6. Información del propietario', [line('Propietario desconocido', o.unknown ? 'Sí' : 'No'), line('Nombres y apellidos', o.fullName), line('Tipo y número de documento', `${o.documentType} ${o.documentNumber}`), line('Dirección de residencia', o.address), line('Teléfono', o.phone)]),
    group('7. Información del declarante', [line('El declarante es', r.role.replace('victima', 'víctima').replace('Policia', 'Policía')), line('Nombres y apellidos', r.fullName), line('Tipo y número de documento', `${r.documentType} ${r.documentNumber}`), line('Teléfono', r.phone)]),
    { title: 'Observación', text: `${emptyText(a.observations)}\n\nEl representante legal certifica el ingreso y la atención médica y/o quirúrgica prestada al paciente.` },
  ];
}
