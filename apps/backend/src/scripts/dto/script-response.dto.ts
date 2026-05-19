export class ScriptResponseDto {
  id: string;
  name: string;
  content: string;
  description?: string;
  url?: string;
  trustScore?: number;
  createdAt: Date;
  updatedAt: Date;
}
