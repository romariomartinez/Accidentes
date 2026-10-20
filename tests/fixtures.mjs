export const requestId = '12345678-1234-4234-8234-123456789012';
export const accident = {
  accident: {
    declarationNumber: 'DAT-20261020-01', registrationDate: '2026-10-20', victimRole: 'Peaton',
    place: 'Calle de prueba, zona urbana', municipality: 'Pueblo Bello', department: 'Cesar',
    accidentDate: '2026-10-19', accidentTime: '19:51', admissionDate: '2026-10-19', admissionTime: '20:35',
    dischargeDate: '2026-10-20', dischargeTime: '08:00', vehicleType: 'Motocicleta', licensePlate: 'ABC123',
    roadType: 'Urbana', observations: '', story: 'Paciente de prueba sufrió un accidente de tránsito en calidad de peatón. Se registra la información suministrada para verificar la legibilidad del documento y la correcta impresión de tildes y números.',
  },
  victim: { documentType: 'CC', documentNumber: '0.000.000.001', fullName: 'PACIENTE DE PRUEBA ÁLVAREZ', address: 'Dirección ficticia para pruebas', municipality: 'Pueblo Bello', department: 'Cesar', phone: '300-000-00-00', age: '', sex: '' },
  driver: { fled: true, documentType: 'CC', documentNumber: 'No conocida', fullName: 'Conductor huyó del lugar de los hechos; se desconocen sus datos personales y paradero', address: 'No conocida', phone: 'No conocido' },
  owner: { unknown: true, documentType: 'CC', documentNumber: 'No conocido', fullName: 'No conocido', address: 'No conocido', phone: 'No conocido' },
  declarant: { role: 'La victima', documentType: 'CC', documentNumber: '0.000.000.001', fullName: 'PACIENTE DE PRUEBA ÁLVAREZ', phone: '300-000-00-00' },
  metadata: { createdAt: '2026-10-20T12:00:00Z', savedAt: '2026-10-20T12:00:00Z' },
};
export const fomag = { recordNumber: 'FOMAG-20261020-01', registerDate: '2026-10-20', patientName: 'USUARIO DE PRUEBA NÚÑEZ', documentType: 'CC', documentNumber: '0.000.000.002', phone: '300-000-00-00', serviceDate: '2026-10-20', serviceDescription: 'Consulta médica y apoyo diagnóstico de prueba.', observation: 'Datos ficticios utilizados únicamente para revisar el formato.' };
