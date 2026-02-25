import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { categories, categoryGroups, exerciseEmojis } from '../data/exercises';

export default function PlanScreen({ route, navigation }) {
  const { sessionType, date } = route.params;
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);

  useEffect(() => {
    loadExistingPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadExistingPlan = () => {
    try {
      const key = `athlete-sessions-${date}`;
      const data = localStorage.getItem(key);
      if (data) {
        const sessions = JSON.parse(data);
        const existingPlan = sessions[sessionType] || [];
        if (existingPlan.length > 0) {
          setSelectedCategories(existingPlan.map(c => c.category));
        }
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    }
  };

  const toggleCategory = (categoryName) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const savePlan = () => {
    try {
      const key = `athlete-sessions-${date}`;
      const existingData = localStorage.getItem(key);
      const sessions = existingData ? JSON.parse(existingData) : { morning: [], evening: [] };

      const plan = selectedCategories.map(categoryName => ({
        category: categoryName,
        exercises: categories[categoryName].map(ex => ({
          ...ex,
          completed: false,
          status: null
        }))
      }));

      sessions[sessionType] = plan;
      localStorage.setItem(key, JSON.stringify(sessions));

      navigation.goBack();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const clearPlan = () => {
    setSelectedCategories([]);
  };

  const totalExercises = selectedCategories.reduce((sum, cat) => {
    return sum + (categories[cat]?.length || 0);
  }, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan {sessionType === 'morning' ? 'Morning' : 'Evening'}</Text>
        <TouchableOpacity onPress={clearPlan}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {selectedCategories.length} categories • {totalExercises} exercises
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Category Groups */}
        {Object.keys(categoryGroups).map(groupName => {
          const isExpanded = expandedGroup === groupName;
          return (
            <View key={groupName} style={styles.groupContainer}>
              <TouchableOpacity
                style={styles.groupHeader}
                onPress={() => setExpandedGroup(isExpanded ? null : groupName)}
              >
                <Text style={styles.groupTitle}>{groupName}</Text>
                <Text style={styles.groupIcon}>{isExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.categoriesContainer}>
                  {categoryGroups[groupName].map(categoryName => {
                    const isSelected = selectedCategories.includes(categoryName);
                    const exerciseCount = categories[categoryName]?.length || 0;
                    const firstExercise = categories[categoryName]?.[0];
                    const emoji = firstExercise ? (exerciseEmojis[firstExercise.name] || '💪') : '💪';

                    return (
                      <TouchableOpacity
                        key={categoryName}
                        style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                        onPress={() => toggleCategory(categoryName)}
                      >
                        <View style={styles.categoryHeader}>
                          <Text style={styles.categoryEmoji}>{emoji}</Text>
                          <View style={styles.categoryInfo}>
                            <Text style={styles.categoryName}>{categoryName}</Text>
                            <Text style={styles.categoryCount}>{exerciseCount} exercises</Text>
                          </View>
                          {isSelected && (
                            <View style={styles.checkmark}>
                              <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Selected Categories Preview */}
        {selectedCategories.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Selected Categories</Text>
            {selectedCategories.map(categoryName => (
              <View key={categoryName} style={styles.previewItem}>
                <Text style={styles.previewText}>{categoryName}</Text>
                <TouchableOpacity onPress={() => toggleCategory(categoryName)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, selectedCategories.length === 0 && styles.saveButtonDisabled]}
          onPress={savePlan}
          disabled={selectedCategories.length === 0}
        >
          <Text style={styles.saveButtonText}>
            {selectedCategories.length === 0 ? 'Select Categories' : `Save Plan (${totalExercises} exercises)`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#334155' },
  backButton: { fontSize: 16, color: '#3b82f6', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  clearButton: { fontSize: 16, color: '#ef4444', fontWeight: '600' },
  summary: { backgroundColor: '#1e293b', padding: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  summaryText: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  content: { flex: 1 },
  groupContainer: { marginVertical: 8 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1e293b', marginHorizontal: 16, borderRadius: 8 },
  groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  groupIcon: { fontSize: 14, color: '#94a3b8' },
  categoriesContainer: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  categoryCard: { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  categoryCardSelected: { borderColor: '#10b981', backgroundColor: '#1e4d3f' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center' },
  categoryEmoji: { fontSize: 32, marginRight: 12 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  categoryCount: { fontSize: 13, color: '#94a3b8' },
  checkmark: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  checkmarkText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  previewSection: { padding: 16, marginTop: 16 },
  previewTitle: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', marginBottom: 12, letterSpacing: 1 },
  previewItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 8 },
  previewText: { fontSize: 14, color: '#fff' },
  removeButton: { fontSize: 20, color: '#ef4444', padding: 4 },
  footer: { padding: 16, backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155' },
  saveButton: { backgroundColor: '#10b981', padding: 18, borderRadius: 12, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: '#334155', opacity: 0.5 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
