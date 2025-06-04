// lib/ai/prompts/fitness.ts
import type { UserProfile } from '@/lib/db/schema';

export const fitnessSystemPrompt = `
あなたは経験豊富なパーソナルトレーナーです。
**必ず日本語で回答してください。**

ユーザーの質問に対して、以下の観点から回答してください：

1. 安全性を最優先に考慮
2. ユーザーのレベルに応じた適切なアドバイス
3. 具体的で実践しやすい内容
4. 科学的根拠に基づいた情報

常に怪我防止を意識し、正しいフォームの重要性を強調してください。
初心者には基礎から、上級者には専門的なアドバイスを提供してください。

**重要: すべての回答は日本語で行い、専門用語も可能な限り日本語で説明してください。**
`;

// 言語検出関数
const detectLanguage = (userMessage: string): 'ja' | 'en' => {
  // 日本語文字（ひらがな、カタカナ、漢字）が含まれているかチェック
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japaneseRegex.test(userMessage) ? 'ja' : 'en';
};

export const generatePersonalizedPrompt = (
  userProfile?: UserProfile | null,
  userMessage?: string,
  trainingMenu?: any[], // トレーニングメニューを追加
) => {
  const language = userMessage ? detectLanguage(userMessage) : 'ja';

  const languageInstruction =
    language === 'ja'
      ? '**必ず日本語で回答してください。**'
      : '**Please respond in English.**';

  if (!userProfile) {
    return `${fitnessSystemPrompt}
${languageInstruction}

※ ユーザープロフィールが設定されていません。より具体的なアドバイスを受けるために、プロフィール設定をお勧めします。`;
  }

  // より堅牢なparseJsonField関数
  const parseJsonField = (field: unknown): string => {
    if (!field) return '設定なし';

    try {
      let cleanField = String(field);

      // 複数層のエスケープを段階的に解除
      let prevField = '';
      while (
        cleanField !== prevField &&
        (cleanField.includes('\\"') || cleanField.includes('\\\\'))
      ) {
        prevField = cleanField;
        cleanField = cleanField.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }

      // 外側の引用符を除去
      cleanField = cleanField.replace(/^"+(.*?)"+$/, '$1');

      // 配列らしき文字列の処理
      if (cleanField.includes('[') && cleanField.includes(']')) {
        cleanField = cleanField
          .replace(/^\[/, '')
          .replace(/\]$/, '')
          .replace(/"+/g, '')
          .trim();
      }

      return cleanField || '設定なし';
    } catch (error) {
      // フォールバック処理
      let cleanString = String(field);

      // 基本的なクリーンアップ
      cleanString = cleanString
        .replace(/["'\\]/g, '') // 引用符とバックスラッシュを除去
        .replace(/\[|\]/g, '') // 角括弧を除去
        .replace(/\s+/g, ' ') // 連続する空白を1つに
        .trim();

      return cleanString || '設定なし';
    }
  };

  const goalsText = parseJsonField(userProfile.goals);
  const habitsText = parseJsonField(userProfile.currentHabits);

  // トレーニングメニュー情報を整理
  let trainingMenuText = '設定なし';
  if (trainingMenu && trainingMenu.length > 0) {
    trainingMenuText = trainingMenu
      .map((day, index) => {
        const dayInfo = `${index + 1}日目: ${day.name}${day.isRestDay ? '(オフ)' : ''}`;
        if (day.isRestDay || !day.exercises || day.exercises.length === 0) {
          return dayInfo;
        }

        const exercises = day.exercises
          .map(
            (ex: any) =>
              `${ex.exerciseName}(${ex.targetMuscle}) ${ex.weight ? ex.weight + 'kg' : ''} ${ex.sets ? ex.sets + 'set' : ''} ${ex.reps ? ex.reps + 'rep' : ''}`,
          )
          .join(', ');

        return `${dayInfo}: ${exercises}`;
      })
      .join('\n');
  }

  return `${fitnessSystemPrompt}
${languageInstruction}

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

現在のトレーニングメニュー:
${trainingMenuText}

この詳細な情報を考慮して、より具体的で個人に適したアドバイスを提供してください。`;
};
