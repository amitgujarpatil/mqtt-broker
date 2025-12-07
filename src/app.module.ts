import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { BrokerModule } from './core/broker/broker.module';

@Module({
  imports: [CommonModule,BrokerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}