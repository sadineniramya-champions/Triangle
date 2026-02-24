import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

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

  const calculatePBSB = (exerciseName) => {
    try {
      const allSessions = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('athlete-sessions-')) {
          const data = localStorage.getItem(key);
          if (data) {
            allSessions[key] = JSON.parse(data);
          }
        }
      }

      let maxWeight = 0;
      let maxWeightLast3Months = 0;
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      Object.keys(allSessions).forEach(key => {
        const sessionDate = key.replace('athlete-sessions-', '');
        const sessionObj = allSessions[key];
        
        ['morning', 'evening'].forEach(type => {
          const sessionData = sessionObj[type] || [];
          sessionData.forEach(category => {
            category.exercises.forEach(ex => {
              if (ex.name === exerciseName && ex.weight) {
                const w = parseInt(ex.weight) || 0;
                if (w > maxWeight) maxWeight = w;
                
                if (new Date(sessionDate) >= threeMonthsAgo && w > maxWeightLast3Months) {
                  maxWeightLast3Months = w;
                }
              }
            });
          });
        });
      });

      return {
        pb: maxWeight > 0 ? maxWeight : null,
        sb: maxWeightLast3Months > 0 ? maxWeightLast3Months : null
      };
    } catch (error) {
      return { pb: null, sb: null };
    }
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

  const renderDial = (label, value, setValue, max, step = 1, unit = '') => {
    const values = [];
    for (let i = 0; i <= max; i += step) {
      values.push(i);
    }

    return (
      <View style={styles.dialContainer}>
        <Text style={styles.dialLabel}>{label}</Text>
        <View style={styles.dialWheel}>
          {values.slice(Math.max(0, value / step - 2), Math.min(values.length, value / step + 3)).map((val, idx) => {
            const isCenter = val === value;
            return (
              <TouchableOpacity
                key={val}
                onPress={() => setValue(val)}
                style={[styles.dialItem, isCenter && styles.dialItemCenter]}
              >
                <Text style={[styles.dialText, isCenter && styles.dialTextCenter]}>
                  {val}{unit}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{sessionType === 'morning' ? '☀️' : '🌙'} {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Workout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exercises in this session</Text>
        </View>
      </View>
    );
  }

  const progress = stats.total > 0 ? (stats.current / stats.total) * 100 : 0;
  const pbsb = calculatePBSB(currentExercise.name);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sessionType === 'morning' ? '☀️' : '🌙'} {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Exercise {stats.current} of {stats.total}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>✓ {stats.completed}</Text>
          <Text style={styles.statText}>⏭️ {stats.skipped}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{currentExercise.category}</Text>
        </View>

        {/* Exercise Name */}
        <Text style={styles.exerciseName}>
          {currentExercise.name === 'Dynamic Stretching' ? '🧘 Good Morning' : currentExercise.name}
        </Text>

        {/* PB/SB Badges */}
        {(pbsb.pb || pbsb.sb) && (
          <View style={styles.badgesRow}>
            {pbsb.pb && (
              <View style={styles.pbBadge}>
                <Text style={styles.badgeText}>PB: {pbsb.pb}kg</Text>
              </View>
            )}
            {pbsb.sb && (
              <View style={styles.sbBadge}>
                <Text style={styles.badgeText}>SB: {pbsb.sb}kg (3mo)</Text>
              </View>
            )}
          </View>
        )}

        {/* Dial Wheels */}
        <View style={styles.dialsContainer}>
          <View style={styles.dialRow}>
            {renderDial('Sets', sets, setSets, 50)}
            {renderDial('Reps', reps, setReps, 100)}
          </View>
          <View style={styles.dialRow}>
            {renderDial('Weight', weight, setWeight, 200, 5, 'kg')}
            {renderDial('Duration', duration, setDuration, 120, 1, 'min')}
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

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.navBtn, currentExerciseIndex === 0 && styles.navBtnDisabled]}
          onPress={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
          disabled={currentExerciseIndex === 0}
        >
          <Text style={styles.navBtnText}>⟨ Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={skipExercise}>
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeBtn} onPress={completeExercise}>
          <Text style={styles.completeBtnText}>
            {currentExercise.completed ? '✓ Complete' : '✓ Complete'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, currentExerciseIndex === exercises.length - 1 && styles.navBtnDisabled]}
          onPress={() => setCurrentExerciseIndex(Math.min(exercises.length - 1, currentExerciseIndex + 1))}
          disabled={currentExerciseIndex === exercises.length - 1}
        >
          <Text style={styles.navBtnText}>Next ⟩</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b' },
  closeButton: { fontSize: 24, color: '#fff', padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  progressSection: { backgroundColor: '#1e293b', padding: 16, paddingTop: 8 },
  progressLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 8, textAlign: 'center' },
  progressBarContainer: { height: 4, backgroundColor: '#334155', borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10b981' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  statText: { fontSize: 14, color: '#94a3b8' },
  content: { flex: 1 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#1e40af', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, margin: 16, marginBottom: 8 },
  categoryText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  exerciseName: { fontSize: 32, fontWeight: 'bold', color: '#fff', paddingHorizontal: 16, marginBottom: 16 },
  badgesRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
  pbBadge: { backgroundColor: 'rgba(234, 179, 8, 0.2)', borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sbBadge: { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  dialsContainer: { gap: 16, paddingHorizontal: 16, marginBottom: 24 },
  dialRow: { flexDirection: 'row', gap: 16 },
  dialContainer: { flex: 1, backgroundColor: '#1e3a5f', borderRadius: 12, padding: 12 },
  dialLabel: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  dialWheel: { alignItems: 'center' },
  dialItem: { paddingVertical: 8 },
  dialItemCenter: { backgroundColor: 'rgba(59, 130, 246, 0.3)', borderRadius: 8, paddingHorizontal: 24 },
  dialText: { fontSize: 18, color: '#64748b', fontWeight: '500' },
  dialTextCenter: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  notesSection: { paddingHorizontal: 16, marginBottom: 24 },
  notesLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 8 },
  notesInput: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  bottomButtons: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#1e293b' },
  navBtn: { paddingVertical: 16, paddingHorizontal: 20, backgroundColor: '#334155', borderRadius: 8 },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skipBtn: { flex: 1, paddingVertical: 16, backgroundColor: '#ea580c', borderRadius: 8, alignItems: 'center' },
  skipBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  completeBtn: { flex: 2, paddingVertical: 16, backgroundColor: '#10b981', borderRadius: 8, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#94a3b8' },
});
