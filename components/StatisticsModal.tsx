import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { MoodStatistic, JournalEntry } from '../types/index';
import { calculateMoodStatistics } from '../utils/moodUtils';

interface StatisticsModalProps {
  visible: boolean;
  entries: JournalEntry[];
  onClose: () => void;
}

const StatisticsModal = ({ visible, entries, onClose }: StatisticsModalProps) => {
  const [statisticsPeriod, setStatisticsPeriod] = useState<'week' | 'month'>('week');

  const statistics = calculateMoodStatistics(entries, statisticsPeriod);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
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
          {statistics.length > 0 ? (
            statistics.map((stat, index) => (
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
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});

export default StatisticsModal;