export type FomagDocumentType = 'CC' | 'TI' | 'CE' | 'PAS' | 'Otro';

export interface FomagSignatureFormData {
  recordNumber: string;
  registerDate: string;
  patientName: string;
  documentType: FomagDocumentType;
  documentNumber: string;
  phone: string;
  serviceDate: string;
  invoiceNumber: string;
  serviceDescription: string;
  observation: string;
  signature: string;
}

export interface FomagSignatureRecord extends FomagSignatureFormData {
  id: string;
  createdAt: string;
}
