import { IsString, IsNotEmpty, Matches } from 'class-validator';

const BASH_SHEBANG = /^#!\/(usr\/(local\/)?)?bin\/(env\s+)?(ba)?sh(\s|$)/;

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(BASH_SHEBANG, {
    message: 'content must be a bash script with a valid shebang (e.g. #!/bin/bash)',
  })
  content: string;
}
