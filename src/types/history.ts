import { TrafficAccidentDeclaration } from './declaration';
import { FomagSignatureFormData } from './fomag';

export type HistoryModule = 'accident' | 'fomag';
export interface HistorySummary {
  number: string;
  module: HistoryModule;
  name: string;
  document: string;
  date: string;
  createdAt: string;
}
export type HistoryRecord = HistorySummary & { requestId: string; data: TrafficAccidentDeclaration | FomagSignatureFormData };
