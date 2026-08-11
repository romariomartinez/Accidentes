import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FomagSignatureFormData, FomagSignatureRecord } from '../types/fomag';
import { todayInputDate } from '../utils/formatters';
import { useLocalStorage } from './useLocalStorage';

const recordsStorageKey = 'fomag-signature-records';
const draftStorageKey = 'fomag-signature-draft';
const sequenceStorageKey = 'fomag-signature-sequences';

type FomagDraft = {
  data: FomagSignatureFormData;
  savedAt: string;
};

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
  serviceDescription: '',
  observation: '',
});

export const useFomagSignatures = () => {
  const { storedValue: records, setValue: setRecords } = useLocalStorage<FomagSignatureRecord[]>(recordsStorageKey, []);
  const initialDraft = useMemo(() => {
    const rawDraft = window.localStorage.getItem(draftStorageKey);
    if (!rawDraft) return { data: createEmptyFomagForm(), savedAt: '' };

    try {
      return JSON.parse(rawDraft) as FomagDraft;
    } catch {
      return { data: createEmptyFomagForm(), savedAt: '' };
    }
  }, []);
  const [savedAt, setSavedAt] = useState(initialDraft.savedAt);
  const form = useForm<FomagSignatureFormData>({
    defaultValues: initialDraft.data,
    mode: 'onBlur',
  });
  const data = form.watch();

  useEffect(() => {
    const subscription = form.watch((value) => {
      const nextDraft = {
        data: value as FomagSignatureFormData,
        savedAt: new Date().toISOString(),
      };
      const timer = window.setTimeout(() => {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
        setSavedAt(nextDraft.savedAt);
      }, 250);
      return () => window.clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const resetForm = () => {
    form.reset(createEmptyFomagForm());
  };

  const saveDraft = () => {
    const nextDraft = {
      data: form.getValues(),
      savedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(draftStorageKey, JSON.stringify(nextDraft));
    setSavedAt(nextDraft.savedAt);
  };

  const clearDraft = () => {
    window.localStorage.removeItem(draftStorageKey);
    form.reset(createEmptyFomagForm());
    setSavedAt('');
  };

  const saveRecord = async () => {
    const valid = await form.trigger();
    const data = form.getValues();
    if (!valid) return false;

    const record: FomagSignatureRecord = {
      ...data,
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRecords([record, ...records].slice(0, 200));
    clearDraft();
    return true;
  };

  const removeRecord = (id: string) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  return {
    form,
    data,
    records,
    savedAt,
    saveDraft,
    clearDraft,
    saveRecord,
    resetForm,
    removeRecord,
  };
};
