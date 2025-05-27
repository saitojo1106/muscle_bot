'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface DocumentPreviewProps {
  content?: string;
  language?: string;
  className?: string;
  isReadonly?: boolean;
  args?: any;
  result?: any;
}

function PureDocumentPreview({
  content = '',
  language = 'text',
  className,
  isReadonly = false,
  args,
  result,
}: DocumentPreviewProps) {
  // args または result からコンテンツを取得
  const displayContent =
    content || args?.content || result?.content || 'No content to display';

  return (
    <div className={cn('p-4 rounded-lg bg-muted', className)}>
      <pre className="whitespace-pre-wrap text-sm">{displayContent}</pre>
    </div>
  );
}

export const DocumentPreview = memo(PureDocumentPreview);
