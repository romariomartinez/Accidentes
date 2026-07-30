import { BadgeCheck } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField } from '../components/FormField';
import { SectionCard } from '../components/SectionCard';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { normalizeDocument, normalizePhone } from '../utils/formatters';

interface Props {
  register: UseFormRegister<TrafficAccidentDeclaration>;
  errors: FieldErrors<TrafficAccidentDeclaration>;
  isVictim: boolean;
}

const documentTypes = ['CC', 'TI', 'CE', 'PAS', 'RC', 'Otro'].map((value) => ({ value, label: value }));

export const DeclarantSection = ({ register, errors, isVictim }: Props) => (
  <SectionCard title="Información del declarante" icon={<BadgeCheck className="h-4 w-4" />}>
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        label="El declarante es"
        name="declarant.role"
        register={register}
        as="select"
        options={[
          { value: 'La victima', label: 'La víctima' },
          { value: 'Familiar', label: 'Familiar' },
          { value: 'Testigo', label: 'Testigo' },
          { value: 'Policia', label: 'Policía' },
          { value: 'Otro', label: 'Otro' },
        ]}
      />
      <FormField label="Tipo de documento" name="declarant.documentType" register={register} as="select" options={documentTypes} disabled={isVictim} />
      <FormField
        label="Número de identificación"
        name="declarant.documentNumber"
        register={register}
        disabled={isVictim}
        onInput={(event) => {
          event.currentTarget.value = normalizeDocument(event.currentTarget.value);
        }}
      />
      <FormField
        label="Nombre completo"
        name="declarant.fullName"
        register={register}
        error={errors.declarant?.fullName}
        disabled={isVictim}
        required
      />
      <FormField
        label="Teléfono"
        name="declarant.phone"
        register={register}
        disabled={isVictim}
        onInput={(event) => {
          event.currentTarget.value = normalizePhone(event.currentTarget.value);
        }}
      />
    </div>
  </SectionCard>
);
