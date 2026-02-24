import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import PlanScreen from './screens/PlanScreen';
import CoachPlanScreen from './screens/CoachPlanScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});

  const navigation = {
    navigate: (screen, params = {}) => {
      setCurrentScreen(screen);
      setScreenParams(params);
    },
    goBack: () => {
      setCurrentScreen('Home');
      setScreenParams({});
    },
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Workout':
        return <WorkoutScreen route={{ params: screenParams }} navigation={navigation} />;
      case 'Plan':
        return <PlanScreen route={{ params: screenParams }} navigation={navigation} />;
      case 'CoachPlan':
        return <CoachPlanScreen navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
