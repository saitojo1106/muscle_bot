// lib/ai/prompts/fitness.ts
import type { UserProfile } from '@/lib/db/schema';

export const fitnessSystemPrompt = `
あなたは経験豊富なパーソナルトレーナーです。
ユーザーの質問に対して、以下の観点から回答してください：

1. 安全性を最優先に考慮
2. ユーザーのレベルに応じた適切なアドバイス
3. 具体的で実践しやすい内容
4. 科学的根拠に基づいた情報

常に怪我防止を意識し、正しいフォームの重要性を強調してください。
初心者には基礎から、上級者には専門的なアドバイスを提供してください。
`;

export const generatePersonalizedPrompt = (
  userProfile?: UserProfile | null,
) => {
  if (!userProfile) {
    return `${fitnessSystemPrompt}

※ ユーザープロフィールが設定されていません。より具体的なアドバイスを受けるために、プロフィール設定をお勧めします。`;
  }

  // ヘルパー関数で型エラーを回避
  const parseJsonField = (field: unknown): string => {
    if (!field) return '設定なし';

    try {
      if (typeof field === 'string') {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
      }

      if (Array.isArray(field)) {
        return field.join(', ');
      }

      return String(field);
    } catch (error) {
      return String(field);
    }
  };

  const goalsText = parseJsonField(userProfile.goals);
  const habitsText = parseJsonField(userProfile.currentHabits);

  return `${fitnessSystemPrompt}

ユーザー情報:
- レベル: ${userProfile.fitnessLevel || '設定なし'}
- 年齢: ${userProfile.age ? `${userProfile.age}歳` : '設定なし'}
- 性別: ${userProfile.gender || '設定なし'}
- 身長: ${userProfile.height ? `${userProfile.height}cm` : '設定なし'}
- 体重: ${userProfile.weight ? `${userProfile.weight}kg` : '設定なし'}
- トレーニング頻度: ${userProfile.trainingFrequency ? `${userProfile.trainingFrequency}回/週` : '設定なし'}
- 好みの時間帯: ${userProfile.preferredTrainingTime || '設定なし'}
- 目標: ${goalsText}
- 現在の習慣: ${habitsText}
- 食事制限: ${userProfile.dietaryRestrictions || 'なし'}

この詳細な情報を考慮して、より具体的で個人に適したアドバイスを提供してください。`;
};
