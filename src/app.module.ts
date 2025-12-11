import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { BrokerModule } from './core/broker/broker.module';
import { ConfigModule } from './config/config.module';
import { DeviceCommandSendConsumerService } from './core/consumers/deviceCommandSend.consumer.service';


@Module({
  imports: [
    ConfigModule, CommonModule, BrokerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    DeviceCommandSendConsumerService],
})
export class AppModule {}
