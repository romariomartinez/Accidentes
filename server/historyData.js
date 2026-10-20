import { createHash } from 'node:crypto';

const fields = {
  accident: ['declarationNumber', 'registrationDate', 'victimRole', 'place', 'municipality', 'department', 'accidentDate', 'accidentTime', 'admissionDate', 'admissionTime', 'dischargeDate', 'dischargeTime', 'vehicleType', 'licensePlate', 'roadType', 'observations', 'story'],
  victim: ['documentType', 'documentNumber', 'fullName', 'address', 'municipality', 'department', 'phone', 'age', 'sex'],
  driver: ['fled', 'documentType', 'documentNumber', 'fullName', 'address', 'phone'],
  owner: ['unknown', 'documentType', 'documentNumber', 'fullName', 'address', 'phone'],
  declarant: ['role', 'documentType', 'documentNumber', 'fullName', 'phone'],
};
const fomagFields = ['recordNumber', 'registerDate', 'patientName', 'documentType', 'documentNumber', 'phone', 'serviceDate', 'serviceDescription', 'observation'];

function pick(source, keys) {
  if (!source || typeof source !== 'object') throw new Error('Datos incompletos.');
  return Object.fromEntries(keys.map((key) => {
    const value = source[key];
    if (key === 'fled' || key === 'unknown') {
      if (typeof value !== 'boolean') throw new Error('Datos invalidos.');
      return [key, value];
    }
    if (typeof value !== 'string' || value.length > (key === 'story' ? 30000 : 4000)) throw new Error('Datos invalidos o demasiado extensos.');
    return [key, value];
  }));
}

export function normalizeRecord(module, input, requestId) {
  if (!['accident', 'fomag'].includes(module) || typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/.test(requestId)) throw new Error('Solicitud invalida.');
  const data = module === 'accident'
    ? Object.fromEntries(Object.entries(fields).map(([section, keys]) => [section, pick(input?.[section], keys)]))
    : pick(input, fomagFields);
  const number = module === 'accident' ? data.accident.declarationNumber : data.recordNumber;
  if (!new RegExp(`^${module === 'accident' ? 'DAT' : 'FOMAG'}-\\d{8}-\\d{2,}$`).test(number)) throw new Error('El documento necesita un consecutivo central.');
  const name = module === 'accident' ? data.victim.fullName : data.patientName;
  const document = module === 'accident' ? data.victim.documentNumber : data.documentNumber;
  const date = module === 'accident' ? data.accident.registrationDate : data.registerDate;
  if (!name.trim() || !document.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Complete nombre, documento y fecha.');
  if (module === 'accident' && (!data.accident.place.trim() || !data.accident.accidentDate || !data.accident.admissionDate || !data.accident.story.trim() || !data.declarant.fullName.trim())) throw new Error('Complete los campos obligatorios de la declaracion.');
  if (module === 'fomag' && (!data.serviceDate || !data.serviceDescription.trim())) throw new Error('Complete la atencion recibida.');
  const digest = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  const summary = { number, module, name, document, date, createdAt: new Date().toISOString() };
  return { ...summary, data, requestId, digest };
}

export const normalizeSearch = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
