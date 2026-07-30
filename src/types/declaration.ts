export type VictimRole = 'Peaton' | 'Conductor' | 'Pasajero' | 'Ciclista' | 'Ocupante' | 'Otro';
export type PersonDocumentType = 'CC' | 'TI' | 'CE' | 'PAS' | 'RC' | 'Otro';
export type Sex = 'Femenino' | 'Masculino' | 'Otro' | '';
export type DeclarantRole = 'La victima' | 'Familiar' | 'Testigo' | 'Policia' | 'Otro';

export interface AccidentData {
  declarationNumber: string;
  registrationDate: string;
  victimRole: VictimRole;
  place: string;
  municipality: string;
  department: string;
  accidentDate: string;
  accidentTime: string;
  admissionDate: string;
  admissionTime: string;
  dischargeDate: string;
  dischargeTime: string;
  vehicleType: string;
  licensePlate: string;
  roadType: string;
  observations: string;
  story: string;
}

export interface VictimData {
  documentType: PersonDocumentType;
  documentNumber: string;
  fullName: string;
  address: string;
  municipality: string;
  department: string;
  phone: string;
  age: string;
  sex: Sex;
}

export interface DriverData {
  fled: boolean;
  documentType: PersonDocumentType;
  documentNumber: string;
  fullName: string;
  address: string;
  phone: string;
}

export interface OwnerData {
  unknown: boolean;
  documentType: PersonDocumentType;
  documentNumber: string;
  fullName: string;
  address: string;
  phone: string;
}

export interface DeclarantData {
  role: DeclarantRole;
  documentType: PersonDocumentType;
  documentNumber: string;
  fullName: string;
  phone: string;
}

export interface DeclarationMetadata {
  savedAt: string;
  createdAt: string;
}

export interface TrafficAccidentDeclaration {
  accident: AccidentData;
  victim: VictimData;
  driver: DriverData;
  owner: OwnerData;
  declarant: DeclarantData;
  metadata: DeclarationMetadata;
}

export type DeclarationFieldPath =
  | `accident.${keyof AccidentData}`
  | `victim.${keyof VictimData}`
  | `driver.${keyof DriverData}`
  | `owner.${keyof OwnerData}`
  | `declarant.${keyof DeclarantData}`
  | `metadata.${keyof DeclarationMetadata}`;
