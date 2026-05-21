import { IsOptional, IsString, IsUrl, IsNotEmpty } from 'class-validator';

/** Metadata-only patch. The script's content/versions are managed separately
 *  through the /versions endpoints. */
export class UpdateScriptDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  url?: string;
}
