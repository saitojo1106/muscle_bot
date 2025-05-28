'use client';

import { Button } from './ui/button';
import type { ArtifactKind } from './artifact';

// 筋トレアプリ用の最小限の型定義
interface UISuggestion {
  id: string;
  description: string;
}

export const Suggestion = ({
  suggestion,
  onApply,
  artifactKind,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
  artifactKind: ArtifactKind;
}) => {
  // 筋トレアプリでは Suggestion 機能を使用しないため、空のコンポーネント
  return null;
};
