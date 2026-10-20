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
}

export const AccidentForm = ({ form }: Props) => {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = form;

  return (
    <form className="app-chrome space-y-4">
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
