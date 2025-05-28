import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { UIArtifact } from './artifact';
import { memo, useState, type Dispatch, type SetStateAction } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ArtifactAction {
  description: string;
  icon: React.ReactNode;
  label?: string;
  onClick: (context: any) => Promise<void> | void;
  isDisabled?: (context: any) => boolean;
}

interface ArtifactDefinition {
  actions: ArtifactAction[];
}

interface ArtifactActionsProps {
  artifact: UIArtifact;
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  mode: 'edit' | 'diff';
  metadata: any;
  setMetadata: Dispatch<SetStateAction<any>>;
}

function PureArtifactActions({
  artifact,
  handleVersionChange,
  currentVersionIndex,
  isCurrentVersion,
  mode,
  metadata,
  setMetadata,
}: ArtifactActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  // 筋トレアプリでは Artifact 機能を使用しないため、空の配列
  const artifactDefinition: ArtifactDefinition = { actions: [] };

  return (
    <div className="flex flex-row gap-1">
      {artifactDefinition.actions.map((action: ArtifactAction) => (
        <Tooltip key={action.description}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={cn('h-fit dark:hover:bg-zinc-700', {
                'p-2': !action.label,
                'py-1.5 px-2': action.label,
              })}
              onClick={async () => {
                setIsLoading(true);
                try {
                  await Promise.resolve(action.onClick({}));
                } catch (error) {
                  toast.error('Failed to execute action');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || artifact.status === 'streaming'}
            >
              {action.icon}
              {action.label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{action.description}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

export const ArtifactActions = memo(
  PureArtifactActions,
  (prevProps, nextProps) => {
    if (prevProps.artifact.status !== nextProps.artifact.status) return false;
    if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
      return false;
    if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
    if (prevProps.artifact.content !== nextProps.artifact.content) return false;

    return true;
  },
);
