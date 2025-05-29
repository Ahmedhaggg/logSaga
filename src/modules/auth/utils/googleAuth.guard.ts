import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppConfigService } from '@shared/config/config.service';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private configService: AppConfigService) {
    super({
      accessType: 'offline',
    });
  }
}
