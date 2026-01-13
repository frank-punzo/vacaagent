import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
          <Text style={[styles.buttonText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 30, alignItems: 'center', marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  email: { fontSize: 14, color: '#666' },
  section: { backgroundColor: '#fff', padding: 20 },
  button: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  buttonText: { fontSize: 16, color: '#007AFF' },
  signOutButton: { borderBottomWidth: 0, marginTop: 20 },
  signOutText: { color: '#FF3B30', fontWeight: 'bold' },
});
