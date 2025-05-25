'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo, useState, useEffect } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
}

type UserLevel = 'beginner' | 'intermediate' | 'advanced' | 'unknown';

const getSuggestedActions = (userLevel: UserLevel) => {
  const actionsByLevel = {
    beginner: [
      {
        title: '筋トレ入門ガイド',
        label: '初心者向けの基本知識と始め方をサポート',
        action:
          '筋トレを始めたいのですが、何から始めればいいか教えてください。器具は何も持っていません。',
      },
      {
        title: '自宅トレーニング',
        label: '家でできる基本的なエクササイズメニュー',
        action:
          '自宅でできる筋トレメニューを教えてください。腕立て伏せやスクワットから始めたいです。',
      },
      {
        title: '基本的な食事指導',
        label: '筋肉をつけるための基本的な栄養知識',
        action: '筋肉をつけるためにはどんな食事を心がければよいでしょうか？',
      },
      {
        title: '怪我の予防',
        label: '初心者が注意すべきポイントと安全対策',
        action:
          '筋トレ初心者が怪我をしないために注意すべきことを教えてください。',
      },
    ],
    intermediate: [
      {
        title: 'レベルアップメニュー',
        label: '中級者向けのトレーニング強化プラン',
        action:
          '筋トレを半年続けています。次のステップとして、どんなメニューに挑戦すればよいでしょうか？',
      },
      {
        title: 'プロテイン活用法',
        label: 'サプリメントの効果的な摂取方法',
        action:
          'プロテインの種類と効果的な飲み方、タイミングを詳しく教えてください。',
      },
      {
        title: '部位別強化',
        label: '特定の筋肉群を重点的に鍛える方法',
        action:
          '胸筋と背筋をもっと発達させたいです。効果的なトレーニング方法を教えてください。',
      },
      {
        title: 'プラトー打破',
        label: '成長停滞期を乗り越えるテクニック',
        action:
          '最近筋肉の成長が停滞しています。どうすれば再び成長できるでしょうか？',
      },
    ],
    advanced: [
      {
        title: '高強度トレーニング',
        label: '上級者向けの専門的なトレーニング法',
        action:
          'ピリオダイゼーションを取り入れた高強度トレーニングプログラムを組んでください。',
      },
      {
        title: 'コンテスト準備',
        label: 'ボディビル大会に向けた専門指導',
        action:
          'フィジーク大会に出場予定です。カッティング期の食事とトレーニングを教えてください。',
      },
      {
        title: '栄養計算',
        label: '詳細なマクロ栄養素の管理方法',
        action:
          '体重70kg、体脂肪率10%の場合のバルクアップ期のマクロ栄養素を計算してください。',
      },
      {
        title: 'フォーム最適化',
        label: '高重量での正確なフォーム技術',
        action:
          'デッドリフト200kg達成のための細かいフォーム調整とプログラムを教えてください。',
      },
    ],
    unknown: [
      {
        title: 'レベル診断',
        label: 'あなたに最適なトレーニングレベルを診断',
        action:
          '私の筋トレレベルを診断してください。現在の運動習慣や経験について質問してください。',
      },
      {
        title: '目標設定',
        label: '筋トレの目的と目標を明確にする',
        action:
          '筋トレの目標を設定したいです。体型改善、筋力向上、健康維持など、どこから始めればよいでしょうか？',
      },
      {
        title: '基本情報',
        label: '筋トレの基礎知識と全体像を学ぶ',
        action:
          '筋トレについて教えてください。種類や効果、必要な時間など基本的なことから知りたいです。',
      },
      {
        title: '環境チェック',
        label: 'トレーニング環境に応じたアドバイス',
        action:
          'ジム通いか自宅トレーニングか迷っています。それぞれのメリット・デメリットを教えてください。',
      },
    ],
  };

  return actionsByLevel[userLevel];
};

// ユーザーレベルを判定する関数
const getUserLevel = (): UserLevel => {
  // LocalStorageからユーザーレベルを取得
  if (typeof window !== 'undefined') {
    const storedLevel = localStorage.getItem('user-fitness-level') as UserLevel;
    if (
      storedLevel &&
      ['beginner', 'intermediate', 'advanced'].includes(storedLevel)
    ) {
      return storedLevel;
    }
  }
  return 'unknown';
};

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const [userLevel, setUserLevel] = useState<UserLevel>('unknown');

  useEffect(() => {
    setUserLevel(getUserLevel());
  }, []);

  const suggestedActions = getSuggestedActions(userLevel);

  return (
    <div className="space-y-4">
      {/* レベル選択UI */}
      <div className="flex gap-2 justify-center flex-wrap">
        <span className="text-sm text-muted-foreground mr-2">
          あなたのレベル:
        </span>
        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
          <Button
            key={level}
            variant={userLevel === level ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setUserLevel(level);
              localStorage.setItem('user-fitness-level', level);
            }}
            className="text-xs"
          >
            {level === 'beginner' && '初心者'}
            {level === 'intermediate' && '中級者'}
            {level === 'advanced' && '上級者'}
          </Button>
        ))}
      </div>

      {/* 提案アクション */}
      <div
        data-testid="suggested-actions"
        className="grid sm:grid-cols-2 gap-2 w-full"
      >
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className={index > 1 ? 'hidden sm:block' : 'block'}
          >
            <Button
              variant="ghost"
              onClick={async () => {
                window.history.replaceState({}, '', `/chat/${chatId}`);

                append({
                  role: 'user',
                  content: suggestedAction.action,
                });
              }}
              className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
            >
              <span className="font-medium">{suggestedAction.title}</span>
              <span className="text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>

      {userLevel === 'unknown' && (
        <div className="text-center text-sm text-muted-foreground">
          💡 上のボタンでレベルを選択すると、あなたに最適な質問が表示されます
        </div>
      )}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
