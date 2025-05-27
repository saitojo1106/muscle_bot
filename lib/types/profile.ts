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
  goals?: string[];
  trainingFrequency?: number;
  preferredTrainingTime?: 'morning' | 'afternoon' | 'evening';
  dietaryRestrictions?: string;
  dailyCalories?: number;
  proteinGoal?: number;
  currentHabits?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// UserProfile型をProfileDataのエイリアスとして定義
export type UserProfile = ProfileData;
