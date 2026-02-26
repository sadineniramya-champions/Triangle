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

      <ScrollView style={styles.content}>
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

        {/* Exercise Input - Conditional based on exercise name */}
        {currentEx.name === 'Half Squads' ? (
          // SET-BY-SET ENTRY FOR HALF SQUADS
          <View style={styles.detailsCard}>
            {/* Notes with auto-parse button */}
            {currentEx.notes && (
              <View style={styles.notesParseSection}>
                <Text style={styles.notesParseLabel}>Notes: {currentEx.notes}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const notes = currentEx.notes || '';
                    const updated = { ...session };
                    const exercise = updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex];
                    
                    const repsMatch = notes.match(/(\d+(?:\+\d+)+)/);
                    const reps = repsMatch ? repsMatch[1].split('+').map(r => r.trim()) : [];
                    
                    const weightMatch = notes.match(/(?:weight[s]?:\s*)?(\d+(?:\+\d+)+)\s*(?:kg)?/i);
                    const weights = weightMatch ? weightMatch[1].split('+').map(w => w.trim()) : [];
                    
                    const numSets = Math.max(reps.length, weights.length);
                    
                    if (numSets > 0) {
                      exercise.numSets = numSets;
                      exercise.setData = [];
                      
                      for (let i = 0; i < numSets; i++) {
                        exercise.setData.push({
                          reps: reps[i] || '',
                          weight: weights[i] || ''
                        });
                      }
                      
                      saveSession(updated);
                      alert(`Loaded ${numSets} sets from notes!`);
                    } else {
                      alert('Could not parse notes. Use format: "10+8+6, weight: 50+60+70kg"');
                    }
                  }}
                  style={styles.parseButton}
                >
                  <Text style={styles.parseButtonText}>📋 Load from Notes</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Number of Sets Selector */}
            <View style={styles.setsSelector}>
              <Text style={styles.setsSelectorLabel}>Number of Sets</Text>
              <View style={styles.setsButtons}>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => {
                      const updated = { ...session };
                      const exercise = updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex];
                      
                      if (!exercise.setData) exercise.setData = [];
                      
                      if (num > exercise.setData.length) {
                        for (let i = exercise.setData.length; i < num; i++) {
                          exercise.setData.push({ reps: '', weight: '' });
                        }
                      } else {
                        exercise.setData = exercise.setData.slice(0, num);
                      }
                      
                      exercise.numSets = num;
                      saveSession(updated);
                    }}
                    style={[
                      styles.setButton,
                      (currentEx.numSets || 0) === num && styles.setButtonSelected
                    ]}
                  >
                    <Text style={[
                      styles.setButtonText,
                      (currentEx.numSets || 0) === num && styles.setButtonTextSelected
                    ]}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Set-by-Set Inputs */}
            {currentEx.numSets > 0 && (
              <View style={styles.setsList}>
                {Array.from({ length: currentEx.numSets || 0 }, (_, setIndex) => {
                  const setData = (currentEx.setData || [])[setIndex] || { reps: '', weight: '' };
                  
                  return (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
                      <View style={styles.setInputs}>
                        <View style={styles.setInputGroup}>
                          <Text style={styles.setInputLabel}>Reps</Text>
                          <TextInput
                            value={setData.reps}
                            onChangeText={(text) => {
                              const updated = { ...session };
                              const exercise = updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex];
                              if (!exercise.setData) exercise.setData = [];
                              if (!exercise.setData[setIndex]) exercise.setData[setIndex] = {};
                              exercise.setData[setIndex].reps = text;
                              saveSession(updated);
                            }}
                            keyboardType="numeric"
                            style={styles.setInput}
                            placeholder="0"
                            placeholderTextColor="#64748b"
                          />
                        </View>
                        <View style={styles.setInputGroup}>
                          <Text style={styles.setInputLabel}>Weight (kg)</Text>
                          <TextInput
                            value={setData.weight}
                            onChangeText={(text) => {
                              const updated = { ...session };
                              const exercise = updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex];
                              if (!exercise.setData) exercise.setData = [];
                              if (!exercise.setData[setIndex]) exercise.setData[setIndex] = {};
                              exercise.setData[setIndex].weight = text;
                              saveSession(updated);
                            }}
                            keyboardType="numeric"
                            style={styles.setInput}
                            placeholder="0"
                            placeholderTextColor="#64748b"
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          // SCROLLABLE DIAL WHEELS FOR ALL OTHER EXERCISES
          <View style={styles.dialsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dialsContent}
            >
              {/* Sets Dial */}
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

              {/* Reps Dial */}
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

              {/* Weight Dial */}
              <DialWheel
                label="Weight"
                value={parseInt(currentEx.weight) || 0}
                max={300}
                step={5}
                suffix=" kg"
                onChange={(val) => {
                  const updated = { ...session };
                  updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].weight = val.toString();
                  saveSession(updated);
                }}
              />

              {/* Duration Dial */}
              <DialWheel
                label="Duration"
                value={parseInt(currentEx.duration) || 0}
                max={120}
                step={1}
                suffix=" min"
                onChange={(val) => {
                  const updated = { ...session };
                  updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].duration = val.toString();
                  saveSession(updated);
                }}
              />
            </ScrollView>
          </View>
        )}

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
          style={[
            styles.skipBtn,
            currentEx.status === 'skipped' && styles.skipBtnActive
          ]}
        >
          <Text style={styles.skipBtnText}>
            {currentEx.status === 'skipped' ? '⏭️ Skipped' : 'Skip'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            const updated = { ...session };
            updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].completed = true;
            updated[sessionType][currentEx.categoryIndex].exercises[currentEx.exerciseIndex].status = 'completed';
            saveSession(updated);
            setCurrentExerciseIndex(currentExerciseIndex + 1);
          }}
          style={[
            styles.completeBtn,
            (currentEx.completed || currentEx.status === 'completed') && styles.completeBtnActive
          ]}
        >
          <Text style={styles.completeBtnText}>
            {currentEx.completed || currentEx.status === 'completed' ? '✓ Completed' : '✓ Complete'}
          </Text>
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
function DialWheel({ label, value, max, step, suffix = '', onChange }) {
  const scrollViewRef = useRef(null);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    if (scrollViewRef.current && !scrolling) {
      scrollViewRef.current.scrollTo({ y: value * 48, animated: false });
    }
  }, [value, scrolling]);

  return (
    <View style={styles.dialColumn}>
      <Text style={styles.dialLabel}>{label}</Text>
      <View style={styles.dialWrapper}>
        <View style={styles.dialHighlight} />
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={48}
          decelerationRate="fast"
          onScrollBeginDrag={() => setScrolling(true)}
          onMomentumScrollEnd={(e) => {
            const scrollY = e.nativeEvent.contentOffset.y;
            const index = Math.round(scrollY / 48);
            const newValue = Math.min(max, index * step);
            onChange(newValue);
            setScrolling(false);
          }}
          style={styles.dialScroll}
        >
          <View style={styles.dialSpacer} />
          {Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => {
            const val = i * step;
            const distance = Math.abs(val - value);
            const opacity = distance === 0 ? 1 : distance <= step ? 0.5 : 0.2;
            const fontSize = distance === 0 ? 36 : distance <= step ? 24 : 18;
            
            return (
              <View key={i} style={styles.dialItem}>
                <Text style={[styles.dialText, { opacity, fontSize }]}>
                  {val}{suffix}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', flex: 1 },
  closeButton: { fontSize: 24, color: '#fff', padding: 8 },
  progressSection: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#94a3b8' },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 },
  skippedBadge: { backgroundColor: '#f97316' },
  statText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  progressBarContainer: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#10b981', borderRadius: 3 },
  content: { flex: 1 },
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
  detailsCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 16 },
  notesParseSection: { backgroundColor: '#334155', borderRadius: 8, padding: 8, marginBottom: 12 },
  notesParseLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  parseButton: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  parseButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  setsSelector: { marginBottom: 16 },
  setsSelectorLabel: { fontSize: 14, color: '#94a3b8', fontWeight: 'bold', marginBottom: 8 },
  setsButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  setButton: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#334155', borderRadius: 8 },
  setButtonSelected: { backgroundColor: '#3b82f6' },
  setButtonText: { fontSize: 16, color: '#94a3b8', fontWeight: 'bold' },
  setButtonTextSelected: { color: '#fff' },
  setsList: { gap: 8 },
  setRow: { backgroundColor: '#334155', borderRadius: 8, padding: 12 },
  setLabel: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  setInputs: { flexDirection: 'row', gap: 12 },
  setInputGroup: { flex: 1 },
  setInputLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  setInput: { backgroundColor: '#1e293b', color: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, fontSize: 16, fontWeight: 'bold', textAlign: 'center', borderWidth: 1, borderColor: '#475569' },
  dialsContainer: { marginBottom: 16 },
  dialsContent: { paddingHorizontal: 16, gap: 8 },
  dialColumn: { width: 160, minWidth: 160 },
  dialLabel: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  dialWrapper: { position: 'relative', height: 160, backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' },
  dialHighlight: { position: 'absolute', top: '50%', marginTop: -24, left: 0, right: 0, height: 48, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', zIndex: 10, pointerEvents: 'none' },
  dialScroll: { flex: 1 },
  dialSpacer: { height: 56 },
  dialItem: { height: 48, justifyContent: 'center', alignItems: 'center' },
  dialText: { color: '#fff', fontWeight: 'bold' },
  notesSection: { paddingHorizontal: 16, marginBottom: 20 },
  notesLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  notesInput: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155' },
  footer: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155' },
  navBtn: { paddingVertical: 12, paddingHorizontal: 12, backgroundColor: '#334155', borderRadius: 8, minWidth: 70, alignItems: 'center' },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  skipBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#d97706', borderRadius: 8, alignItems: 'center' },
  skipBtnActive: { backgroundColor: '#f97316' },
  skipBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  completeBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#10b981', borderRadius: 8, alignItems: 'center' },
  completeBtnActive: { backgroundColor: '#059669' },
  completeBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  completeEmoji: { fontSize: 96 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 16, marginBottom: 16 },
  completeText: { fontSize: 18, color: '#94a3b8', marginBottom: 24, textAlign: 'center' },
  completeButton: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, width: '100%', maxWidth: 400 },
  completeButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
