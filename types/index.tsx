export interface Mood {
  id: number;
  name: string;
  icon: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  content: string;
  moods: Mood[];
}

export interface MoodStatistic {
  name: string;
  icon: string;
  count: number;
  percentage: number;
}