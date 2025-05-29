import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from '@shared/config/config.module';
import { AppConfigService } from '@shared/config/config.service';

export const createTestDatabaseModule = () =>
  TypeOrmModule.forRootAsync({
    imports: [AppConfigModule],
    inject: [AppConfigService],
    useFactory: (config: AppConfigService) => ({
      type: 'postgres',
      host: config.get('DB_HOST'),
      port: parseInt(config.get('DB_PORT'), 10),
      username: config.get('DB_USER'),
      password: config.get('DB_PASSWORD'),
      database: config.get('DB_NAME'),
      url: config.get('DB_URL'),
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
      entities: ['dist/**/entities/*.entity.js'],
    }),
  });
