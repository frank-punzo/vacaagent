import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { vacationAPI } from '../../services/api';

export default function VacationListScreen({ navigation }) {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVacations();
  }, []);

  const loadVacations = async () => {
    try {
      const response = await vacationAPI.getAll();
      setVacations(response.data?.data || []);
    } catch (error) {
      console.error('Error loading vacations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVacation = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('VacationDetail', { vacation: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.dates}>
        {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={vacations}
        renderItem={renderVacation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No vacations yet. Create your first one!</Text>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateVacation')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  location: { fontSize: 14, color: '#666', marginBottom: 5 },
  dates: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
  fabText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
});
