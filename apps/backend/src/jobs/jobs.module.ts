import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnalysisJobDispatcher } from './analysis-job.dispatcher';
import {
  ANALYSIS_QUEUE_CLIENT,
  DEFAULT_ANALYSIS_QUEUE,
} from './jobs.constants';

/**
 * Provides the RMQ producer used by the API to dispatch background work.
 * The worker process does NOT import this module — it registers its own
 * microservice listener via NestFactory.createMicroservice in worker.ts.
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: ANALYSIS_QUEUE_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672'],
            queue: config.get<string>('ANALYSIS_QUEUE') ?? DEFAULT_ANALYSIS_QUEUE,
            queueOptions: { durable: true },
            // Persistent messages survive a broker restart — analyses are
            // expensive enough that we never want to silently drop one.
            persistent: true,
          },
        }),
      },
    ]),
  ],
  providers: [AnalysisJobDispatcher],
  exports: [AnalysisJobDispatcher],
})
export class JobsModule {}
