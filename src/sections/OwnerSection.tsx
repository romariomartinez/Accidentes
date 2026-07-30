import { CarFront } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { FormField } from '../components/FormField';
import { SectionCard } from '../components/SectionCard';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { normalizeDocument, normalizePhone } from '../utils/formatters';

interface Props {
  register: UseFormRegister<TrafficAccidentDeclaration>;
  unknown: boolean;
}

const documentTypes = ['CC', 'TI', 'CE', 'PAS', 'RC', 'Otro'].map((value) => ({ value, label: value }));

export const OwnerSection = ({ register, unknown }: Props) => (
  <SectionCard title="Información del propietario" icon={<CarFront className="h-4 w-4" />}>
    <label className="mb-4 flex items-center gap-3 rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700">
      <input type="checkbox" {...register('owner.unknown')} className="h-5 w-5 rounded border-slate-300 text-hospital-teal" />
      Propietario desconocido
    </label>
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="Tipo de documento" name="owner.documentType" register={register} as="select" options={documentTypes} disabled={unknown} />
      <FormField
        label="Número de identificación"
        name="owner.documentNumber"
        register={register}
        disabled={unknown}
        onInput={(event) => {
          event.currentTarget.value = normalizeDocument(event.currentTarget.value);
        }}
      />
      <FormField label="Nombre completo" name="owner.fullName" register={register} disabled={unknown} />
      <FormField label="Dirección" name="owner.address" register={register} disabled={unknown} />
      <FormField
        label="Teléfono"
        name="owner.phone"
        register={register}
        disabled={unknown}
        onInput={(event) => {
          event.currentTarget.value = normalizePhone(event.currentTarget.value);
        }}
      />
    </div>
  </SectionCard>
);
