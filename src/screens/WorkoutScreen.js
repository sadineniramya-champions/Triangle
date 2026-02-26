import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, SafeAreaView } from 'react-native';
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
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  const emoji = exerciseEmojis[currentEx.name] || '💪';
  const { personalBest, seasonBest } = calculateBests(currentEx.name);

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Navigation Footer - ALWAYS VISIBLE */}
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
            set​​​​​​​​​​​​​​​​
