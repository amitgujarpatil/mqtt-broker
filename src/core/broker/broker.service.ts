import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {

  MQTTClient,
  MQTTPublishPacket,
  MQTTSubscribePacket,

  MQTTConnectPacket,
  MQTTEvent,
  MQTTHook,
  MQTTSubscription,
  MQTTPublishedPacket
} from 'src/common/mqtt';
import { MQTTEventEnum, MQTTHookEnum } from 'src/common/mqtt/enum';
import { RMQPublisherSvc } from 'src/common/rmq/decorator/rmq.services.decorator';
import { RMQPublisherService } from 'src/common/rmq/service/rmq.publisher.service';
import { ConfigVariablesType } from 'src/config';

@Injectable()
export class BrokerService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService<ConfigVariablesType>,
    @RMQPublisherSvc()
    private readonly rmqPublisherService: RMQPublisherService,
  ) {
    configService.get('app');
  }

  async onModuleInit() {
    console.log('hello broker service');

    /// redis connection
    // every should have unique uuid
    // uuid against server instance
    //
  }

  @MQTTEvent(MQTTEventEnum.CLIENT)
  onMqttEvent(client: MQTTClient): void {
    console.log(`Received MQTT event from client -> closed -> ${client.id}:`);
  }

  @MQTTHook(MQTTHookEnum.AUTHENTICATE)
  async authenticateUser(
    client: MQTTClient,
    username: string,
    password: Buffer,
    cb: (err?: Error | null, result?: boolean) => void
  ){
    console.log('Authenticating user:', username, 'on handler:', password);
    cb(null, true);
    return;
  }

  @MQTTHook(MQTTHookEnum.PRE_CONNECT)
  async handlePreConnect(
    client: MQTTClient,
    packet: MQTTConnectPacket,
    cb: (error: Error | null, success: boolean) => void
  ) {
    console.log(`Pre-connecting client: ${client.id}`);
    cb(null, true);
    return;
  }

  @MQTTHook(MQTTHookEnum.AUTHORIZE_PUBLISH)
  async authorizePublish(
    client: MQTTClient | null,
    packet: MQTTPublishPacket,
    cb: (error?: Error | null) => void
  ) {
    console.log(
      `Authorizing publish for client: ${client?.id} to topic: ${packet.topic}`,
    );
    cb(null);
    return;
  }
  
  @MQTTHook(MQTTHookEnum.PUBLISHED)
  async handlePublished(
    client: MQTTClient | null,
    packet: MQTTPublishedPacket,
    cb: (error?: Error | null) => void
  ) {
    console.log('handlePublished->', packet?.topic);
    console.log('handlePublished->', client?.id);
    // console.log(
    //   `Message published to topic: ${packet?.topic} by client: ${client?.id}`,
    // );
    cb(null);
    return;
  }

  @MQTTEvent(MQTTEventEnum.PUBLISH)
  async handlePublishedEVENT(
    packet: MQTTPublishedPacket,
    client: MQTTClient | null
  ) {
    console.log('handlePublished->', packet?.topic);
    console.log('handlePublished->', client?.id);
    // console.log(
    //   `Message published to topic: ${packet?.topic} by client: ${client?.id}`,
    // );

    return;
  }

  @MQTTHook(MQTTHookEnum.AUTHORIZE_SUBSCRIBE)
  async authorizeSubscribe(
  client: MQTTClient | null,
  subscription: MQTTSubscription,
  cb: (error: Error | null, subscription?: MQTTSubscription | null) => void
  ) {
    console.log(
      `Authorizing subscribe for client: ${client?.id} to topic: ${subscription.topic}`,
    );
    cb(null, subscription);
    return;
  }

  

}
