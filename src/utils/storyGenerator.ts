import { TrafficAccidentDeclaration } from '../types/declaration';
import { formatColombianDate, formatTime12h } from './formatters';

const roleText: Record<string, string> = {
  Peaton: 'peatón',
  Conductor: 'conductor',
  Pasajero: 'pasajero',
  Ciclista: 'ciclista',
  Ocupante: 'ocupante',
  Otro: 'otro',
};

export const generateStory = (data: TrafficAccidentDeclaration): string => {
  const victimName = data.victim.fullName || 'La víctima';
  const role = roleText[data.accident.victimRole] ?? data.accident.victimRole.toLowerCase();
  const place = data.accident.place || 'el lugar referido';
  const municipality = data.accident.municipality || data.victim.municipality || 'el municipio indicado';
  const department = data.accident.department || data.victim.department || 'el departamento indicado';
  const date = formatColombianDate(data.accident.accidentDate) || 'la fecha registrada';
  const time = formatTime12h(data.accident.accidentTime) || 'la hora registrada';
  const vehicle = data.accident.vehicleType || 'un vehiculo';
  const admissionDate = formatColombianDate(data.accident.admissionDate);
  const admissionTime = formatTime12h(data.accident.admissionTime);

  return `${victimName} sufrió un accidente de tránsito en calidad de ${role} el día ${date} aproximadamente a las ${time}, mientras se encontraba en ${place}, en el municipio de ${municipality}, ${department}. Según la información suministrada, el hecho estuvo relacionado con ${vehicle.toLowerCase()}${data.accident.licensePlate ? ` de placa ${data.accident.licensePlate}` : ''}. Posteriormente, la persona afectada ingresó a la institución${admissionDate ? ` el ${admissionDate}` : ''}${admissionTime ? ` a las ${admissionTime}` : ''} para recibir atención médica. ${data.driver.fled ? 'Se deja constancia de que el conductor huyó del lugar de los hechos y se desconocen sus datos personales y paradero.' : 'Los datos del conductor se registran conforme a la información declarada.'} ${data.accident.observations ? `Observaciones adicionales: ${data.accident.observations}` : ''}`.trim();
};

export const improveStory = (story: string): string => {
  const clean = story.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const ending = /[.!?]$/.test(clean) ? clean : `${clean}.`;
  return ending.charAt(0).toUpperCase() + ending.slice(1);
};
