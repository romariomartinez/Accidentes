import { FileText } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { DeclarantSection } from '../sections/DeclarantSection';
import { DriverSection } from '../sections/DriverSection';
import { MainDataSection } from '../sections/MainDataSection';
import { OwnerSection } from '../sections/OwnerSection';
import { StorySection } from '../sections/StorySection';
import { VictimSection } from '../sections/VictimSection';

interface Props {
  form: UseFormReturn<TrafficAccidentDeclaration>;
  onLoadExample: () => void;
}

export const AccidentForm = ({ form, onLoadExample }: Props) => {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = form;

  return (
    <form className="app-chrome space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-hospital-navy">
          <FileText className="h-5 w-5 text-hospital-teal" />
          Formulario de captura
        </div>
        <button type="button" className="btn-green" onClick={onLoadExample}>
          Cargar ejemplo
        </button>
      </div>
      <MainDataSection register={register} errors={errors} />
      <StorySection
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
        storyLength={watch('accident.story')?.length ?? 0}
      />
      <VictimSection register={register} errors={errors} />
      <DriverSection register={register} fled={watch('driver.fled')} />
      <OwnerSection register={register} unknown={watch('owner.unknown')} />
      <DeclarantSection register={register} errors={errors} isVictim={watch('declarant.role') === 'La victima'} />
    </form>
  );
};
