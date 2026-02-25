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
    const step = label === 'Weight' ? 5 : 1;
    const topValue = value + step;
    const bottomValue = Math.max(0, value - step);

    return (
      <View style={styles.dialColumn}>
        <Text style={styles.dialLabel}>{label}</Text>
        <View style={styles.dialWheel}>
          <TouchableOpacity 
            style={styles.dialItem}
            onPress={onIncrement}
          >
            <Text style={styles.dialText}>
              {topValue}{suffix}
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
              {bottomValue}{suffix}
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

        {/* Dial Wheels - All 4 in One Row */}
        <View style={styles.dialsWrapper}>
          <View style={styles.dialsContent}>
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
          </View>
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
          <Text style={styles.completeBtnText}>✓ Complete</Text>
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
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1c2e4a' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff', flex: 1 },
  closeButton: { fontSize: 28, color: '#fff', padding: 8 },
  progressSection: { backgroundColor: '#1c2e4a', paddingHorizontal: 16, paddingBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#94a3b8' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  skippedBadge: { backgroundColor: '#f97316' },
  statText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  progressBarContainer: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
  content: { flex: 1 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#2563eb', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, margin: 16, marginBottom: 12 },
  categoryText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  exerciseName: { fontSize: 32, fontWeight: 'bold', color: '#fff', paddingHorizontal: 16, marginBottom: 20 },
  dialsWrapper: { backgroundColor: '#1e3a5f', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 20 },
  dialsContent: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  dialColumn: { flex: 1 },
  dialLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  dialWheel: { alignItems: 'center' },
  dialItem: { paddingVertical: 8, minHeight: 44, justifyContent: 'center', alignItems: 'center', width: '100%' },
  dialItemCenter: { backgroundColor: '#3b72d4', borderRadius: 10, paddingVertical: 16, marginVertical: 4, width: '100%', alignItems: 'center' },
  dialText: { fontSize: 18, color: '#64748b', fontWeight: '500' },
  dialTextCenter: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  notesSection: { paddingHorizontal: 16, marginBottom: 20 },
  notesLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  notesInput: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  bottomButtons: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#1c2e4a' },
  navBtn: { paddingVertical: 16, paddingHorizontal: 12, backgroundColor: '#334155', borderRadius: 10, minWidth: 70, alignItems: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  skipBtn: { flex: 1, paddingVertical: 16, backgroundColor: '#f97316', borderRadius: 10, alignItems: 'center' },
  skipBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  completeBtn: { flex: 1, paddingVertical: 16, backgroundColor: '#10b981', borderRadius: 10, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#94a3b8' },
});
