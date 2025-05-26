'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface DocumentPreviewProps {
  content: string;
  language?: string;
  className?: string;
}

function PureDocumentPreview({
  content,
  language = 'text',
  className,
}: DocumentPreviewProps) {
  // 筋トレアプリでは単純なテキスト表示のみ
  return (
    <div className={cn('p-4 rounded-lg bg-muted', className)}>
      <pre className="whitespace-pre-wrap text-sm">{content}</pre>
    </div>
  );
}

export const DocumentPreview = memo(PureDocumentPreview);
