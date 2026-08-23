import * as dns from 'node:dns';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';


dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {
    static forFeature(entities: ModelDefinition[]){
        return MongooseModule.forFeature(entities);
    }
}

