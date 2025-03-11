export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD" döndürür
  };
  
  export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString().slice(0, 4); // "HH:MM" döndürür
  };
  
  export const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('tr-TR', options); // "Ay G, YYYY" döndürür
  };
  
  export const formatEntryDate = (entryDate: string): string => {
    const today = formatDate(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = formatDate(yesterday);
  
    if (entryDate === today) {
      return 'Bugün';
    } else if (entryDate === yesterdayFormatted) {
      return 'Dün';
    } else {
      return formatFullDate(entryDate);
    }
  };