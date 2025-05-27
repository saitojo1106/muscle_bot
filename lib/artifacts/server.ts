// lib/artifacts/server.ts を完全に無効化
export const artifactRegistry = {};
export const documentHandlersByArtifactKind: any[] = [];
export const artifactKinds = [] as const;

export function createDocumentHandler() {
  return null;
}

export const textDocumentHandler = null;
export const codeDocumentHandler = null;
export const imageDocumentHandler = null;
export const sheetDocumentHandler = null;
