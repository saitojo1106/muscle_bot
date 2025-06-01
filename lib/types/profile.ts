// lib/types/profile.ts
export interface ProfileData {
  id?: string;
  userId?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: 'student' | 'office_worker' | 'other';
  age?: number;
  height?: number;
  weight?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string | string[]; // 両方に対応
  trainingFrequency?: number;
  preferredTrainingTime?: 'morning' | 'afternoon' | 'evening';
  dietaryRestrictions?: string;
  dailyCalories?: number;
  proteinGoal?: number;
  currentHabits?: string | string[]; // 両方に対応
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserProfile = ProfileData;
