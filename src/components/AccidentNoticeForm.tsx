import { UseFormReturn } from 'react-hook-form';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { FormField } from './FormField';
import { MainDataSection } from '../sections/MainDataSection';
import { VictimSection } from '../sections/VictimSection';
import { StorySection } from '../sections/StorySection';
import { DriverSection } from '../sections/DriverSection';
import { OwnerSection } from '../sections/OwnerSection';
import { DeclarantSection } from '../sections/DeclarantSection';

export const AccidentNoticeForm = ({ form, onDictationChange }: { form: UseFormReturn<TrafficAccidentDeclaration>; onDictationChange: (active: boolean) => void }) => {
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  return <form className="app-chrome space-y-4">
    <MainDataSection register={register} errors={errors} notice />
    <VictimSection register={register} errors={errors} />
    <DriverSection register={register} fled={watch('driver.fled')} />
    <OwnerSection register={register} unknown={watch('owner.unknown')} />
    <DeclarantSection register={register} errors={errors} isVictim={watch('declarant.role') === 'La victima'} />
    <StorySection register={register} errors={errors} setValue={setValue} getValues={getValues} storyLength={watch('accident.story')?.length ?? 0} onDictationChange={onDictationChange} />
       <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-hospital-navy">Atención médica y datos del aviso</h2>
        <FormField label="Sexo de la víctima" name="victim.sex" register={register} as="select" options={[{ value: '', label: 'Seleccione' }, { value: 'Femenino', label: 'Femenino' }, { value: 'Masculino', label: 'Masculino' }, { value: 'Otro', label: 'Otro' }]} />
        <FormField label="Zona del accidente" name="accident.zone" register={register} as="select" options={[{ value: '', label: 'Seleccione' }, { value: 'Urbana', label: 'Urbana' }, { value: 'Rural', label: 'Rural' }]} />
        <FormField label="Estado de aseguramiento del vehículo" name="accident.insuranceStatus" register={register} as="select" options={[{ value: '', label: 'Seleccione' }, { value: 'Asegurado', label: 'Asegurado' }, { value: 'No asegurado', label: 'No asegurado' }, { value: 'Desconocido', label: 'Desconocido' }]} />
        <FormField label="Examen físico al ingreso" name="accident.admissionExam" register={register} as="textarea" rows={6} />
        <FormField label="Signos vitales" name="accident.vitalSigns" register={register} as="textarea" placeholder="TA, FC, FR, temperatura…" />
        <FormField label="Plan inicial de manejo" name="accident.initialTreatment" register={register} as="textarea" />
        <FormField label="Observación" name="accident.observations" register={register} as="textarea" />
      </section>

  </form>;
};
