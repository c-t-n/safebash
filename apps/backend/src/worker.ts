import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WorkerModule } from './worker.module';
import { DEFAULT_ANALYSIS_QUEUE } from './jobs/jobs.constants';

/**
 * Worker entry point. Runs as a separate process / container — never
 * inside the HTTP API. Listens for analyze-script events on RMQ and runs
 * the (possibly minute-long) analysis without blocking the API.
 *
 * `noAck: false` + explicit channel.ack() in the consumer means we have
 * at-least-once delivery: if the worker dies mid-job the message goes
 * back on the queue.
 */
async function bootstrap() {
  const logger = new Logger('Worker');

  const url = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  const queue = process.env.ANALYSIS_QUEUE ?? DEFAULT_ANALYSIS_QUEUE;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue,
        queueOptions: { durable: true },
        noAck: false,
        prefetchCount: 1, // serialise: one analysis at a time per worker
      },
    },
  );

  await app.listen();
  logger.log(`Worker listening on ${url} queue=${queue}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Worker failed to start:', err);
  process.exit(1);
});
