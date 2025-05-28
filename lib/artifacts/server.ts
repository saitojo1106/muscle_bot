// lib/artifacts/server.ts を新規作成または修正
export const artifactKinds = ['text'] as const;
export type ArtifactKind = (typeof artifactKinds)[number];

// 必要な型定義
interface Document {
  id: string;
  title: string;
  kind: string;
  content: string;
  userId: string;
  createdAt: Date;
}

interface UpdateDocumentParams {
  document: Document;
  description: string;
  dataStream: any;
  session: any;
}

interface CreateDocumentParams {
  title: string;
  kind: ArtifactKind;
  content: string;
  dataStream: any;
  session: any;
}

export const documentHandlersByArtifactKind = [
  {
    kind: 'text' as const,
    onCreateDocument: async (params: CreateDocumentParams) => {
      throw new Error('Document creation is disabled for fitness app');
    },
    onUpdateDocument: async (params: UpdateDocumentParams) => {
      throw new Error('Document update is disabled for fitness app');
    },
  },
];
