export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ScriptSummary {
  tech: string;
  plain: string;
}

export type BlockKind = 'if' | 'case' | 'for' | 'while' | 'until' | 'function';

export interface LineExplanation {
  lineNumber: number;
  endLineNumber?: number;
  content: string;
  tech: string;
  plain: string;
  source: 'dict' | 'llm' | 'comment' | 'empty' | 'unknown' | 'block';
  blockKind?: BlockKind;
  symbolName?: string;
  severity?: 'risk' | 'warning';
  severityReason?: string;
}

export interface AnalysisResult {
  trustScore: number;
  risks: string[];
  warnings: string[];
  safePatterns: string[];
  analyzedAt: string;
  summary?: ScriptSummary;
  lines?: LineExplanation[];
}

export interface VersionSummary {
  versionNumber: number;
  content: string;
  analysis?: AnalysisResult;
  createdAt: string;
}

export interface Script {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  url?: string;
  currentVersionNumber: number;
  latestVersion?: VersionSummary;
  createdAt: string;
  updatedAt: string;
}
