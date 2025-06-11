import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AppConfigService } from '@shared/config/config.service';
import {
  GoogleSuccessUserAuthResponse,
  GoogleUserInfo,
} from '../types/googleAuthUser.type';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: AppConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refeshToken: string,
    profile: GoogleSuccessUserAuthResponse,
    done: (
      err: Error | null | unknown,
      user: GoogleUserInfo | false,
      info?: object,
    ) => void,
  ) {
    const { name, emails, photos } = profile;

    const user: GoogleUserInfo = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      name: `${name.givenName} ${name.familyName}`,
    };

    done(null, user);
  }
}
