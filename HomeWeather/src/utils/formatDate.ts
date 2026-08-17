import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "d MMM yyyy 'à' HH:mm", { locale: fr });
  } catch (e) {
    return dateString;
  }
};

export const extractTimeForChart = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, "HH:mm");
  } catch (e) {
    return '';
  }
};
