import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { vacationAPI } from '../../services/api';

export default function HomeScreen({ navigation }) {
  const [nextVacation, setNextVacation] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    loadNextVacation();
  }, []);

  useEffect(() => {
    if (nextVacation) {
      const timer = setInterval(() => {
        calculateCountdown();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [nextVacation]);

  const loadNextVacation = async () => {
    try {
      const response = await vacationAPI.getAll();
      const vacations = response.data?.data || [];

      // Find next upcoming vacation
      const upcoming = vacations
        .filter(v => new Date(v.start_date) > new Date())
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];

      setNextVacation(upcoming);
    } catch (error) {
      console.error('Error loading vacation:', error);
    }
  };

  const calculateCountdown = () => {
    if (!nextVacation) return;

    const now = new Date().getTime();
    const target = new Date(nextVacation.start_date).getTime();
    const diff = target - now;

    if (diff > 0) {
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to VacaAgent</Text>
      </View>

      {nextVacation ? (
        <View style={styles.countdownCard}>
          <Text style={styles.vacationName}>{nextVacation.name}</Text>
          <Text style={styles.vacationLocation}>{nextVacation.location}</Text>
          <View style={styles.countdownContainer}>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownNumber}>{countdown.days}</Text>
              <Text style={styles.countdownLabel}>Days</Text>
            </View>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownNumber}>{countdown.hours}</Text>
              <Text style={styles.countdownLabel}>Hours</Text>
            </View>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownNumber}>{countdown.minutes}</Text>
              <Text style={styles.countdownLabel}>Minutes</Text>
            </View>
            <View style={styles.countdownItem}>
              <Text style={styles.countdownNumber}>{countdown.seconds}</Text>
              <Text style={styles.countdownLabel}>Seconds</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noVacationCard}>
          <Text style={styles.noVacationText}>No upcoming vacations</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('Vacations', { screen: 'CreateVacation' })}
          >
            <Text style={styles.createButtonText}>Plan Your First Vacation</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>View All Vacations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Upcoming Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>Packing Lists</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#007AFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  countdownCard: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  vacationName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  vacationLocation: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  countdownContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  countdownItem: { alignItems: 'center' },
  countdownNumber: { fontSize: 32, fontWeight: 'bold', color: '#007AFF' },
  countdownLabel: { fontSize: 12, color: '#666', marginTop: 5 },
  noVacationCard: { margin: 20, padding: 40, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center' },
  noVacationText: { fontSize: 18, color: '#666', marginBottom: 20 },
  createButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, paddingHorizontal: 30 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  quickActions: { margin: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  actionButton: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10 },
  actionText: { fontSize: 16, color: '#007AFF' },
});
