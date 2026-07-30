import { UserRound } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField } from '../components/FormField';
import { SectionCard } from '../components/SectionCard';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { normalizeDocument, normalizePhone } from '../utils/formatters';

interface Props {
  register: UseFormRegister<TrafficAccidentDeclaration>;
  errors: FieldErrors<TrafficAccidentDeclaration>;
}

const documentTypes = ['CC', 'TI', 'CE', 'PAS', 'RC', 'Otro'].map((value) => ({ value, label: value }));

export const VictimSection = ({ register, errors }: Props) => (
  <SectionCard title="Información de la víctima" icon={<UserRound className="h-4 w-4" />}>
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="Tipo de documento" name="victim.documentType" register={register} as="select" options={documentTypes} />
      <FormField
        label="Número de identificación"
        name="victim.documentNumber"
        register={register}
        error={errors.victim?.documentNumber}
        required
        onInput={(event) => {
          event.currentTarget.value = normalizeDocument(event.currentTarget.value);
        }}
      />
      <FormField
        label="Nombres y apellidos"
        name="victim.fullName"
        register={register}
        error={errors.victim?.fullName}
        required
      />
      <FormField label="Dirección de residencia" name="victim.address" register={register} />
      <FormField label="Municipio" name="victim.municipality" register={register} />
      <FormField label="Departamento" name="victim.department" register={register} />
      <FormField
        label="Teléfono"
        name="victim.phone"
        register={register}
        onInput={(event) => {
          event.currentTarget.value = normalizePhone(event.currentTarget.value);
        }}
      />
      <FormField label="Edad" name="victim.age" register={register} type="number" />
      <FormField
        label="Sexo"
        name="victim.sex"
        register={register}
        as="select"
        options={[
          { value: '', label: 'Seleccionar' },
          { value: 'Femenino', label: 'Femenino' },
          { value: 'Masculino', label: 'Masculino' },
          { value: 'Otro', label: 'Otro' },
        ]}
      />
    </div>
  </SectionCard>
);
