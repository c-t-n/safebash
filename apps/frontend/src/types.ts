export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AnalysisResult {
  trustScore: number;
  risks: string[];
  warnings: string[];
  safePatterns: string[];
  analyzedAt: string;
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
