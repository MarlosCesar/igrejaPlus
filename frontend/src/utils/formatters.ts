/**
 * Utility functions for formatting Brazilian dates and timestamps (DD/MM/AAAA).
 */

export const formatDateBR = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  const cleanStr = dateStr.split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year.length === 4) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  return dateStr;
};

export const formatDateTimeBR = (dateTimeStr?: string | null): string => {
  if (!dateTimeStr) return '-';
  try {
    const cleanStr = dateTimeStr.replace(' ', 'T');
    const dateObj = new Date(cleanStr);
    if (isNaN(dateObj.getTime())) {
      return formatDateBR(dateTimeStr);
    }
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateTimeStr;
  }
};
