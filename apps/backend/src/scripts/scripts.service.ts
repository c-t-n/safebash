import { Injectable } from '@nestjs/common';

export interface Script {
  id: string;
  url: string;
  name: string;
  description?: string;
  trustScore?: number;
  analyzedAt?: Date;
}

@Injectable()
export class ScriptsService {
  private scripts: Script[] = [];

  findAll(): Script[] {
    return this.scripts;
  }

  findOne(id: string): Script | undefined {
    return this.scripts.find((script) => script.id === id);
  }

  create(script: Script): Script {
    this.scripts.push(script);
    return script;
  }
}
