import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { vacationAPI } from '../../services/api';

export default function CreateVacationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vibe, setVibe] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !location || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await vacationAPI.create({
        name,
        location,
        description,
        start_date: startDate,
        end_date: endDate,
        vibe,
      });
      Alert.alert('Success', 'Vacation created!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create vacation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Beach Vacation 2024" />

      <Text style={styles.label}>Location *</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Hawaii" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Relaxing beach getaway" multiline numberOfLines={4} />

      <Text style={styles.label}>Start Date * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="2024-06-15" />

      <Text style={styles.label}>End Date * (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="2024-06-22" />

      <Text style={styles.label}>Vibe</Text>
      <TextInput style={styles.input} value={vibe} onChangeText={setVibe} placeholder="Relaxing, adventurous" />

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Vacation</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 30 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
