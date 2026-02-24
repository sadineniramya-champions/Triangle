export const exerciseEmojis = {
  'Dynamic Stretching': '🤸', 'Light Jog': '🏃', 'Leg Swings': '🦵',
  'A Skip': '🏃', 'B Skip': '🏃', 'C Skip': '🏃', 'Straight Leg Bounds': '🦘', 'Butt Kicks': '🦵',
  'Bench Press': '🏋️', 'Squats': '🏋️', 'Deadlifts': '🏋️', 'Overhead Press': '🏋️', 'Barbell Rows': '🏋️',
  'Dumbbell Curls': '💪', 'Lateral Raises': '💪', 'Tricep Extensions': '💪', 'Hammer Curls': '💪',
  'Box Jumps': '📦', 'Broad Jumps': '🦘', 'Depth Jumps': '📦', 'Single Leg Hops': '🦘',
  'Step Ups': '🪜', 'Single Leg Step Ups': '🪜', 'Weighted Step Ups': '🪜',
  'Wall Drives': '🧱', 'Wall Sit': '🧱',
  'Planks': '🧘', 'Russian Twists': '🔄', 'Bicycle Crunches': '🚴', 'Leg Raises': '🦵', 'Dead Bugs': '🪲',
  'Static Stretching': '🧘', 'Foam Rolling': '🎢', 'Walking': '🚶',
  'Half Squats': '🏋️', 'Power Snatch': '🏋️', 'Hang Snatch': '🏋️',
  'Power Clean': '🏋️', 'Hang Clean': '🏋️',
  'Block Starts': '🏁', 'Block Accelerations': '⚡',
  'Sprint Intervals': '⚡', 'Flying Sprints': '💨', 'Tempo Runs': '🏃',
  'Med Ball Throws': '⚽', 'Med Ball Slams': '⚽', 'Med Ball Rotations': '⚽',
  'Hurdle Hops': '🚧', 'Hurdle Mobility': '🚧', 'Hurdle Walkovers': '🚧',
  'Track Sprints': '🏃', 'Hill Sprints': '⛰️',
};

