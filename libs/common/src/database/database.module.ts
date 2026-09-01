import * as dns from 'node:dns';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<string>('MYSQL_HOST'),
        port: configService.getOrThrow<number>('MYSQL_PORT'),
        username: configService.getOrThrow<string>('MYSQL_USERNAME'),
        password: configService.getOrThrow<string>('MYSQL_PASSWORD'),
        database: configService.getOrThrow<string>('MYSQL_DATABASE'),
        synchronize: configService.get<boolean>('MYSQL_SYNCHRONIZE', false), // Disable for production
        autoLoadEntities: true, // Load entities automatically
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  static forFeature(entities: Parameters<typeof TypeOrmModule.forFeature>[0]): DynamicModule {
    return TypeOrmModule.forFeature(entities);
  }
}

