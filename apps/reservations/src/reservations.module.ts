import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { DatabaseModule, LoggerModule, AUTH_SERVICE, PAYMENTS_SERVICE, HealthModule } from '@app/common';
import { ReservationsRepository } from './reservation.repository';
import { ReservationDocument, ReservationSchema } from './entities/reservation.entity';
import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';



@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: ReservationDocument.name, schema: ReservationSchema },
    ]),
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        RABBITMQ_URI: Joi.string().required(),
      }),
    }), 
    ClientsModule.registerAsync([
      { 
        name: AUTH_SERVICE, 
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
             urls: [configService.getOrThrow<string>('RABBITMQ_URI')],   
             queue: 'auth',
          },
        }),
        inject: [ConfigService],
      },
       { 
        name: PAYMENTS_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
             urls: [configService.getOrThrow<string>('RABBITMQ_URI')],   
             queue: 'payments',
          },
        }),
        inject: [ConfigService],
      },
    ]),
    HealthModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}

