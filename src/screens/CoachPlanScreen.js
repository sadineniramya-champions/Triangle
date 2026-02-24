import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CoachPlanScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Coach's Plan Screen</Text>
      <Text style={styles.note}>Phase 2 features coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 20, left: 20, padding: 10, backgroundColor: '#334155', borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 16 },
  text: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  note: { fontSize: 14, color: '#3b82f6', marginTop: 20 },
});
