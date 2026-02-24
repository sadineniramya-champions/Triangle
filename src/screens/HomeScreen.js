import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Athlete Training</Text>
      </View>

      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          <Text style={styles.dateSubtext}>{selectedDate}</Text>
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('CoachPlan')}>
          <Text style={styles.quickButtonText}>💪 Coach's Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton} onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
          <Text style={styles.quickButtonText}>📅 Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionIcon}>☀️</Text>
          <Text style={styles.sessionTitle}>Morning Workout</Text>
        </View>
        <TouchableOpacity style={[styles.button, styles.planButton]} onPress={() => navigation.navigate('Plan', { sessionType: 'morning', date: selectedDate })}>
          <Text style={styles.buttonText}>📅 Plan Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={() => navigation.navigate('Workout', { sessionType: 'morning', date: selectedDate })}>
          <Text style={styles.buttonText}>▶️ Start Workout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionIcon}>🌙</Text>
          <Text style={styles.sessionTitle}>Evening Workout</Text>
        </View>
        <TouchableOpacity style={[styles.button, styles.planButton]} onPress={() => navigation.navigate('Plan', { sessionType: 'evening', date: selectedDate })}>
          <Text style={styles.buttonText}>📅 Plan Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={() => navigation.navigate('Workout', { sessionType: 'evening', date: selectedDate })}>
          <Text style={styles.buttonText}>▶️ Start Workout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>📊 Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>💾 Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerButtonText}>📥 Import</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b', margin: 16, borderRadius: 12 },
  dateButton: { padding: 12 },
  dateButtonText: { fontSize: 24, color: '#fff' },
  dateInfo: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  dateSubtext: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  quickActions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  quickButton: { flex: 1, backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center' },
  quickButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sessionCard: { backgroundColor: '#1e293b', margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sessionIcon: { fontSize: 32, marginRight: 12 },
  sessionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  button: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  planButton: { backgroundColor: '#8b5cf6' },
  startButton: { backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  footerButtons: { flexDirection: 'row', gap: 12, padding: 16 },
  footerButton: { flex: 1, backgroundColor: '#334155', padding: 16, borderRadius: 8, alignItems: 'center' },
  footerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
