import { TrafficAccidentDeclaration } from '../types/declaration';
import { getMissingPrintFields } from '../utils/validators';

export const usePrint = () => {
  const print = (data: TrafficAccidentDeclaration, onMissing: (fields: string[]) => void) => {
    const missing = getMissingPrintFields(data);
    if (missing.length) {
      onMissing(missing);
      return false;
    }
    const previousTitle = document.title;
    document.title = ' ';
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 500);
    return true;
  };

  return { print };
};
