'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/toast';

interface ProfileData {
  gender?: string;
  occupation?: string;
  age?: number;
  height?: number;
  weight?: number;
  fitnessLevel?: string;
  goals?: string[];
  trainingFrequency?: number;
  preferredTrainingTime?: string;
  dietaryRestrictions?: string;
  dailyCalories?: number;
  proteinGoal?: number;
  currentHabits?: string[];
  supplements?: string[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData>({});
  const [isLoading, setIsLoading] = useState(false);

  // ユーザーがログインしていない場合の処理
  if (!session?.user || session.user.type === 'guest') {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">プロフィール設定</h1>
        <p className="text-muted-foreground">
          この機能を利用するにはアカウント登録が必要です。
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast({ type: 'success', description: 'プロフィールを保存しました！' });
      } else {
        throw new Error('保存に失敗しました');
      }
    } catch (error) {
      toast({ type: 'error', description: '保存に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">プロフィール設定</h1>

      <div className="space-y-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">基本情報</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">性別</Label>
              <Select
                value={profile.gender}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="occupation">職業</Label>
              <Select
                value={profile.occupation}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, occupation: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">学生</SelectItem>
                  <SelectItem value="office_worker">会社員</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">年齢</Label>
              <Input
                id="age"
                type="number"
                value={profile.age || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    age: parseInt(e.target.value),
                  }))
                }
                placeholder="歳"
              />
            </div>

            <div>
              <Label htmlFor="height">身長</Label>
              <Input
                id="height"
                type="number"
                value={profile.height || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    height: parseInt(e.target.value),
                  }))
                }
                placeholder="cm"
              />
            </div>

            <div>
              <Label htmlFor="weight">体重</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={profile.weight || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    weight: parseFloat(e.target.value),
                  }))
                }
                placeholder="kg"
              />
            </div>
          </div>
        </div>

        {/* トレーニング情報 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">トレーニング情報</h2>

          <div>
            <Label>フィットネスレベル</Label>
            <Select
              value={profile.fitnessLevel}
              onValueChange={(value) =>
                setProfile((prev) => ({ ...prev, fitnessLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">初心者</SelectItem>
                <SelectItem value="intermediate">中級者</SelectItem>
                <SelectItem value="advanced">上級者</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="training-frequency">週のトレーニング頻度</Label>
            <Input
              id="training-frequency"
              type="number"
              value={profile.trainingFrequency || ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  trainingFrequency: parseInt(e.target.value),
                }))
              }
              placeholder="回/週"
            />
          </div>

          <div>
            <Label>好みのトレーニング時間</Label>
            <Select
              value={profile.preferredTrainingTime}
              onValueChange={(value) =>
                setProfile((prev) => ({
                  ...prev,
                  preferredTrainingTime: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">朝（6:00-10:00）</SelectItem>
                <SelectItem value="afternoon">昼（12:00-16:00）</SelectItem>
                <SelectItem value="evening">夜（18:00-22:00）</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 食事情報 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">食事・栄養情報</h2>

          <div>
            <Label htmlFor="dietary-restrictions">食事制限・アレルギー</Label>
            <Textarea
              id="dietary-restrictions"
              value={profile.dietaryRestrictions || ''}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  dietaryRestrictions: e.target.value,
                }))
              }
              placeholder="例：乳製品アレルギー、ベジタリアンなど"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="daily-calories">目標カロリー</Label>
              <Input
                id="daily-calories"
                type="number"
                value={profile.dailyCalories || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    dailyCalories: parseInt(e.target.value),
                  }))
                }
                placeholder="kcal/日"
              />
            </div>

            <div>
              <Label htmlFor="protein-goal">目標プロテイン摂取量</Label>
              <Input
                id="protein-goal"
                type="number"
                step="0.1"
                value={profile.proteinGoal || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    proteinGoal: parseFloat(e.target.value),
                  }))
                }
                placeholder="g/日"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? '保存中...' : 'プロフィールを保存'}
        </Button>
      </div>
    </div>
  );
}
