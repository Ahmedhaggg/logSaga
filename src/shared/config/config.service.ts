import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ProcessEnvVars } from './env';

@Injectable()
export class AppConfigService {
  constructor(protected nestConfigService: NestConfigService) {}

  get<T extends keyof ProcessEnvVars>(key: T): string {
    return this.nestConfigService.get<string>(key) as string;
  }
}
