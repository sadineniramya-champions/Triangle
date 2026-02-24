import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PlanScreen({ route, navigation }) {
  const { sessionType, date } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.text}>Plan Screen</Text>
      <Text style={styles.subtext}>Session: {sessionType}</Text>
      <Text style={styles.subtext}>Date: {date}</Text>
      <Text style={styles.note}>Phase 2 features coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  backButton: { position: 'absolute', top: 20, left: 20, padding: 10, backgroundColor: '#334155', borderRadius: 8 },
  backButtonText: { color: '#fff', fontSize: 16 },
  text: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  subtext: { fontSize: 16, color: '#94a3b8', marginBottom: 8 },
  note: { fontSize: 14, color: '#3b82f6', marginTop: 20 },
});
