import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mood } from '../types/index';

interface MoodSelectorProps {
  moods: Mood[];
  selectedMoods: Mood[];
  onSelect: (mood: Mood) => void;
}

const MoodSelector = ({ moods, selectedMoods, onSelect }: MoodSelectorProps) => {
  return (
    <View style={styles.moodsContainer}>
      {moods.map((mood) => {
        const isSelected = selectedMoods.some((m) => m.id === mood.id);
        return (
          <TouchableOpacity
            key={mood.id}
            style={[
              styles.moodItem,
              isSelected && styles.selectedMoodItem,
            ]}
            onPress={() => onSelect(mood)}
          >
            <Text style={styles.moodIcon}>{mood.icon}</Text>
            <Text style={[
              styles.moodName,
              isSelected && styles.selectedMoodText,
            ]}>
              {mood.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
});

export default MoodSelector;