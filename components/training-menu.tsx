'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { TrainingDay, TrainingMenuProps } from '@/lib/types/training';
import type { TrainingExercise } from '@/lib/db/schema';

export function TrainingMenu({ trainingDays, onUpdate }: TrainingMenuProps) {
  const [days, setDays] = useState<TrainingDay[]>(trainingDays);

  // 新しい日を追加
  const addNewDay = () => {
    const newDay: TrainingDay = {
      id: crypto.randomUUID(),
      dayNumber: days.length + 1,
      name: '',
      isRestDay: false,
      exercises: [],
      // createdAtは省略（UIでは不要）
    };
    const updatedDays = [...days, newDay];
    setDays(updatedDays);
    onUpdate(updatedDays);
  };

  // 日を削除
  const removeDay = (dayId: string) => {
    const updatedDays = days.filter((day) => day.id !== dayId);
    // 日番号を再設定
    const reorderedDays = updatedDays.map((day, index) => ({
      ...day,
      dayNumber: index + 1,
    }));
    setDays(reorderedDays);
    onUpdate(reorderedDays);
  };

  // 日の情報を更新
  const updateDay = (dayId: string, updates: Partial<TrainingDay>) => {
    const updatedDays = days.map((day) =>
      day.id === dayId ? { ...day, ...updates } : day,
    );
    setDays(updatedDays);
    onUpdate(updatedDays);
  };

  // エクササイズを追加
  const addExercise = (dayId: string) => {
    const newExercise: Omit<TrainingExercise, 'dayId' | 'createdAt'> = {
      id: crypto.randomUUID(),
      exerciseName: '',
      targetMuscle: '',
      weight: null,
      sets: null,
      reps: null,
      purpose: '',
      order: 0,
    };

    const updatedDays = days.map((day) => {
      if (day.id === dayId) {
        const newOrder = day.exercises.length;
        return {
          ...day,
          exercises: [
            ...day.exercises,
            { ...newExercise, order: newOrder } as TrainingExercise,
          ],
        };
      }
      return day;
    });
    setDays(updatedDays);
    onUpdate(updatedDays);
  };

  // エクササイズを削除
  const removeExercise = (dayId: string, exerciseId: string) => {
    const updatedDays = days.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
        };
      }
      return day;
    });
    setDays(updatedDays);
    onUpdate(updatedDays);
  };

  // エクササイズを更新
  const updateExercise = (
    dayId: string,
    exerciseId: string,
    updates: Partial<TrainingExercise>,
  ) => {
    const updatedDays = days.map((day) => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, ...updates } : ex,
          ),
        };
      }
      return day;
    });
    setDays(updatedDays);
    onUpdate(updatedDays);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">トレーニングメニュー</h3>
        <Button onClick={addNewDay} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          日を追加
        </Button>
      </div>

      {days.map((day) => (
        <Card key={day.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{day.dayNumber}日目</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDay(day.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`day-name-${day.id}`}>
                  部位・トレーニング名
                </Label>
                <Input
                  id={`day-name-${day.id}`}
                  value={day.name}
                  onChange={(e) => updateDay(day.id, { name: e.target.value })}
                  placeholder="例: 胸の日、背中の日"
                />
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id={`rest-day-${day.id}`}
                  checked={day.isRestDay}
                  onCheckedChange={(checked) =>
                    updateDay(day.id, { isRestDay: checked as boolean })
                  }
                />
                <Label htmlFor={`rest-day-${day.id}`}>オフの日</Label>
              </div>
            </div>
          </CardHeader>

          {!day.isRestDay && (
            <CardContent className="space-y-4">
              {day.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        種目 {exercise.order + 1}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExercise(day.id, exercise.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>種目名</Label>
                      <Input
                        value={exercise.exerciseName}
                        onChange={(e) =>
                          updateExercise(day.id, exercise.id, {
                            exerciseName: e.target.value,
                          })
                        }
                        placeholder="例: ベンチプレス"
                      />
                    </div>

                    <div>
                      <Label>対象部位</Label>
                      <Select
                        value={exercise.targetMuscle}
                        onValueChange={(value) =>
                          updateExercise(day.id, exercise.id, {
                            targetMuscle: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="部位を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="胸筋">胸筋</SelectItem>
                          <SelectItem value="背筋">背筋</SelectItem>
                          <SelectItem value="肩">肩</SelectItem>
                          <SelectItem value="腕">腕</SelectItem>
                          <SelectItem value="脚">脚</SelectItem>
                          <SelectItem value="腹筋">腹筋</SelectItem>
                          <SelectItem value="全身">全身</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>重量 (kg)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={exercise.weight || ''}
                        onChange={(e) =>
                          updateExercise(day.id, exercise.id, {
                            weight: e.target.value
                              ? Number.parseFloat(e.target.value)
                              : null,
                          })
                        }
                        placeholder="130"
                      />
                    </div>

                    <div>
                      <Label>セット数</Label>
                      <Input
                        type="number"
                        value={exercise.sets || ''}
                        onChange={(e) =>
                          updateExercise(day.id, exercise.id, {
                            sets: e.target.value
                              ? Number.parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="3"
                      />
                    </div>

                    <div>
                      <Label>レップ数</Label>
                      <Input
                        type="number"
                        value={exercise.reps || ''}
                        onChange={(e) =>
                          updateExercise(day.id, exercise.id, {
                            reps: e.target.value
                              ? Number.parseInt(e.target.value)
                              : null,
                          })
                        }
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <Label>目的</Label>
                      <Select
                        value={exercise.purpose || ''}
                        onValueChange={(value) =>
                          updateExercise(day.id, exercise.id, {
                            purpose: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="目的を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="パワー">パワー</SelectItem>
                          <SelectItem value="筋肥大">筋肥大</SelectItem>
                          <SelectItem value="筋持久力">筋持久力</SelectItem>
                          <SelectItem value="ウォームアップ">
                            ウォームアップ
                          </SelectItem>
                          <SelectItem value="フィニッシュ">
                            フィニッシュ
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => addExercise(day.id)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                種目を追加
              </Button>
            </CardContent>
          )}
        </Card>
      ))}

      {days.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">
              トレーニングメニューがまだありません
            </p>
            <Button onClick={addNewDay}>
              <Plus className="w-4 h-4 mr-2" />
              最初の日を追加
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
