import { Module } from '@nestjs/common';
import { BrokerController } from './broker.controller';
import { CommonModule } from '../../src/common/common.module';
import { BrokerModule as MQTTBrokerModule } from '../../src/core/broker/broker.module';
import { ConfigModule } from './config/config.module';
import { DeviceCommandSendConsumerService } from 'src/core/consumers/deviceCommandSend.consumer.service';

@Module({
  imports: [ConfigModule, CommonModule, MQTTBrokerModule],
  controllers: [BrokerController],
  providers: [DeviceCommandSendConsumerService],
})
export class BrokerModule {}
