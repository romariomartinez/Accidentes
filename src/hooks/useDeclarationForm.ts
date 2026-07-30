import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { createDeclarationNumber, todayInputDate } from '../utils/formatters';
import { generateStory } from '../utils/storyGenerator';
import { useLocalStorage } from './useLocalStorage';

const storageKey = 'traffic-accident-declaration-draft';

const isTodayDeclarationNumber = (value: string, date: string): boolean => {
  const compactDate = date.replace(/-/g, '');
  return new RegExp(`^DAT-${compactDate}-\\d{2}$`).test(value);
};

export const createEmptyDeclaration = (): TrafficAccidentDeclaration => ({
  accident: {
    declarationNumber: createDeclarationNumber(),
    registrationDate: todayInputDate(),
    victimRole: 'Peaton',
    place: '',
    municipality: '',
    department: '',
    accidentDate: '',
    accidentTime: '',
    admissionDate: '',
    admissionTime: '',
    dischargeDate: '',
    dischargeTime: '',
    vehicleType: '',
    licensePlate: '',
    roadType: '',
    observations: '',
    story: '',
  },
  victim: {
    documentType: 'CC',
    documentNumber: '',
    fullName: '',
    address: '',
    municipality: '',
    department: '',
    phone: '',
    age: '',
    sex: '',
  },
  driver: {
    fled: false,
    documentType: 'CC',
    documentNumber: '',
    fullName: '',
    address: '',
    phone: '',
  },
  owner: {
    unknown: false,
    documentType: 'CC',
    documentNumber: '',
    fullName: '',
    address: '',
    phone: '',
  },
  declarant: {
    role: 'La victima',
    documentType: 'CC',
    documentNumber: '',
    fullName: '',
    phone: '',
  },
  metadata: {
    createdAt: new Date().toISOString(),
    savedAt: '',
  },
});

export const createExampleDeclaration = (): TrafficAccidentDeclaration => {
  const data = createEmptyDeclaration();
  data.accident = {
    ...data.accident,
    victimRole: 'Peaton',
    place: 'Calle 10, Barrio Las Flores, zona urbana del municipio de Pueblo Bello',
    municipality: 'Pueblo Bello',
    department: 'Cesar',
    accidentDate: '2026-07-23',
    accidentTime: '19:00',
    admissionDate: '2026-07-23',
    admissionTime: '20:02',
    vehicleType: 'Motocicleta',
  };
  data.victim = {
    documentType: 'CC',
    documentNumber: '1.007.532.892',
    fullName: 'Yerlis Paola García Núñez',
    address: 'Barrio Los Pinos, zona urbana de Pueblo Bello',
    municipality: 'Pueblo Bello',
    department: 'Cesar',
    phone: '318-763-43-14',
    age: '',
    sex: 'Femenino',
  };
  data.driver = {
    fled: true,
    documentType: 'CC',
    documentNumber: 'No conocida',
    fullName: 'Conductor huyó del lugar de los hechos; se desconocen sus datos personales y paradero',
    address: 'No conocida',
    phone: 'No conocido',
  };
  data.owner = {
    unknown: true,
    documentType: 'CC',
    documentNumber: 'No conocido',
    fullName: 'No conocido',
    address: 'No conocido',
    phone: 'No conocido',
  };
  data.declarant = {
    role: 'La victima',
    documentType: 'CC',
    documentNumber: data.victim.documentNumber,
    fullName: data.victim.fullName,
    phone: data.victim.phone,
  };
  data.accident.story = generateStory(data);
  return data;
};

export const useDeclarationForm = () => {
  const emptyDeclaration = useMemo(() => {
    const draft = window.localStorage.getItem(storageKey);
    if (!draft) return createEmptyDeclaration();

    try {
      return JSON.parse(draft) as TrafficAccidentDeclaration;
    } catch {
      return createEmptyDeclaration();
    }
  }, []);
  const { storedValue, setValue, removeValue } = useLocalStorage<TrafficAccidentDeclaration>(
    storageKey,
    emptyDeclaration,
  );
  const [savedAt, setSavedAt] = useState(storedValue.metadata.savedAt);
  const form = useForm<TrafficAccidentDeclaration>({
    defaultValues: storedValue,
    mode: 'onBlur',
  });

  const watchedData = form.watch();
  const driverFled = form.watch('driver.fled');
  const ownerUnknown = form.watch('owner.unknown');
  const declarantRole = form.watch('declarant.role');
  const victim = form.watch('victim');

  useEffect(() => {
    const today = todayInputDate();
    const current = form.getValues();
    const needsCurrentDate = current.accident.registrationDate !== today;
    const needsCurrentNumber = !isTodayDeclarationNumber(current.accident.declarationNumber, today);

    if (!needsCurrentDate && !needsCurrentNumber) return;

    const nextValue: TrafficAccidentDeclaration = {
      ...current,
      accident: {
        ...current.accident,
        registrationDate: today,
        declarationNumber: createDeclarationNumber(),
      },
    };

    form.reset(nextValue);
    setValue(nextValue);
  }, [form, setValue]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      const nextValue = {
        ...(value as TrafficAccidentDeclaration),
        metadata: {
          createdAt: value.metadata?.createdAt ?? emptyDeclaration.metadata.createdAt,
          savedAt: new Date().toISOString(),
        },
      };
      const timer = window.setTimeout(() => {
        setValue(nextValue);
        setSavedAt(nextValue.metadata.savedAt);
      }, 250);
      return () => window.clearTimeout(timer);
    });
    return () => subscription.unsubscribe();
  }, [emptyDeclaration.metadata, form, setValue]);

  useEffect(() => {
    if (!driverFled) return;
    form.setValue('driver.fullName', 'Conductor huyó del lugar de los hechos; se desconocen sus datos personales y paradero');
    form.setValue('driver.documentNumber', 'No conocida');
    form.setValue('driver.address', 'No conocida');
    form.setValue('driver.phone', 'No conocido');
  }, [driverFled, form]);

  useEffect(() => {
    if (!ownerUnknown) return;
    form.setValue('owner.fullName', 'No conocido');
    form.setValue('owner.documentNumber', 'No conocido');
    form.setValue('owner.address', 'No conocido');
    form.setValue('owner.phone', 'No conocido');
  }, [form, ownerUnknown]);

  useEffect(() => {
    if (declarantRole !== 'La victima') return;
    form.setValue('declarant.documentType', victim.documentType);
    form.setValue('declarant.documentNumber', victim.documentNumber);
    form.setValue('declarant.fullName', victim.fullName);
    form.setValue('declarant.phone', victim.phone);
  }, [declarantRole, form, victim.documentNumber, victim.documentType, victim.fullName, victim.phone]);

  const saveDraft = () => {
    const data = form.getValues();
    const nextValue = { ...data, metadata: { ...data.metadata, savedAt: new Date().toISOString() } };
    setValue(nextValue);
    setSavedAt(nextValue.metadata.savedAt);
  };

  const clearDraft = () => {
    removeValue();
    const fresh = createEmptyDeclaration();
    form.reset(fresh);
    setSavedAt('');
  };

  const loadExample = () => {
    const example = createExampleDeclaration();
    form.reset(example);
    setValue(example);
    setSavedAt(new Date().toISOString());
  };

  return {
    form,
    data: watchedData,
    savedAt,
    saveDraft,
    clearDraft,
    loadExample,
  };
};
