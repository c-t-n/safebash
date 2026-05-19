import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}
