import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { exerciseEmojis } from '../data/exercises';

export default function WorkoutScreen({ route, navigation }) {
  const { sessionType, date } = route.params;
  const [session, setSession] = useState({ morning: [], evening: [] });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [seasonMonths] = useState(3);

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

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const getAllExercisesInSession = (sessionType) => {
    const allExercises = [];
    session[sessionType]?.forEach((category, catIdx) => {
      category.exercises?.forEach((exercise, exIdx) => {
        allExercises.push({
          ...exercise,
          categoryName: category.category,
          categoryId: category.id,
          categoryIndex: catIdx,
          exerciseIndex: exIdx
        });
      });
    });
    return allExercises;
  };

  const calculateBests = (exerciseName) => {
    let personalBest = 0;
    let seasonBest = 0;

    const allDates = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('athlete-sessions-')) {
        const date = key.replace('athlete-sessions-', '');
        allDates.push(date);
      }
    }

    const today = new Date();
    const seasonCutoff = new Date(today);
    seasonCutoff.setMonth(today.getMonth() - seasonMonths);
    const seasonCutoffStr = seasonCutoff.toISOString().split('T')[0];

    allDates.forEach(date => {
      try {
        const sessionData = localStorage.getItem(`athlete-sessions-${date}`);
        if (sessionData) {
          const sessionsData = JSON.parse(sessionData);
          
          ['morning', 'evening'].forEach(sessionType => {
            sessionsData[sessionType]?.forEach(category => {
              category.exercises?.forEach(exercise => {
                if (exercise.name === exerciseName) {
                  let maxWeight = 0;
                  
                  if (exercise.setData && Array.isArray(exercise.setData)) {
                    exercise.setData.forEach(set => {
                      const weight = parseInt(set.weight) || 0;
                      if (weight > maxWeight) maxWeight = weight;
                    });
                  } else {
                    maxWeight = parseInt(exercise.weight) || 0;
                  }
                  
                  if (maxWeight > personalBest) {
                    personalBest = maxWeight;
                  }
                  
                  if (date >= seasonCutoffStr && maxWeight > seasonBest) {
                    seasonBest = maxWeight;
                  }
                }
              });
            });
          });
        }
      } catch (error) {
        console.error('Error parsing session:', error);
      }
    });

    return { personalBest, seasonBest };
  };

  const allExercises = getAllExercisesInSession(sessionType);
  const currentEx = allExercises[currentExerciseIndex];
  const progress = allExercises.length > 0 ? ((currentExerciseIndex + 1) / allExercises.length) * 100 : 0;

  const completedCount = allExercises.filter(ex => ex.completed || ex.status === 'completed').length;
  const skippedCount = allExercises.filter(ex => ex.status === 'skipped').length;

  if (!currentEx) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {sessionType === 'morning' ? '☀️' : '🌙'} {sessionType === 'morning' ? 'Morning' : 'Evening'} Workout
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Workout Complete!</Text>
          <Text style={styles.completeText}>Great job! You completed {allExercises.length} exercises.</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.completeButton}
          >
            <Text style={styles.completeButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const emoji = exerciseEmojis[currentEx.name] || '💪';
  const { personalBest, seasonBest } = calculateBests(currentEx.name);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {sessionType === 'morning' ? '☀️' : '🌙'} {sessionType === 'morning' ? 'Morning' : 'Evening'} Workout
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Exercise {currentExerciseIndex + 1} of {allExercises.length}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Text style={styles.statText}>✓ {completedCount}</Text>
            </View>
            <View style={[styles.statBadge, styles.skippedBadge]}>
              <Text style={styles.statText}>⏭️ {skippedCount}</Text>
            </View>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Scrollable Content */}
      <View style={styles.scrollWrapper}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{currentEx.categoryName}</Text>
          </View>

          {/* Exercise Name */}
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseEmoji}>{emoji}</Text>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{currentEx.name}</Text>
              
              {/* PB/SB Badges */}
              {(personalBest > 0 || seasonBest > 0) && (
                <View style={styles.badgesRow}>
                  {personalBest > 0 && (
                    <View style={styles.pbBadge}>
                      <Text style={styles.badgeText}>
                        <Text style={styles.badgeLabel}>PB:</Text>
                        <Text style={styles.badgeValue}> {personalBest}kg</Text>
                      </Text>
                    </View>
                  )}
                  {seasonBest > 0 && (
                    <View style={styles.sbBadge}>
                      <Text style={styles.badgeText}>
                        <Text style={styles.badgeLabel}>SB:</Text>
                        <Text style={styles.badgeValue}> {seasonBest}kg </Text>
                        <Text style={styles.badgeSubtext}>({seasonMonths}mo)</Text>
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Dial Wheels - 4 in a row */}
          <View style={styles.dialsGrid}>
            <DialWheel
              label="Sets"
              value={parseInt(currentEx.sets) || 0}
              max={50}
              step={1}
              onChange={(val) => {
                const updated = { ...session };
                updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].sets = val.toString();
                saveSession(updated);
              }}
            />
            <DialWheel
              label="Reps"
              value={parseInt(currentEx.reps) || 0}
              max={100}
              step={1}
              onChange={(val) => {
                const updated = { ...session };
                updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].reps = val.toString();
                saveSession(updated);
              }}
            />
            <DialWheel
              label="Weight (kg)"
              value={parseInt(currentEx.weight) || 0}
              max={300}
              step={5}
              onChange={(val) => {
                const updated = { ...session };
                updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].weight = val.toString();
                saveSession(updated);
              }}
            />
            <DialWheel
              label="Duration (min)"
              value={parseInt(currentEx.duration) || 0}
              max={120}
              step={1}
              onChange={(val) => {
                const updated = { ...session };
                updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].duration = val.toString();
                saveSession(updated);
              }}
            />
          </View>

          {/* Notes Input */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <TextInput
              value={currentEx.notes || ''}
              onChangeText={(text) => {
                const updated = { ...session };
                updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].notes = text;
                saveSession(updated);
              }}
              multiline
              style={styles.notesInput}
              placeholder="Add notes..."
              placeholderTextColor="#64748b"
            />
          </View>
        </ScrollView>
      </View>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
          disabled={currentExerciseIndex === 0}
          style={[styles.navBtn, currentExerciseIndex === 0 && styles.navBtnDisabled]}
        >
          <Text style={styles.navBtnText}>← Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const updated = { ...session };
            updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].status = 'skipped';
            saveSession(updated);
            setCurrentExerciseIndex(currentExerciseIndex + 1);
          }}
          style={styles.skipBtn}
        >
          <Text style={styles.skipBtnText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const updated = { ...session };
            updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].completed = true;
            updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].status = 'completed';
            saveSession(updated);
            setCurrentExerciseIndex(currentExerciseIndex + 1);
          }}
          style={styles.completeBtn}
        >
          <Text style={styles.completeBtnText}>✓ Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
          disabled={currentExerciseIndex >= allExercises.length - 1}
          style={[styles.navBtn, currentExerciseIndex >= allExercises.length - 1 && styles.navBtnDisabled]}
        >
          <Text style={styles.navBtnText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Dial Wheel Component
function DialWheel({ label, value, max, step, onChange }) {
  const [localValue, setLocalValue] = useState(value);
  const scrollViewRef = useRef(null);
  const itemHeight = 48;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (scrollViewRef.current) {
      const scrollPosition = (localValue / step) * itemHeight;
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: false });
    }
  }, [localValue, step]);

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const index = Math.round(scrollY / itemHeight);
    const newValue = Math.min(max, Math.max(0, index * step));
    setLocalValue(newValue);
  };

  const handleScrollEnd = () => {
    onChange(localValue);
  };

  return (
    <View style={styles.dialColumn}>
      <Text style={styles.dialLabel}>{label}</Text>
      <View style={styles.dialWrapper}>
        <View style={styles.dialHighlight} />
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={styles.dialScroll}
        >
          <View style={styles.dialSpacer} />
          {Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => {
            const val = i * step;
            const distance = Math.abs(val - localValue);
            const opacity = distance === 0 ? 1 : distance <= step ? 0.5 : 0.2;
            const fontSize = distance === 0 ? 36 : distance <= step ? 24 : 18;
            
            return (
              <View key={i} style={styles.dialItem}>
                <Text style={[styles.dialText, { opacity, fontSize }]}>
                  {val}
                </Text>
              </View>
            );
          })}
          <View style={styles.dialSpacer} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', flex: 1 },
  closeButton: { fontSize: 24, color: '#fff', padding: 8 },
  progressSection: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#94a3b8' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  skippedBadge: { backgroundColor: '#f97316' },
  statText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  progressBarContainer: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
  scrollWrapper: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#2563eb', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, margin: 16, marginBottom: 16 },
  categoryText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, marginBottom: 16 },
  exerciseEmoji: { fontSize: 48 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  badgesRow: { flexDirection: 'row', gap: 12 },
  pbBadge: { backgroundColor: 'rgba(77, 56, 0, 0.3)', borderWidth: 1.5, borderColor: '#a68232', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  sbBadge: { backgroundColor: 'rgba(30, 58, 90, 0.3)', borderWidth: 1.5, borderColor: '#3b6fb8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 14, color: '#fff' },
  badgeLabel: { fontWeight: 'bold' },
  badgeValue: { fontWeight: 'bold' },
  badgeSubtext: { fontSize: 12, color: '#94a3b8' },
  dialsGrid: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20, gap: 8 },
  dialColumn: { flex: 1, minWidth: 75 },
  dialLabel: { fontSize: 11, color: '#fff', fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  dialWrapper: { position: 'relative', height: 220, backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' },
  dialHighlight: { position: 'absolute', top: '50%', marginTop: -24, left: 0, right: 0, height: 48, backgroundColor: 'rgba(59, 130, 246, 0.3)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(59, 130, 246, 0.5)', zIndex: 10, pointerEvents: 'none' },
  dialScroll: { flex: 1 },
  dialSpacer: { height: 86 },
  dialItem: { height: 48, justifyContent: 'center', alignItems: 'center' },
  dialText: { color: '#fff', fontWeight: 'bold' },
  notesSection: { paddingHorizontal: 16, marginBottom: 20 },
  notesLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  notesInput: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155' },
  footer: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155' },
  navBtn: { paddingVertical: 14, paddingHorizontal: 10, backgroundColor: '#334155', borderRadius: 8, minWidth: 65, alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  skipBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#ea7317', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  skipBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  completeBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#10b981', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  completeEmoji: { fontSize: 96 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 16, marginBottom: 16 },
  completeText: { fontSize: 18, color: '#94a3b8', marginBottom: 24, textAlign: 'center' },
  completeButton: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, width: '100%', maxWidth: 400 },
  completeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
