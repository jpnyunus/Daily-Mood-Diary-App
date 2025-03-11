import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Mood, JournalEntry } from '../types/index';
import { MOODS } from '../utils/moodUtils';
import { formatFullDate, formatTime } from '../utils/dateUtils';

interface EntryFormProps {
  entry: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
}

const EntryForm = ({ entry, onSave, onCancel }: EntryFormProps) => {
  const [newEntry, setNewEntry] = useState<JournalEntry>(entry);

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

  return (
    <View style={styles.modalContainer}>
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
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => onSave(newEntry)}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
});

export default EntryForm;