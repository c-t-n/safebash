import { IsUrl } from 'class-validator';

export class FetchUrlDto {
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url: string;
}

export class FetchUrlResponseDto {
  url: string;
  content: string;
  suggestedName?: string;
}
