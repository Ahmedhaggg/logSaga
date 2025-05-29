import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@shared/config/config.module';
import { AppConfigService } from '@shared/config/config.service';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshToken } from './entities/refreshToken.entity';
import { RefreshTokenRepository } from './repositories/refreshToken.repository';
import { GoogleStrategy } from './stratgies/google.startgy';
import { JwtStrategy } from './stratgies/jwt.stratgy';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy, RefreshTokenRepository],
  controllers: [AuthController],
})
export class AuthModule {}
