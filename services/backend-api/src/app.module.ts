import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config/config';
import { validateConfig } from './config/config.validate';
import testConfig from './config/test-config';
import { DiscordAuthModule } from './features/discord-auth/discord-auth.module';
import { DiscordServersModule } from './features/discord-servers/discord-servers.module';
import { DiscordUserModule } from './features/discord-users/discord-users.module';
import { DiscordWebhooksModule } from './features/discord-webhooks/discord-webhooks.module';
import { FeedsModule } from './features/feeds/feeds.module';
import { SupportersModule } from './features/supporters/supporters.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleHandlerModule } from './features/schedule-handler/schedule-handler.module';
import { ScheduleEmitterModule } from './features/schedule-emitter/schedule-emitter.module';
import { FailedUrlHandlerModule } from './features/failed-url-handler/failed-url-handler.module';

@Module({
  imports: [
    DiscordAuthModule,
    DiscordUserModule,
    DiscordServersModule,
    FeedsModule,
    DiscordWebhooksModule,
    SupportersModule,
    ScheduleHandlerModule,
    ScheduleEmitterModule,
    FailedUrlHandlerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static forRoot(): DynamicModule {
    const configValues = config();

    return {
      module: AppModule,
      imports: [
        MongooseModule.forRoot(configValues.MONGODB_URI),
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [process.env.NODE_ENV === 'test' ? testConfig : config],
        }),
      ],
    };
  }

  static forTest(): DynamicModule {
    return {
      module: AppModule,
      imports: [],
    };
  }
}
