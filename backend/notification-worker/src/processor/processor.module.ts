import { Module } from '@nestjs/common';
import { ProcessorWorker } from './processor.worker';
import { ProcessorService } from './processor.service';
import { ProcessorPreference } from './processor.preference';

@Module({
  providers: [ProcessorWorker, ProcessorService, ProcessorPreference],
})
export class ProcessorModule {}
