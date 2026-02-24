import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { categories } from '../data/exercises';

export default function HomeScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessions, setSessions] = useState({ morning: [], evening: [] });

  useEffect(() => {
    loadSessions();
  }, [selectedDate]);

  const loadSessions = () => {
    try {
      const key = `athlete-sessions-${selectedDate}`;
      const data = localStorage.getItem(key);
      if (data) {
        setSessions(JSON.parse(data));
      } else {
        setSessions({ morning: [], evening: [] });
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const saveSessions = (updated) => {
    try {
      const key = `athlete-sessions-${selectedDate}`;
      localStorage.setItem(key, JSON.stringify(updated));
      setSessions(updated);
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  };

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

  const getSessionStats = (sessionType) => {
    const session = sessions[sessionType];
    if (!session || session.length === 0) return { total: 0, completed: 0, skipped: 0 };

    let total = 0;
    let completed = 0;
    let skipped = 0;

    session.forEach(category => {
      category.exercises.forEach(exercise => {
        total++;
        if (exercise.completed || exercise.status === 'completed') completed++;
        if (exercise.status === 'skipped') skipped++;
      });
    });

    return { total, completed, skipped };
  };

  const createQuickWorkout = (sessionType) => {
    const warmUp = {
      category: 'Warm Up',
      exercises: categories['Warm Up'].map(ex => ({ ...ex, completed: false, status: null }))
    };
    
    const core = {
      category: 'Core',
      exercises: categories['Core'].map(ex => ({ ...ex, completed: false, status: null }))
    };
    
    const coolDown = {
      category: 'Cool Down',
      exercises: categories['Cool Down'].map(ex => ({ ...ex, completed: false, status: null }))
    };

    const updated = { ...sessions };
    updated[sessionType] = [warmUp, core, coolDown];
    saveSessions(updated);
    
    navigation.navigate('Workout', { sessionType, date: selectedDate });
  };

  const SessionCard = ({ type, icon }) => {
    const stats = getSessionStats(type);
    const hasSession = sessions[type] && sessions[type].length > 0;

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionIcon}>{icon}</Text>
          <Text style={styles.sessionTitle}>{type.charAt(0).toUpperCase() + type.slice(1)} Workout</Text>
        </View>

        {hasSession && (
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>📊 {stats.total} exercises</Text>
            </View>
            <View style={[styles.statBadge, styles.completedBadge]}>
              <Text style={styles.statText}>✓ {stats.completed}</Text>
            </View>
            <View style={[styles.statBadge, styles.skippedBadge]}>
              <Text style={styles.statText}>⏭️ {stats.skipped}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          {!hasSession && (
            <TouchableOpacity
              style={[styles.button, styles.quickButton]}
              onPress={() => createQuickWorkout(type)}
            >
              <Text style={styles.buttonText}>⚡ Quick Start</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.planButton]}
            onPress={() => navigation.navigate('Plan', { sessionType: type, date: selectedDate })}
          >
            <Text style={styles.buttonText}>📅 Plan {type === 'morning' ? 'Today' : 'Session'}</Text>
          </TouchableOpacity>
        </View>

        {hasSession && (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={() => navigation.navigate('Workout', { sessionType: type, date: selectedDate })}
          >
            <Text style={styles.buttonText}>▶️ Start Workout</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
        <TouchableOpacity style={styles.quickButton2} onPress={() => navigation.navigate('CoachPlan')}>
          <Text style={styles.quickButtonText}>💪 Coach's Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickButton2} onPress={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
          <Text style={styles.quickButtonText}>📅 Today</Text>
        </TouchableOpacity>
      </View>

      <SessionCard type="morning" icon="☀️" />
      <SessionCard type="evening" icon="🌙" />

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
  quickButton2: { flex: 1, backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, alignItems: 'center' },
  quickButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sessionCard: { backgroundColor: '#1e293b', margin: 16, marginTop: 0, padding: 16, borderRadius: 12 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sessionIcon: { fontSize: 32, marginRight: 12 },
  sessionTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  statBadge: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  completedBadge: { backgroundColor: '#166534' },
  skippedBadge: { backgroundColor: '#ea580c' },
  statText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', minWidth: 120 },
  quickButton: { backgroundColor: '#10b981' },
  planButton: { backgroundColor: '#8b5cf6' },
  startButton: { backgroundColor: '#10b981', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  footerButtons: { flexDirection: 'row', gap: 12, padding: 16 },
  footerButton: { flex: 1, backgroundColor: '#334155', padding: 16, borderRadius: 8, alignItems: 'center' },
  footerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
