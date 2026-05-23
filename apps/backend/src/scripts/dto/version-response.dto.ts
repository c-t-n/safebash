import { AnalysisResult } from '../analysis.service';
import { AnalysisStatus } from '../schemas/script-version.schema';

export class VersionResponseDto {
  id: string;
  scriptId: string;
  versionNumber: number;
  content: string;
  analysis?: AnalysisResult;
  analysisStatus: AnalysisStatus;
  analysisError?: string;
  createdAt: Date;
}
