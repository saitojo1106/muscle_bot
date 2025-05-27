'use client';

import React, { memo } from 'react';
import type { Suggestion } from '@/lib/db/schema';

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  suggestions: Array<Suggestion>;
};

function PureEditor({
  content,
  onSaveContent,
  suggestions,
  status,
}: EditorProps) {
  // 筋トレアプリでは複雑なエディター機能は不要
  return (
    <div className="relative prose dark:prose-invert p-4 rounded-lg bg-muted">
      <div className="whitespace-pre-wrap text-sm">
        {content || 'No content to display'}
      </div>
    </div>
  );
}

export const Editor = memo(PureEditor);
