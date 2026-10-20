import type { jsPDF } from 'jspdf';
import type { CellHookData } from 'jspdf-autotable';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { FomagSignatureFormData } from '../types/fomag';
import { HistoryModule } from '../types/history';
import { emptyText, formatColombianDate, formatTime12h } from './formatters';

type Pair = [string, string | boolean];
const navy: [number, number, number] = [22, 58, 95];
const teal: [number, number, number] = [0, 127, 131];

export async function loadPdfLogo(): Promise<string> {
  const image = new Image();
  image.src = '/hospital-logo.bmp';
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo preparar el logo del hospital.');
  context.drawImage(image, 0, 0);
  return canvas.toDataURL('image/png');
}

export async function buildPdf(module: HistoryModule, data: TrafficAccidentDeclaration | FomagSignatureFormData, logo: string) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ unit: 'mm', format: module === 'accident' ? 'a4' : 'letter', compress: true });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const accident = data as TrafficAccidentDeclaration;
  const fomag = data as FomagSignatureFormData;
  const number = module === 'accident' ? accident.accident.declarationNumber : fomag.recordNumber;
  const name = module === 'accident' ? accident.victim.fullName : fomag.patientName;
  doc.setProperties({ title: `${number} - ${name}`, author: 'Hospital Camilo Villazón Pumarejo' });
  doc.addImage(logo, 'PNG', 13, 9, 52, 27.5);
  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(module === 'accident' ? ['DECLARACIÓN DE ACCIDENTE', 'DE TRÁNSITO'] : ['CONSENTIMIENTO', 'USUARIO FOMAG'], 78, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${number}`, 78, 32);
  doc.setDrawColor(...teal);
  doc.setLineWidth(0.7);
  doc.line(13, 38, width - 13, 38);
  let y = 41;
  const lastY = () => (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  const tableBase = {
    margin: { left: 13, right: 13, top: 18, bottom: 16 },
    theme: 'grid' as const,
    rowPageBreak: 'avoid' as const,
    headStyles: { fillColor: [234, 243, 246] as [number, number, number], textColor: teal, fontSize: 9, fontStyle: 'bold' as const, cellPadding: 1.6 },
    styles: { font: 'helvetica', textColor: navy, lineColor: [190, 207, 217] as [number, number, number], lineWidth: 0.15, overflow: 'linebreak' as const },
  };
  const section = (title: string, fields: Pair[]) => {
    const rows: string[][] = [];
    for (let i = 0; i < fields.length; i += 3) rows.push([0, 1, 2].map((j) => fields[i + j] ? emptyText(fields[i + j][1]) : ''));
    autoTable(doc, {
      ...tableBase, startY: y,
      head: [[{ content: title.toUpperCase(), colSpan: 3 }]], body: rows,
      bodyStyles: { fontSize: 9, fontStyle: 'bold', cellPadding: { top: 5.5, bottom: 1.5, left: 2, right: 2 } },
      columnStyles: { 0: { cellWidth: (width - 26) / 3 }, 1: { cellWidth: (width - 26) / 3 }, 2: { cellWidth: (width - 26) / 3 } },
      didDrawCell: (cell: CellHookData) => {
        if (cell.section !== 'body') return;
        const label = fields[cell.row.index * 3 + cell.column.index]?.[0];
        if (!label) return;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(95, 114, 134);
        doc.text(label, cell.cell.x + 2, cell.cell.y + 3.5);
      },
    });
    y = lastY() + 2.5;
  };
  const paragraph = (title: string, text: string) => {
    autoTable(doc, { ...tableBase, startY: y, head: [[title.toUpperCase()]], body: [[emptyText(text)]], bodyStyles: { fontSize: 10, cellPadding: 3, fontStyle: 'normal' } });
    y = lastY() + 2.5;
  };
  const dateTime = (date: string, time: string) => `${formatColombianDate(date)} ${formatTime12h(time)}`.trim();
  if (module === 'accident') {
    const { accident: a, victim: v, driver: d, owner: o, declarant: r } = accident;
    section('Registro', [['Fecha de registro', formatColombianDate(a.registrationDate)], ['Calidad de la víctima', a.victimRole.replace('Peaton', 'Peatón')], ['Víctima', v.fullName]]);
    paragraph('Relato de los hechos', a.story);
    section('Datos del accidente y atención', [
      ['Lugar del accidente', a.place], ['Municipio', a.municipality], ['Departamento', a.department],
      ['Accidente: fecha y hora', dateTime(a.accidentDate, a.accidentTime)], ['Ingreso: fecha y hora', dateTime(a.admissionDate, a.admissionTime)], ['Egreso: fecha y hora', dateTime(a.dischargeDate, a.dischargeTime)],
      ['Vehículo involucrado', a.vehicleType], ['Placa', a.licensePlate], ['Tipo de vía', a.roadType],
    ]);
    section('Información de la víctima', [['Nombre', v.fullName], ['Documento', `${v.documentType} ${v.documentNumber}`], ['Dirección', v.address], ['Municipio / Departamento', `${v.municipality} / ${v.department}`], ['Teléfono', v.phone]]);
    section('Información del conductor', [['Conductor huyó', d.fled], ['Nombre', d.fullName], ['Documento', `${d.documentType} ${d.documentNumber}`], ['Dirección', d.address], ['Teléfono', d.phone]]);
    section('Información del propietario', [['Propietario desconocido', o.unknown], ['Nombre', o.fullName], ['Documento', `${o.documentType} ${o.documentNumber}`], ['Dirección', o.address], ['Teléfono', o.phone]]);
    section('Información del declarante', [['Declarante es', r.role.replace('victima', 'víctima')], ['Nombre', r.fullName], ['Documento', `${r.documentType} ${r.documentNumber}`], ['Teléfono', r.phone]]);
    if (a.observations) paragraph('Observaciones', a.observations);
  } else {
    section('Datos del usuario', [['Nombre completo', fomag.patientName], ['Documento', `${fomag.documentType} ${fomag.documentNumber}`], ['Teléfono', fomag.phone]]);
    section('Datos de la atención', [['Fecha de registro', formatColombianDate(fomag.registerDate)], ['Fecha de atención', formatColombianDate(fomag.serviceDate)], ['Entidad', 'FOMAG']]);
    paragraph('Atención recibida', fomag.serviceDescription);
    if (fomag.observation) paragraph('Observación', fomag.observation);
    paragraph('Consentimiento', `El usuario ${fomag.patientName}, identificado con ${fomag.documentType} ${fomag.documentNumber}, firma el presente consentimiento y deja constancia de que recibió atención en el Hospital Camilo Villazón Pumarejo de Pueblo Bello, Cesar, por concepto de ${fomag.serviceDescription}, el día ${formatColombianDate(fomag.serviceDate)}.`);
    if (y + 40 > height - 16) { doc.addPage(); y = 24; }
    doc.setDrawColor(...navy); doc.line(40, y + 28, width - 40, y + 28);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...navy);
    doc.text('Firma del usuario o acudiente', width / 2, y + 34, { align: 'center' });
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(95, 114, 134);
    if (page > 1) doc.text(number, 13, 11);
    doc.text('Hospital Camilo Villazón Pumarejo', 13, height - 8);
    doc.text(`${page} / ${pages}`, width - 13, height - 8, { align: 'right' });
  }
  const filename = `${number}_${name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 70)}.pdf`;
  return { doc, filename };
}

export async function downloadPdf(module: HistoryModule, data: TrafficAccidentDeclaration | FomagSignatureFormData) {
  const logo = await loadPdfLogo();
  const { doc, filename } = await buildPdf(module, data, logo);
  doc.save(filename);
}
