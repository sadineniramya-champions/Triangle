import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function WorkoutScreen({ route, navigation }) {
  const { sessionType, date } = route.params;
  const [session, setSession] = useState({ morning: [], evening: [] });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);

  const setsScrollRef = useRef(null);
  const repsScrollRef = useRef(null);
  const weightScrollRef = useRef(null);
  const durationScrollRef = useRef(null);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    const currentExercise = getCurrentExercise();
    if (currentExercise) {
      setSets(parseInt(currentExercise.sets) || 0);
      setReps(parseInt(currentExercise.reps) || 0);
      setWeight(parseInt(currentExercise.weight) || 0);
      setDuration(parseInt(currentExercise.duration) || 0);
    }
  }, [currentExerciseIndex, session]);

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

  const handleScroll = (type, event) => {
    const scrollTop = event.nativeEvent.contentOffset.y;
    const itemHeight = 48;
    const index = Math.round(scrollTop / itemHeight);
    
    switch(type) {
      case 'sets':
        setSets(index);
        break;
      case 'reps':
        setReps(index);
        break;
      case 'weight':
        setWeight(index * 5);
        break;
      case 'duration':
        setDuration(index);
        break;
    }
  };

  const renderDialWheel = (label, value, max, increment = 1, ref, type) => {
    const items = [];
    for (let i = 0; i <= max; i += increment) {
      items.push(i);
    }

    return (
      <View style={styles.dialContainer}>
        <Text style={styles.dialLabel}>{label}</Text>
        <View style={styles.wheelWrapper}>
          <View style={styles.highlightBar} />
          <ScrollView
            ref={ref}
            style={styles.wheel}
            showsVerticalScrollIndicator={false}
            snapToInterval={48}
            onScroll={(e) => handleScroll(type, e)}
            scrollEventThrottle={16}
          >
            <View style={styles.wheelPadding} />
            {items.map((item, idx) => {
              const distance = Math.abs(idx - (type === 'weight' ? value / 5 : value));
              const opacity = distance === 0 ? 1 : distance === 1 ? 0.5 : 0.2;
              const fontSize = distance === 0 ? 36 : distance === 1 ? 24 : 18;
              
              return (
                <View key={idx} style={styles.wheelItem}>
                  <Text style={[styles.wheelText, { opacity, fontSize }]}>
                    {item}
                  </Text>
                </View>
              );
            })}
            <View style={styles.wheelPadding} />
          </ScrollView>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.noDataText}>No exercises in this session</Text>
      </View>
    );
  }

  const progress = (stats.current / stats.total) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Mode</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {stats.current} / {stats.total} • ✓ {stats.completed} • ⏭️ {stats.skipped}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Exercise Info */}
        <View style={styles.exerciseInfo}>
          <Text style={styles.categoryText}>{currentExercise.category}</Text>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          {currentExercise.notes && (
            <Text style={styles.notesText}>📝 {currentExercise.notes}</Text>
          )}
        </View>

        {/* Dial Wheels */}
        <View style={styles.dialsRow}>
          {renderDialWheel('Sets', sets, 50, 1, setsScrollRef, 'sets')}
          {renderDialWheel('Reps', reps, 100, 1, repsScrollRef, 'reps')}
        </View>
        <View style={styles.dialsRow}>
          {renderDialWheel('Weight (kg)', weight, 200, 5, weightScrollRef, 'weight')}
          {renderDialWheel('Duration (min)', duration, 120, 1, durationScrollRef, 'duration')}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
            onPress={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
            disabled={currentExerciseIndex === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, currentExerciseIndex === exercises.length - 1 && styles.navButtonDisabled]}
            onPress={() => setCurrentExerciseIndex(Math.min(exercises.length - 1, currentExerciseIndex + 1))}
            disabled={currentExerciseIndex === exercises.length - 1}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.skipButton} onPress={skipExercise}>
          <Text style={styles.skipButtonText}>⏭️ Skip Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeButton} onPress={completeExercise}>
          <Text style={styles.completeButtonText}>
            {currentExercise.completed ? '✓ Completed' : 'Complete Exercise'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  backText: { fontSize: 16, color: '#3b82f6' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  progressContainer: { padding: 16, backgroundColor: '#1e293b' },
  progressBar: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#10b981' },
  progressText: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  content: { flex: 1 },
  exerciseInfo: { padding: 20, alignItems: 'center', backgroundColor: '#1e293b', margin: 16, borderRadius: 12 },
  categoryText: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  exerciseName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  notesText: { fontSize: 14, color: '#fbbf24', marginTop: 8 },
  dialsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  dialContainer: { flex: 1 },
  dialLabel: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8, textAlign: 'center' },
  wheelWrapper: { position: 'relative', height: 160, backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' },
  highlightBar: { position: 'absolute', top: '50%', left: 0, right: 0, height: 48, marginTop: -24, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', zIndex: 10, pointerEvents: 'none' },
  wheel: { flex: 1 },
  wheelPadding: { height: 56 },
  wheelItem: { height: 48, justifyContent: 'center', alignItems: 'center' },
  wheelText: { color: '#fff', fontWeight: 'bold' },
  navButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 16 },
  navButton: { flex: 1, padding: 16, backgroundColor: '#3b82f6', borderRadius: 8, alignItems: 'center' },
  navButtonDisabled: { backgroundColor: '#334155', opacity: 0.5 },
  navButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipButton: { margin: 16, marginTop: 24, padding: 16, backgroundColor: '#ea580c', borderRadius: 8, alignItems: 'center' },
  skipButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  completeButton: { margin: 16, marginTop: 8, padding: 16, backgroundColor: '#10b981', borderRadius: 8, alignItems: 'center' },
  completeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 20, left: 20, padding: 10, backgroundColor: '#334155', borderRadius: 8, zIndex: 100 },
  backButtonText: { color: '#fff', fontSize: 16 },
  noDataText: { fontSize: 18, color: '#94a3b8', textAlign: 'center' },
});
