import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { JournalEntry } from '../types/index';
import { formatEntryDate } from '../utils/dateUtils'

interface EntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

const EntryCard = ({ entry, onEdit, onDelete }: EntryCardProps) => {
  
  const handleDelete = () => {
    Alert.alert(
      "Silme Onayı",
      "Bu girişi silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Evet, Sil", 
          onPress: () => onDelete(entry.id),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };
  
  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatEntryDate(entry.date)}</Text>
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
        <TouchableOpacity onPress={() => onEdit(entry)}>
          <Text style={styles.editButtonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  moodIcon: {
    fontSize: 14, 
    marginRight: 6,
  },
  moodName: {
    fontSize: 16, 
    color: '#343a40',
  },
});

export default EntryCard;