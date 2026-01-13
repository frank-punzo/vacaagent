import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function VacationDetailScreen({ route }) {
  const { vacation } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{vacation.name}</Text>
        <Text style={styles.location}>{vacation.location}</Text>
        <Text style={styles.dates}>
          {new Date(vacation.start_date).toLocaleDateString()} - {new Date(vacation.end_date).toLocaleDateString()}
        </Text>
        {vacation.description && <Text style={styles.description}>{vacation.description}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Events</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Excursions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Packing List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Recommendations</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 20, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  location: { fontSize: 18, color: '#666', marginBottom: 10 },
  dates: { fontSize: 14, color: '#999', marginBottom: 10 },
  description: { fontSize: 14, color: '#333', marginTop: 10 },
  section: { backgroundColor: '#fff', padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16, textAlign: 'center' },
});
