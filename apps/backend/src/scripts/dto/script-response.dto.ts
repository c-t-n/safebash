import { AnalysisResult } from '../analysis.service';

export class VersionSummaryDto {
  versionNumber: number;
  content: string;
  analysis?: AnalysisResult;
  createdAt: Date;
}

export class ScriptResponseDto {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  url?: string;
  currentVersionNumber: number;
  latestVersion?: VersionSummaryDto;
  createdAt: Date;
  updatedAt: Date;
}
