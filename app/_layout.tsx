import React, { useState, useEffect } from 'react';
import { View, ScrollView, SafeAreaView, Modal, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '@/components/Header';
import StreakCounter from '@/components/StreakCounter';
import EntryCard from '@/components/EntryCard';
import EntryForm from '@/components/EntryForm';
import StatisticsModal from '@/components/StatisticsModal';
import { JournalEntry } from '@/types/index';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { MOODS } from '@/utils/moodUtils';

const App = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [statisticsModalVisible, setStatisticsModalVisible] = useState<boolean>(false);
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

  const handleSaveEntry = (entry: JournalEntry) => {
    setEntries([entry, ...entries]);
    setModalVisible(false);

    const today = formatDate(new Date());
    if (lastEntryDate === today) return;

    const yesterday = new Date(lastEntryDate || new Date());
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = formatDate(yesterday);

    if (lastEntryDate === yesterdayFormatted) {
      setStreak(streak + 1);
    } else {
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

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEditModalVisible(true);
  };

  const handleUpdateEntry = (updatedEntry: JournalEntry) => {
    setEntries(entries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    setEditModalVisible(false);
    setSelectedEntry(null);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setSelectedEntry(null);
  };

  const handleCancelNew = () => {
    setModalVisible(false);
    // Yeni giriş içeriğini sıfırla
    setNewEntry({
      id: Date.now().toString(),
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      content: '',
      moods: [],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <StreakCounter streak={streak} />

      <ScrollView style={styles.entriesList}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Henüz giriş yok. Bugün günlüğe başlamaya ne dersin!</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.statisticsButton}
          onPress={() => setStatisticsModalVisible(true)}
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

      {/* Yeni giriş ekleme formu */}
      {modalVisible && (
        <EntryForm
          entry={newEntry}
          onSave={handleSaveEntry}
          onCancel={handleCancelNew}
        />
      )}

      {/* Giriş düzenleme formu */}
      {editModalVisible && selectedEntry && (
        <EntryForm
          entry={selectedEntry}
          onSave={handleUpdateEntry}
          onCancel={handleCancelEdit}
        />
      )}

      <StatisticsModal
        visible={statisticsModalVisible}
        entries={entries}
        onClose={() => setStatisticsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  entriesList: {
    flex: 1,
    padding: 16,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 14,
    paddingLeft: 16,
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
});

export default App;