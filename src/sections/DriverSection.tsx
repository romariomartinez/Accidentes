import { Bike } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { FormField } from '../components/FormField';
import { SectionCard } from '../components/SectionCard';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { normalizeDocument, normalizePhone } from '../utils/formatters';

interface Props {
  register: UseFormRegister<TrafficAccidentDeclaration>;
  fled: boolean;
}

const documentTypes = ['CC', 'TI', 'CE', 'PAS', 'RC', 'Otro'].map((value) => ({ value, label: value }));

export const DriverSection = ({ register, fled }: Props) => (
  <SectionCard title="Información del conductor" icon={<Bike className="h-4 w-4" />}>
    <label className="mb-4 flex items-center gap-3 rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700">
      <input type="checkbox" {...register('driver.fled')} className="h-5 w-5 rounded border-slate-300 text-hospital-teal" />
      El conductor huyó del lugar
    </label>
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="Tipo de documento" name="driver.documentType" register={register} as="select" options={documentTypes} disabled={fled} />
      <FormField
        label="Número de identificación"
        name="driver.documentNumber"
        register={register}
        disabled={fled}
        onInput={(event) => {
          event.currentTarget.value = normalizeDocument(event.currentTarget.value);
        }}
      />
      <FormField label="Nombre completo" name="driver.fullName" register={register} disabled={fled} />
      <FormField label="Dirección de residencia" name="driver.address" register={register} disabled={fled} />
      <FormField
        label="Teléfono"
        name="driver.phone"
        register={register}
        disabled={fled}
        onInput={(event) => {
          event.currentTarget.value = normalizePhone(event.currentTarget.value);
        }}
      />
    </div>
  </SectionCard>
);