export const categories = {
  'Warm Up': [
    { name: 'Dynamic Stretching', sets: 1, reps: '-', weight: 0, duration: 5, notes: '' },
    { name: 'Light Jog', sets: 1, reps: '-', weight: 0, duration: 10, notes: '' },
    { name: 'Leg Swings', sets: 2, reps: '10', weight: 0, duration: 0, notes: 'Each leg' },
  ],
  'ABC Drills': [
    { name: 'A Skip', sets: 3, reps: '20', weight: 0, duration: 0, notes: '' },
    { name: 'B Skip', sets: 3, reps: '20', weight: 0, duration: 0, notes: '' },
    { name: 'C Skip', sets: 3, reps: '20', weight: 0, duration: 0, notes: '' },
    { name: 'Straight Leg Bounds', sets: 3, reps: '15', weight: 0, duration: 0, notes: '' },
    { name: 'Butt Kicks', sets: 3, reps: '20', weight: 0, duration: 0, notes: '' },
  ],
  'Heavy Weights': [
    { name: 'Bench Press', sets: 4, reps: '8', weight: 80, duration: 0, notes: '' },
    { name: 'Squats', sets: 5, reps: '5', weight: 100, duration: 0, notes: '' },
    { name: 'Deadlifts', sets: 3, reps: '6', weight: 120, duration: 0, notes: '' },
    { name: 'Overhead Press', sets: 4, reps: '8', weight: 50, duration: 0, notes: '' },
    { name: 'Barbell Rows', sets: 4, reps: '10', weight: 60, duration: 0, notes: '' },
  ],
  'Light Weights': [
    { name: 'Dumbbell Curls', sets: 3, reps: '12', weight: 15, duration: 0, notes: '' },
    { name: 'Lateral Raises', sets: 3, reps: '15', weight: 10, duration: 0, notes: '' },
    { name: 'Tricep Extensions', sets: 3, reps: '12', weight: 12, duration: 0, notes: '' },
    { name: 'Hammer Curls', sets: 3, reps: '12', weight: 15, duration: 0, notes: '' },
  ],
  'Plyometrics': [
    { name: 'Box Jumps', sets: 4, reps: '8', weight: 0, duration: 0, notes: '24 inch box' },
    { name: 'Broad Jumps', sets: 4, reps: '6', weight: 0, duration: 0, notes: '' },
    { name: 'Depth Jumps', sets: 3, reps: '5', weight: 0, duration: 0, notes: '' },
    { name: 'Single Leg Hops', sets: 3, reps: '10', weight: 0, duration: 0, notes: 'Each leg' },
  ],
  'Step Ups': [
    { name: 'Step Ups', sets: 3, reps: '12', weight: 0, duration: 0, notes: 'Each leg' },
    { name: 'Single Leg Step Ups', sets: 3, reps: '8', weight: 0, duration: 0, notes: 'Each leg' },
    { name: 'Weighted Step Ups', sets: 3, reps: '10', weight: 20, duration: 0, notes: 'Each leg' },
  ],
  'Wall': [
    { name: 'Wall Drives', sets: 3, reps: '20', weight: 0, duration: 0, notes: 'Each leg' },
    { name: 'Wall Sit', sets: 3, reps: '-', weight: 0, duration: 1, notes: '' },
  ],
  'Core': [
    { name: 'Planks', sets: 3, reps: '-', weight: 0, duration: 1, notes: '' },
    { name: 'Russian Twists', sets: 3, reps: '30', weight: 10, duration: 0, notes: '' },
    { name: 'Bicycle Crunches', sets: 3, reps: '20', weight: 0, duration: 0, notes: '' },
    { name: 'Leg Raises', sets: 3, reps: '15', weight: 0, duration: 0, notes: '' },
    { name: 'Dead Bugs', sets: 3, reps: '12', weight: 0, duration: 0, notes: '' },
  ],
  'Cool Down': [
    { name: 'Static Stretching', sets: 1, reps: '-', weight: 0, duration: 10, notes: '' },
    { name: 'Foam Rolling', sets: 1, reps: '-', weight: 0, duration: 5, notes: '' },
    { name: 'Walking', sets: 1, reps: '-', weight: 0, duration: 5, notes: '' },
  ],
  'Half Squads': [
    { name: 'Half Squats', sets: 4, reps: '6', weight: 60, duration: 0, notes: '' },
  ],
  'Snatches': [
    { name: 'Power Snatch', sets: 4, reps: '3', weight: 40, duration: 0, notes: '' },
    { name: 'Hang Snatch', sets: 4, reps: '4', weight: 35, duration: 0, notes: '' },
  ],
  'Cleans': [
    { name: 'Power Clean', sets: 5, reps: '3', weight: 60, duration: 0, notes: '' },
    { name: 'Hang Clean', sets: 4, reps: '4', weight: 55, duration: 0, notes: '' },
  ],
  'Block Work': [
    { name: 'Block Starts', sets: 6, reps: '1', weight: 0, duration: 0, notes: '30m' },
    { name: 'Block Accelerations', sets: 5, reps: '1', weight: 0, duration: 0, notes: '40m' },
  ],
  'Speed Work': [
    { name: 'Sprint Intervals', sets: 6, reps: '1', weight: 0, duration: 0, notes: '100m' },
    { name: 'Flying Sprints', sets: 4, reps: '1', weight: 0, duration: 0, notes: '60m' },
    { name: 'Tempo Runs', sets: 8, reps: '1', weight: 0, duration: 0, notes: '200m @ 75%' },
  ],
  'Med Ball': [
    { name: 'Med Ball Throws', sets: 4, reps: '10', weight: 5, duration: 0, notes: '' },
    { name: 'Med Ball Slams', sets: 4, reps: '12', weight: 8, duration: 0, notes: '' },
    { name: 'Med Ball Rotations', sets: 3, reps: '15', weight: 5, duration: 0, notes: '' },
  ],
  'Hurdle Drills': [
    { name: 'Hurdle Hops', sets: 4, reps: '10', weight: 0, duration: 0, notes: '' },
    { name: 'Hurdle Mobility', sets: 3, reps: '8', weight: 0, duration: 0, notes: 'Each leg' },
    { name: 'Hurdle Walkovers', sets: 3, reps: '10', weight: 0, duration: 0, notes: '' },
  ],
  'Sprints': [
    { name: 'Track Sprints', sets: 5, reps: '1', weight: 0, duration: 0, notes: '100m' },
    { name: 'Hill Sprints', sets: 6, reps: '1', weight: 0, duration: 0, notes: '50m uphill' },
  ],
};

export const categoryGroups = {
  'Essential': ['Warm Up', 'Cool Down', 'Core'],
  'Strength': ['Heavy Weights', 'Light Weights', 'Half Squads'],
  'Power': ['Plyometrics', 'Med Ball', 'Snatches', 'Cleans'],
  'Speed': ['ABC Drills', 'Speed Work', 'Sprints', 'Block Work'],
  'Mobility': ['Step Ups', 'Wall', 'Hurdle Drills'],
};
