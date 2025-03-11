import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter = ({ streak }: StreakCounterProps) => {
  return (
    <View style={styles.streakContainer}>
      <Text style={styles.streakText}>Günlük Seriniz: {streak} gün</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  streakContainer: {
    padding: 10,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
});

export default StreakCounter;