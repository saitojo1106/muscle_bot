import type {
  TrainingDay as DBTrainingDay,
  TrainingExercise,
} from '@/lib/db/schema';

// UIで使用するTrainingDay型（exercisesを含む、createdAtは省略可能）
export interface TrainingDay {
  id: string;
  dayNumber: number;
  name: string;
  isRestDay: boolean;
  exercises: TrainingExercise[];
  // データベース関連のフィールドは省略可能
  planId?: string | null;
  createdAt?: Date;
}

export interface TrainingMenuProps {
  trainingDays: TrainingDay[];
  onUpdate: (days: TrainingDay[]) => void;
}
