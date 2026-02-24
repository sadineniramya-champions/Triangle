import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { exerciseEmojis } from '../data/exercises';

export default function WorkoutScreen({ route, navigation }) {
  const { sessionType, date } = route.params;
  const [session, setSession] = useState({ morning: [], evening: [] });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState('');

  const loadSession = () => {
    try {
      const key = `athlete-sessions-${date}`;
      const data = localStorage.getItem(key);
      if (data) {
        setSession(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const saveSession = (updatedSession) => {
    try {
      const key = `athlete-sessions-${date}`;
      localStorage.setItem(key, JSON.stringify(updatedSession));
      setSession(updatedSession);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const getCurrentExercise = () => {
    const exercises = getAllExercises();
    return exercises[currentExerciseIndex];
  };

  const getAllExercises = () => {
    const exercises = [];
    const sessionData = session[sessionType] || [];
    sessionData.forEach(category => {
      category.exercises.forEach(exercise => {
        exercises.push({ ...exercise, category: category.category });
      });
    });
    return exercises;
  };

  const getStats = () => {
    const exercises = getAllExercises();
    const total = exercises.length;
    const completed = exercises.filter(ex => ex.completed || ex.status === 'completed').length;
    const skipped = exercises.filter(ex => ex.status === 'skipped').length;
    return { total, completed, skipped, current: currentExerciseIndex + 1 };
  };

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    const currentExercise = getCurrentExercise();
    if (currentExercise) {
      setSets(parseInt(currentExercise.sets) || 0);
      setReps(parseInt(currentExercise.reps) || 0);
      setWeight(parseInt(currentExercise.weight) || 0);
      setDuration(parseInt(currentExercise.duration) || 0);
      setNotes(currentExercise.notes || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExerciseIndex, session]);

  const completeExercise = () => {
    const exercises = getAllExercises();
    const currentEx = exercises[currentExerciseIndex];
    
    const updated = { ...session };
    const sessionData = updated[sessionType];
    
    sessionData.forEach(category => {
      category.exercises.forEach(exercise => {
        if (exercise.name === currentEx.name) {
          exercise.sets = sets;
          exercise.reps = reps.toString();
          exercise.weight = weight;
          exercise.duration = duration;
          exercise.notes = notes;
          exercise.completed = true;
          exercise.status = 'completed';
        }
      });
    });
    
    saveSession(updated);
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const skipExercise = () => {
    const exercises = getAllExercises();
    const currentEx = exercises[currentExerciseIndex];
    
    const updated = { ...session };
    const sessionData = updated[sessionType];
    
    sessionData.forEach(category => {
      category.exercises.forEach(exercise => {
        if (exercise.name === currentEx.name) {
          exercise.status = 'skipped';
        }
      });
    });
    
    saveSession(updated);
    
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const incrementValue = (setter, current, max, step) => {
    const next = current + step;
    if (next <= max) setter(next);
  };

  const decrementValue = (setter, current, step) => {
    const prev = current - step;
    if (prev >= 0) setter(prev);
  };

  const renderDial = (label, value, onIncrement, onDecrement, suffix = '') => {
    return (
      <View style={styles.dialColumn}>
        <Text style={styles.dialLabel}>{label}</Text>
        <View style={styles.dialWheel}>
          <TouchableOpacity 
            style={styles.dialItem}
            onPress={onIncrement}
          >
            <Text style={styles.dialText}>
              {value + (label === 'Weight' ? 5 : 1)}{suffix}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.dialItemCenter}>
            <Text style={styles.dialTextCenter}>
              {value}{suffix}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.dialItem}
            onPress={onDecrement}
          >
            <Text style={styles.dialText}>
              {Math.max(0, value - (label === 'Weight' ? 5 : 1))}{suffix}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const currentExercise = getCurrentExercise();
  const stats = getStats();
  const exercises = getAllExercises();

  if (!currentExercise) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{sessionType === 'morning' ? '☀️' : '🌙'} {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Workout</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exercises in this session</Text>
        </View>
      </View>
    );
  }

  const progress = stats.total > 0 ? (stats.current / stats.total) * 100 : 0;
  const emoji = exerciseEmojis[currentExercise.name] || '💪';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{sessionType === 'morning' ? '☀️' : '🌙'} {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Workout</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Exercise {stats.current} of {stats.total}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>✓ {stats.completed}</Text>
            </View>
            <View style={[styles.statBadge, styles.skippedBadge]}>
              <Text style={styles.statText}>⏭️ {stats.skipped}</Text>
            </View>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{currentExercise.category}</Text>
        </View>

        {/* Exercise Name */}
        <Text style={styles.exerciseName}>
          {emoji} {currentExercise.name}
        </Text>

        {/* Dial Wheels - Horizontal Scrollable */}
        <View style={styles.dialsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dialsContent}
          >
            {renderDial(
              'Sets',
              sets,
              () => incrementValue(setSets, sets, 50, 1),
              () => decrementValue(setSets, sets, 1)
            )}
            {renderDial(
              'Reps',
              reps,
              () => incrementValue(setReps, reps, 100, 1),
              () => decrementValue(setReps, reps, 1)
            )}
            {renderDial(
              'Weight',
              weight,
              () => incrementValue(setWeight, weight, 200, 5),
              () => decrementValue(setWeight, weight, 5),
              ' kg'
            )}
            {renderDial(
              'Duration',
              duration,
              () => incrementValue(setDuration, duration, 120, 1),
              () => decrementValue(setDuration, duration, 1),
              ' min'
            )}
          </ScrollView>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>NOTES</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes..."
            placeholderTextColor="#64748b"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>🗑️ Delete Exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>✚ Add Exercise</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.navBtn, currentExerciseIndex === 0 && styles.navBtnDisabled]}
          onPress={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
          disabled={currentExerciseIndex === 0}
        >
          <Text style={styles.navBtnText}>← Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={skipExercise}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeBtn} onPress={completeExercise}>
          <Text style={styles.completeBtnText}>✓{'\n'}Completed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, currentExerciseIndex === exercises.length - 1 && styles.navBtnDisabled]}
          onPress={() => setCurrentExerciseIndex(Math.min(exercises.length - 1, currentExerciseIndex + 1))}
          disabled={currentExerciseIndex === exercises.length - 1}
        >
          <Text style={styles.navBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff', flex: 1 },
  closeButton: { fontSize: 28, color: '#fff', padding: 8 },
  progressSection: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#94a3b8' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  skippedBadge: { backgroundColor: '#ea580c' },
  statText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  progressBarContainer: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
  content: { flex: 1 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#1e40af', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, margin: 16, marginBottom: 8 },
  categoryText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  exerciseName: { fontSize: 24, fontWeight: 'bold', color: '#fff', paddingHorizontal: 16, marginBottom: 12 },
  dialsContainer: { marginBottom: 16, height: 200 },
  dialsContent: { paddingHorizontal: 8, gap: 6 },
  dialColumn: { width: 140, minWidth: 140, backgroundColor: '#1e3a5f', borderRadius: 12, padding: 10 },
  dialLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  dialWheel: { alignItems: 'center' },
  dialItem: { paddingVertical: 6, minHeight: 36, justifyContent: 'center', alignItems: 'center', width: '100%' },
  dialItemCenter: { backgroundColor: 'rgba(59, 130, 246, 0.4)', borderRadius: 8, paddingVertical: 10, marginVertical: 3, width: '100%', alignItems: 'center' },
  dialText: { fontSize: 18, color: '#64748b', fontWeight: '500' },
  dialTextCenter: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  notesSection: { paddingHorizontal: 16, marginBottom: 16 },
  notesLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  notesInput: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  actionButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#0f172a' },
  deleteBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#dc2626', borderRadius: 8, alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  addBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  bottomButtons: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: '#1e293b' },
  navBtn: { paddingVertical: 14, paddingHorizontal: 10, backgroundColor: '#334155', borderRadius: 8, minWidth: 65, alignItems: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  skipBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#ea580c', borderRadius: 8, alignItems: 'center' },
  skipBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  completeBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#10b981', borderRadius: 8, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center', lineHeight: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#94a3b8' },
});
