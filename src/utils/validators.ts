import { TrafficAccidentDeclaration } from '../types/declaration';

export const requiredPrintFields: Array<{ path: keyof TrafficAccidentDeclaration | string; label: string }> = [
  { path: 'victim.fullName', label: 'Nombre de la victima' },
  { path: 'victim.documentNumber', label: 'Documento de la victima' },
  { path: 'accident.place', label: 'Lugar del accidente' },
  { path: 'accident.accidentDate', label: 'Fecha del accidente' },
  { path: 'accident.admissionDate', label: 'Fecha de ingreso' },
  { path: 'accident.story', label: 'Relato de los hechos' },
  { path: 'declarant.fullName', label: 'Declarante' },
];

export const getByPath = (data: TrafficAccidentDeclaration, path: string): string => {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return '';
  }, data) as string;
};

export const getMissingPrintFields = (data: TrafficAccidentDeclaration): string[] =>
  requiredPrintFields.filter((field) => !String(getByPath(data, field.path)).trim()).map((field) => field.label);
