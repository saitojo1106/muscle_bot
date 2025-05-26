// lib/types/profile.ts として新規作成
export interface UserProfile {
  id: string;
  userId: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: 'student' | 'office_worker' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  trainingFrequency?: number;
  preferredTrainingTime?: 'morning' | 'afternoon' | 'evening';
  dietaryRestrictions?: string;
  dailyCalories?: number;
  proteinGoal?: number;
  currentHabits?: string[];
  createdAt: Date;
  updatedAt: Date;
}
