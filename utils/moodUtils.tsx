import { Mood, JournalEntry, MoodStatistic } from '../types/index';

export const MOODS: Mood[] = [
  { id: 1, name: 'Mutlu', icon: '😊' },
  { id: 2, name: 'Harika', icon: '🥰' },
  { id: 3, name: 'Stresli', icon: '😫' },
  { id: 4, name: 'Üzgün', icon: '😔' },
  { id: 5, name: 'Uykusuz', icon: '😴' },
  { id: 6, name: 'Para düşkünü', icon: '💰' },
  { id: 7, name: 'Özgür', icon: '🦋' },
  { id: 8, name: 'Yorgun', icon: '😩' },
  { id: 9, name: 'Motivasyonlu', icon: '💪' },
  { id: 10, name: 'Kaygılı', icon: '😰' },
  { id: 11, name: 'Yaratıcı', icon: '🎨' },
  { id: 12, name: 'Huzurlu', icon: '🧘' },
  { id: 13, name: 'Coşkulu', icon: '🔥' },
  { id: 14, name: 'Meraklı', icon: '🤔' },
  { id: 15, name: 'Dikkatli', icon: '👀' },
  { id: 16, name: 'Sakin', icon: '🙏' },
  { id: 17, name: 'Heyecanlı', icon: '🎉' },
  { id: 18, name: 'Çılgın', icon: '🤪' },
  { id: 19, name: 'İlhamlı', icon: '💫' },
  { id: 20, name: 'Gururlu', icon: '👑' },
  { id: 21, name: 'Korkulu', icon: '😨' },
  { id: 22, name: 'Sabırsız', icon: '🕰️' },
  { id: 23, name: 'Sevinçli', icon: '😃' },
  { id: 24, name: 'Endişeli', icon: '😟' },
  { id: 25, name: 'Neşeli', icon: '😁' },
  { id: 26, name: 'Hırslı', icon: '🚀' },
  { id: 27, name: 'Duygusal', icon: '💖' },
  { id: 28, name: 'İsyankar', icon: '🤘' },
  { id: 29, name: 'Barışçıl', icon: '🕊️' },
];

export const calculateMoodStatistics = (
  entries: JournalEntry[],
  periodType: 'week' | 'month'
): MoodStatistic[] => {
  const now = new Date();
  const startDate = new Date();
  if (periodType === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else {
    startDate.setMonth(now.getMonth() - 1);
  }

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= now;
  });

  const allMoods: Mood[] = [];
  filteredEntries.forEach(entry => {
    entry.moods.forEach(mood => {
      allMoods.push(mood);
    });
  });

  const moodCounts: { [key: string]: number } = {};
  allMoods.forEach(mood => {
    moodCounts[mood.id] = (moodCounts[mood.id] || 0) + 1;
  });

  const totalMoodCount = allMoods.length;
  const statistics: MoodStatistic[] = [];

  Object.keys(moodCounts).forEach(moodId => {
    const mood = MOODS.find(m => m.id === parseInt(moodId));
    if (mood) {
      statistics.push({
        name: mood.name,
        icon: mood.icon,
        count: moodCounts[moodId],
        percentage: Math.round((moodCounts[moodId] / totalMoodCount) * 100),
      });
    }
  });

  return statistics.sort((a, b) => b.count - a.count);
};