import { AnalysisResult } from '../analysis.service';
import { AnalysisStatus } from '../schemas/script-version.schema';

export class VersionSummaryDto {
  versionNumber: number;
  content: string;
  analysis?: AnalysisResult;
  analysisStatus: AnalysisStatus;
  analysisError?: string;
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
