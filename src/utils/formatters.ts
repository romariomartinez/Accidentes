export const formatColombianDate = (value: string): string => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const formatTime12h = (value: string): string => {
  if (!value) return '';
  const [hoursRaw, minutes = '00'] = value.split(':');
  const hours = Number(hoursRaw);
  if (Number.isNaN(hours)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalized = hours % 12 || 12;
  return `${String(normalized).padStart(2, '0')}:${minutes} ${suffix}`;
};

export const normalizeDocument = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const normalizePhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 8) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
};

export const emptyText = (value: string | boolean | undefined): string => {
  if (typeof value === 'boolean') return value ? 'Si' : 'No';
  return value?.trim() || 'No registra';
};

const sequenceStorageKey = 'traffic-accident-declaration-sequences';

export const todayInputDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayCompactDate = (): string => todayInputDate().replace(/-/g, '');

// Conserva un contador global y migra los antiguos contadores diarios.
export const nextConsecutive = (storageKey: string): number => {
  const raw = window.localStorage.getItem(storageKey);
  const stored: unknown = raw ? JSON.parse(raw) : 0;
  const values = typeof stored === 'number'
    ? [stored]
    : stored && typeof stored === 'object' ? Object.values(stored) : [];
  const last = values.reduce<number>((max, value) =>
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
      ? Math.max(max, value) : max, 0);
  const next = last + 1;
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  return next;
};

export const createDeclarationNumber = (): string => {
  const nextSequence = nextConsecutive(sequenceStorageKey);
  return `BORRADOR-DAT-${todayCompactDate()}-${String(nextSequence).padStart(2, '0')}`;
};
