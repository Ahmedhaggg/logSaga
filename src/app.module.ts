import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { LogsModule } from './modules/logs/logs.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppConfigModule } from '@shared/config/config.module';
import { AppConfigService } from '@shared/config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        console.log(config.get('DB_URL'));
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: parseInt(config.get('DB_PORT'), 10),
          username: config.get('DB_USER'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME'),
          url: config.get('DB_URL'), // Optional: use if provided
          autoLoadEntities: true,
          synchronize: true, // Set to false in production, use migrations
          logging: true,
          entities: ['dist/**/entities/*.entity.js'],
        };
      },
    }),
    AppConfigModule,
    AuthModule,
    ApiKeysModule,
    UsersModule,
    LogsModule,
    AlertsModule,
    MetricsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [AppConfigService],
})
export class AppModule {}
