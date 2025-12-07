import { Module, Global } from '@nestjs/common';
import { CompressionService } from './compression.service';

@Module({
  providers: [CompressionService],
  exports: [CompressionService],
})
export class CompressionModule {}
