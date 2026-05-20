import { IsString, IsNotEmpty, IsOptional, IsUrl, Matches } from 'class-validator';

const BASH_SHEBANG = /^#!\/(usr\/(local\/)?)?bin\/(env\s+)?(ba)?sh(\s|$)/;

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(BASH_SHEBANG, {
    message: 'content must be a bash script with a valid shebang (e.g. #!/bin/bash)',
  })
  content: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}
