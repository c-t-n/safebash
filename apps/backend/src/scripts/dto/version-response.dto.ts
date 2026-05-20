import { AnalysisResult } from '../analysis.service';

export class VersionResponseDto {
  id: string;
  scriptId: string;
  versionNumber: number;
  content: string;
  analysis?: AnalysisResult;
  createdAt: Date;
}
