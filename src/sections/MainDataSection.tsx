import { CalendarClock, MapPinned } from 'lucide-react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { FormField } from '../components/FormField';
import { SectionCard } from '../components/SectionCard';
import { TrafficAccidentDeclaration } from '../types/declaration';

interface Props {
  register: UseFormRegister<TrafficAccidentDeclaration>;
  errors: FieldErrors<TrafficAccidentDeclaration>;
}

const victimRoles = ['Peaton', 'Conductor', 'Pasajero', 'Ciclista', 'Ocupante', 'Otro'].map((value) => ({
  value,
  label: value === 'Peaton' ? 'Peatón' : value,
}));

export const MainDataSection = ({ register, errors }: Props) => (
  <SectionCard title="Datos principales" icon={<MapPinned className="h-4 w-4" />}>
    <div className="grid gap-4 md:grid-cols-2">
      <FormField label="Número de declaración" name="accident.declarationNumber" register={register} readOnly />
      <FormField label="Fecha de registro" name="accident.registrationDate" register={register} type="date" readOnly />
      <FormField label="Víctima en calidad de" name="accident.victimRole" register={register} as="select" options={victimRoles} />
      <FormField
        label="Lugar del accidente"
        name="accident.place"
        register={register}
        error={errors.accident?.place}
        required
      />
      <FormField label="Municipio" name="accident.municipality" register={register} />
      <FormField label="Departamento" name="accident.department" register={register} />
      <FormField
        label="Fecha del accidente"
        name="accident.accidentDate"
        register={register}
        type="date"
        error={errors.accident?.accidentDate}
        required
      />
      <FormField label="Hora del accidente" name="accident.accidentTime" register={register} type="time" />
      <FormField
        label="Fecha de ingreso"
        name="accident.admissionDate"
        register={register}
        type="date"
        error={errors.accident?.admissionDate}
        required
      />
      <FormField label="Hora de ingreso" name="accident.admissionTime" register={register} type="time" />
      <FormField label="Fecha de egreso" name="accident.dischargeDate" register={register} type="date" />
      <FormField label="Hora de egreso" name="accident.dischargeTime" register={register} type="time" />
      <FormField label="Tipo de vehículo involucrado" name="accident.vehicleType" register={register} />
      <FormField label="Placa" name="accident.licensePlate" register={register} />
      <FormField label="Tipo de vía" name="accident.roadType" register={register} />
      <div className="md:col-span-2">
        <FormField
          label="Observaciones adicionales"
          name="accident.observations"
          register={register}
          as="textarea"
          rows={2}
        />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-sm text-hospital-navy">
      <CalendarClock className="h-4 w-4 text-hospital-teal" />
      La numeración y la fecha de registro se generan automáticamente, pero pueden ajustarse.
    </div>
  </SectionCard>
);
