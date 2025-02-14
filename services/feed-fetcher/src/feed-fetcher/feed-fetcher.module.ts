import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqsPollingService } from '../shared/services/sqs-polling.service';
import { Request, Response } from './entities';
import { FeedFetcherController } from './feed-fetcher.controller';
import { FeedFetcherService } from './feed-fetcher.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  controllers: [FeedFetcherController],
  providers: [FeedFetcherService, SqsPollingService],
  exports: [FeedFetcherService, TypeOrmModule],
  imports: [
    TypeOrmModule.forFeature([Request, Response]),
    EventEmitterModule.forRoot(),
  ],
})
export class FeedFetcherModule {}
