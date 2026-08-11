import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FomagSignatureFormData, FomagSignatureRecord } from '../types/fomag';
import { todayInputDate } from '../utils/formatters';
import { useLocalStorage } from './useLocalStorage';

const recordsStorageKey = 'fomag-signature-records';
const sequenceStorageKey = 'fomag-signature-sequences';

const createRecordNumber = (): string => {
  const date = todayInputDate().replace(/-/g, '');
  const rawSequences = window.localStorage.getItem(sequenceStorageKey);
  const sequences = rawSequences ? (JSON.parse(rawSequences) as Record<string, number>) : {};
  const nextSequence = (sequences[date] ?? 0) + 1;
  sequences[date] = nextSequence;
  window.localStorage.setItem(sequenceStorageKey, JSON.stringify(sequences));
  return `FOMAG-${date}-${String(nextSequence).padStart(2, '0')}`;
};

const createEmptyFomagForm = (): FomagSignatureFormData => ({
  recordNumber: createRecordNumber(),
  registerDate: todayInputDate(),
  patientName: '',
  documentType: 'CC',
  documentNumber: '',
  phone: '',
  serviceDate: todayInputDate(),
  invoiceNumber: '',
  serviceDescription: '',
  observation: '',
  signature: '',
});

export const useFomagSignatures = () => {
  const { storedValue: records, setValue: setRecords } = useLocalStorage<FomagSignatureRecord[]>(recordsStorageKey, []);
  const emptyForm = useMemo(() => createEmptyFomagForm(), []);
  const form = useForm<FomagSignatureFormData>({
    defaultValues: emptyForm,
    mode: 'onBlur',
  });

  const resetForm = () => {
    form.reset(createEmptyFomagForm());
  };

  const saveRecord = async () => {
    const valid = await form.trigger();
    const data = form.getValues();
    if (!valid || !data.signature) return false;

    const record: FomagSignatureRecord = {
      ...data,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRecords([record, ...records].slice(0, 200));
    resetForm();
    return true;
  };

  const removeRecord = (id: string) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  return {
    form,
    records,
    saveRecord,
    resetForm,
    removeRecord,
  };
};
