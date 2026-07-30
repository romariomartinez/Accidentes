import { Clipboard, Eraser, Sparkles, Wand2 } from 'lucide-react';
import { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { FormField } from '../components/FormField';
import { SectionCard } from '../components/SectionCard';
import { TrafficAccidentDeclaration } from '../types/declaration';
import { generateStory, improveStory } from '../utils/storyGenerator';

interface Props {
  register: UseFormRegister<TrafficAccidentDeclaration>;
  errors: FieldErrors<TrafficAccidentDeclaration>;
  setValue: UseFormSetValue<TrafficAccidentDeclaration>;
  getValues: UseFormGetValues<TrafficAccidentDeclaration>;
  storyLength: number;
}

export const StorySection = ({ register, errors, setValue, getValues, storyLength }: Props) => {
  const copyStory = async () => {
    await navigator.clipboard.writeText(getValues('accident.story'));
  };

  return (
    <SectionCard title="Relato de los hechos" icon={<Sparkles className="h-4 w-4" />}>
      <FormField
        label="Relato"
        name="accident.story"
        register={register}
        as="textarea"
        rows={8}
        error={errors.accident?.story}
        required
        placeholder="Describa de forma clara las circunstancias del accidente..."
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">{storyLength} caracteres</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" onClick={() => setValue('accident.story', generateStory(getValues()))}>
            <Sparkles className="h-4 w-4" />
            Generar relato
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setValue('accident.story', improveStory(getValues('accident.story')))}
          >
            <Wand2 className="h-4 w-4" />
            Mejorar redacción
          </button>
          <button type="button" className="btn-ghost" onClick={copyStory}>
            <Clipboard className="h-4 w-4" />
            Copiar
          </button>
          <button type="button" className="btn-ghost" onClick={() => setValue('accident.story', '')}>
            <Eraser className="h-4 w-4" />
            Limpiar relato
          </button>
        </div>
      </div>
    </SectionCard>
  );
};
