import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: { 
      urls: [configService.getOrThrow<string>('RABBITMQ_URI')],   
      queue: 'payments',
    },
  });
  app.useLogger(app.get(Logger))
  await app.startAllMicroservices();
}
bootstrap();
