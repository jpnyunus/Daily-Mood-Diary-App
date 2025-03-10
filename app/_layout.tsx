import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Veri yapıları için türleri tanımlayın
interface Mood {
  id: number;
  name: string;
  icon: string;
}

interface JournalEntry {
  id: string;
  date: string;
  time: string;
  content: string;
  moods: Mood[];
}

interface MoodStatistic {
  name: string;
  icon: string;
  count: number;
  percentage: number;
}

// date-fns yerine özel tarih biçimlendirme işlevleri
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD" döndürür
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString().slice(0, 5); // "HH:MM" döndürür
};

const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('tr-TR', options); // "Ay G, YYYY" döndürür
};

// İkonlu ruh hali seçenekleri
const MOODS: Mood[] = [
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

const MoodJournalApp = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [statisticsModalVisible, setStatisticsModalVisible] = useState<boolean>(false); // İstatistik modali için durum
  const [statisticsPeriod, setStatisticsPeriod] = useState<'week' | 'month'>('week'); // Haftalık/aylık görünüm durumu
  const [newEntry, setNewEntry] = useState<JournalEntry>({
    id: Date.now().toString(),
    date: formatDate(new Date()),
    time: formatTime(new Date()),
    content: '',
    moods: [],
  });
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [lastEntryDate, setLastEntryDate] = useState<string | null>(null);

  // Uygulama başladığında kaydedilmiş girişleri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedEntries = await AsyncStorage.getItem('journal_entries');
        if (savedEntries) {
          const parsedEntries = JSON.parse(savedEntries);
          setEntries(parsedEntries);
          setStreak(calculateStreak(parsedEntries));
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };
    
    loadData();
  }, []);

  // Girişler değiştiğinde depolamaya kaydet
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('journal_entries', JSON.stringify(entries));
        await AsyncStorage.setItem('streak', streak.toString());
        await AsyncStorage.setItem('lastEntryDate', lastEntryDate || '');
      } catch (error) {
        console.error('Veriler kaydedilirken hata oluştu:', error);
      }
    };
    
    saveData();
  }, [entries, streak, lastEntryDate]);

  const handleNewEntry = () => {
    setNewEntry({
      id: Date.now().toString(),
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      content: '',
      moods: [],
    });
    setModalVisible(true);
  };

  const handleSaveEntry = () => {
    if (newEntry.content.trim() === '' && newEntry.moods.length === 0) {
      return; // Boş girişleri kaydetme
    }
    
    setEntries([newEntry, ...entries]);
    setModalVisible(false);

    // Seri mantığını güncelle
    const today = formatDate(new Date());
    if (lastEntryDate === today) {
      // Aynı gün içinde birden fazla giriş yapıldı, seriyi güncelleme
      return;
    }

    const yesterday = new Date(lastEntryDate || new Date());
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = formatDate(yesterday);

    if (lastEntryDate === yesterdayFormatted) {
      // Dün giriş yapılmış, seriyi artır
      setStreak(streak + 1);
    } else {
      // Seri kırılmış, yeni seriye başla
      setStreak(1);
    }

    setLastEntryDate(today);
  };

  const calculateStreak = (entries: JournalEntry[]) => {
    if (entries.length === 0) return 0;
    
    const sortedDates = [...new Set(entries.map(e => e.date))].sort();
    let currentStreak = 1;
  
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const currentDate = new Date(sortedDates[i]);
      const prevDate = new Date(sortedDates[i - 1]);
      
      if ((currentDate.getTime() - prevDate.getTime()) === 86400000) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };
  
  // Her yeni girişte çağırın:
  useEffect(() => {
    setStreak(calculateStreak(entries));
  }, [entries]);
  

  const toggleMood = (moodId: number) => {
    const isMoodSelected = newEntry.moods.some(mood => mood.id === moodId);
    
    if (isMoodSelected) {
      setNewEntry({
        ...newEntry,
        moods: newEntry.moods.filter(mood => mood.id !== moodId),
      });
    } else {
      const moodToAdd = MOODS.find(mood => mood.id === moodId);
      if (moodToAdd) {
        setNewEntry({
          ...newEntry,
          moods: [...newEntry.moods, moodToAdd],
        });
      }
    }
  };

  // Girişleri silme fonksiyonu
  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  // Bir girişi düzenlemek için fonksiyonu açan fonksiyon
  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEditModalVisible(true);
  };

  // Düzenlemeyi işleyen fonksiyon
  const handleUpdateEntry = (updatedEntry: JournalEntry) => {
    // Girişleri yeni girişle değiştir
    const updatedEntries = entries.map(entry =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setEntries(updatedEntries);
    setEditModalVisible(false);
    setSelectedEntry(null);
  };

  const formatEntryDate = (entry: JournalEntry) => {
    const today = formatDate(new Date());
    
    // Dünün tarihini hesapla
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = formatDate(yesterday);
    
    if (entry.date === today) {
      return 'Bugün';
    } else if (entry.date === yesterdayFormatted) {
      return 'Dün';
    } else {
      return formatFullDate(entry.date);
    }
  };

  // İstatistikleri hesaplama fonksiyonu
  const calculateMoodStatistics = (periodType: 'week' | 'month') => {
    const now = new Date();
    
    // Başlangıç tarihini ayarla (1 hafta veya 1 ay öncesi)
    const startDate = new Date();
    if (periodType === 'week') {
      startDate.setDate(now.getDate() - 7); // 1 hafta öncesi
    } else {
      startDate.setMonth(now.getMonth() - 1); // 1 ay öncesi
    }
    
    // Tarih aralığındaki girişleri filtrele
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= now;
    });
    
    // Tüm ruh hallerini topla
    const allMoods: Mood[] = [];
    filteredEntries.forEach(entry => {
      entry.moods.forEach(mood => {
        allMoods.push(mood);
      });
    });
    
    // Ruh hallerini say
    const moodCounts: { [key: string]: number } = {};
    allMoods.forEach(mood => {
      moodCounts[mood.id] = (moodCounts[mood.id] || 0) + 1;
    });
    
    // İstatistikleri hazırla
    const totalMoodCount = allMoods.length;
    const statistics: MoodStatistic[] = [];
    
    Object.keys(moodCounts).forEach(moodId => {
      const mood = MOODS.find(m => m.id === parseInt(moodId));
      if (mood) {
        statistics.push({
          name: mood.name,
          icon: mood.icon,
          count: moodCounts[moodId],
          percentage: Math.round((moodCounts[moodId] / totalMoodCount) * 100)
        });
      }
    });
    
    // En çok kullanılandan en az kullanılana doğru sırala
    return statistics.sort((a, b) => b.count - a.count);
  };

  // İstatistik modalini açma fonksiyonu
  const handleOpenStatistics = () => {
    setStatisticsPeriod('week'); // Varsayılan olarak haftalık görünüm
    setStatisticsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ruh Hali Günlüğü</Text>
      </View>

      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>Günlük Seriniz: {streak} gün</Text>
      </View>
      
      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Henüz giriş yok. Bugün günlüğe başlamaya ne dersin!</Text>
        </View>
      ) : (
        <ScrollView style={styles.entriesList}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatEntryDate(entry)}</Text>
                <Text style={styles.entryTime}>{entry.time}</Text>
              </View>
              
              {entry.content !== '' && (
                <Text style={styles.entryContent}>{entry.content}</Text>
              )}
              
              {entry.moods.length > 0 && (
                <View style={styles.entryMoodsContainer}>
                  {entry.moods.map((mood) => (
                    <View key={mood.id} style={styles.entryMoodItem}>
                      <Text style={styles.moodIcon}>{mood.icon}</Text>
                      <Text style={styles.moodName}>{mood.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.entryActions}>
                <TouchableOpacity onPress={() => handleEditEntry(entry)}>
                  <Text style={styles.editButtonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.statisticsButton}
          onPress={handleOpenStatistics}
        >
          <Text style={styles.statisticsButtonText}>📊</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleNewEntry}
        >
          <Text style={styles.addButtonText}>EKLE</Text>
        </TouchableOpacity>
      </View>

      {/* Yeni Giriş Modali */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Giriş</Text>
            <Text style={styles.modalDate}>
              {formatFullDate(newEntry.date)} • {newEntry.time}
            </Text>
          </View>

          <TextInput
            style={styles.entryInput}
            placeholder="Gününüz nasıldı?"
            multiline
            value={newEntry.content}
            onChangeText={(text) => setNewEntry({...newEntry, content: text})}
          />

          <Text style={styles.moodSectionTitle}>Bugün nasıl hissediyorsunuz?</Text>
          <Text style={styles.moodSectionSubtitle}>Uygun olanları seçin</Text>

          <FlatList
            data={MOODS}
            numColumns={4}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = newEntry.moods.some(mood => mood.id === item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.moodItem,
                    isSelected && styles.selectedMoodItem
                  ]}
                  onPress={() => toggleMood(item.id)}
                >
                  <Text style={styles.moodIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.moodName,
                    isSelected && styles.selectedMoodText
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            style={styles.moodsList}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveEntry}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Düzenleme Modali */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {selectedEntry && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Girişi Düzenle</Text>
                <Text style={styles.modalDate}>
                  {formatFullDate(selectedEntry.date)} • {selectedEntry.time}
                </Text>
              </View>

              <TextInput
                style={styles.entryInput}
                placeholder="Gününüz nasıldı?"
                multiline
                value={selectedEntry.content}
                onChangeText={(text) => setSelectedEntry({ ...selectedEntry, content: text })}
              />

              <Text style={styles.moodSectionTitle}>Bugün nasıl hissediyorsunuz?</Text>
              <Text style={styles.moodSectionSubtitle}>Uygun olanları seçin</Text>

              <FlatList
                data={MOODS}
                numColumns={4}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const isSelected = selectedEntry.moods.some(mood => mood.id === item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.moodItem,
                        isSelected && styles.selectedMoodItem
                      ]}
                      onPress={() => {
                        if (selectedEntry) {
                          const updatedMoods = isSelected
                            ? selectedEntry.moods.filter(mood => mood.id !== item.id)
                            : [...selectedEntry.moods, item];
          
                          setSelectedEntry({ ...selectedEntry, moods: updatedMoods });
                        }
                      }}
                    >
                      <Text style={styles.moodIcon}>{item.icon}</Text>
                      <Text style={[
                        styles.moodName,
                        isSelected && styles.selectedMoodText
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                style={styles.moodsList}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    if (selectedEntry) {
                      handleUpdateEntry(selectedEntry);
                    }
                  }}
                >
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* İstatistik Modali */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={statisticsModalVisible}
        onRequestClose={() => setStatisticsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ruh Hali İstatistikleri</Text>
            <Text style={styles.modalDate}>
              {statisticsPeriod === 'week' ? 'Son 7 Gün' : 'Son 30 Gün'}
            </Text>
          </View>

          <View style={styles.statisticsPeriodSelector}>
            <TouchableOpacity 
              style={[
                styles.periodButton, 
                statisticsPeriod === 'week' && styles.activePeriodButton
              ]}
              onPress={() => setStatisticsPeriod('week')}
            >
              <Text style={[
                styles.periodButtonText,
                statisticsPeriod === 'week' && styles.activePeriodButtonText
              ]}>Haftalık</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.periodButton, 
                statisticsPeriod === 'month' && styles.activePeriodButton
              ]}
              onPress={() => setStatisticsPeriod('month')}
            >
              <Text style={[
                styles.periodButtonText,
                statisticsPeriod === 'month' && styles.activePeriodButtonText
              ]}>Aylık</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.statisticsContainer}>
            {calculateMoodStatistics(statisticsPeriod).length > 0 ? (
              calculateMoodStatistics(statisticsPeriod).map((stat, index) => (
                <View key={index} style={styles.statisticItem}>
                  <View style={styles.statisticHeader}>
                    <Text style={styles.statisticIcon}>{stat.icon}</Text>
                    <Text style={styles.statisticName}>{stat.name}</Text>
                    <Text style={styles.statisticCount}>{stat.count} kez</Text>
                  </View>
                  <View style={styles.statisticBarContainer}>
                    <View 
                      style={[
                        styles.statisticBar, 
                        { width: `${stat.percentage}%` }
                      ]} 
                    />
                    <Text style={styles.statisticPercentage}>{stat.percentage}%</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {statisticsPeriod === 'week' 
                    ? 'Son 7 günde kaydedilmiş ruh hali bulunamadı.' 
                    : 'Son 30 günde kaydedilmiş ruh hali bulunamadı.'}
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setStatisticsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  streakContainer: {
    padding: 10,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  entriesList: {
    flex: 1,
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  entryTime: {
    fontSize: 14,
    color: '#6c757d',
  },
  entryContent: {
    fontSize: 16,
    color: '#343a40',
    marginBottom: 12,
    lineHeight: 22,
  },
  entryMoodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entryMoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  entryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButtonText: {
    color: 'blue',
    marginRight: 10,
  },
  deleteButtonText: {
    color: 'red',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Sola hizala
    alignItems: 'center',
    paddingBottom: 14,
    paddingLeft: 16, // Butonu biraz içeri almak için
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginLeft: 10,
  },
  addButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statisticsButton: {
    width: 38,
    height: 38,
    borderRadius: 24,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    marginRight: 10,
  },
  statisticsButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    padding: 16,
    backgroundColor: '#6200ee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  entryInput: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moodSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginHorizontal: 16,
    marginTop: 16,
  },
  moodSectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  moodsList: {
    paddingHorizontal: 8,
  },
  moodItem: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    padding: 12,
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#f1f3f5',
  },
  selectedMoodItem: {
    backgroundColor: '#d0c4f7',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  moodIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodName: {
    fontSize: 12,
    color: '#495057',
    textAlign: 'center',
  },
  selectedMoodText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 'auto',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // İstatistik modali için yeni stiller
  statisticsPeriodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#f1f3f5',
  },
  activePeriodButton: {
    backgroundColor: '#d0c4f7',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  activePeriodButtonText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  statisticsContainer: {
    flex: 1,
    padding: 16,
  },
  statisticItem: {
    marginBottom: 16,
  },
  statisticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statisticIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statisticName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginRight: 8,
  },
  statisticCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  statisticBarContainer: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1f3f5',
    overflow: 'hidden',
    position: 'relative',
  },
  statisticBar: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 10,
  },
  statisticPercentage: {
    position: 'absolute',
    right: 8,
    top: 2,
    fontSize: 12,
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default MoodJournalApp;