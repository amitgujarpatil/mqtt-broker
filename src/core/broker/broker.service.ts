import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MQTTAuthenticate,
  MQTTClient,
  MQTTPublishPacket,
  MQTTSubscribePacket,
  MQTTAuthorizePublish,
  MQTTAuthorizeSubscribe,
  MQTTPreConnect,
  MQTTPublished,
  MQTTConnectPacket,
  MQTTEvent
} from 'src/common/mqtt';
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

  @MQTTEvent("closed")
  onMqttEvent(client: MQTTClient,id:string): void {
    console.log(`Received MQTT event from client -> closed -> ${client.id}:`);
  }

  @MQTTAuthenticate()
  authHandler(
    client: MQTTClient,
    username?: string,
    password?: string,
  ): boolean {
    // params.client.publish({
    //   topic: 'auth/logs',
    //   payload: Buffer.from(`User ${params.username} authenticated`, 'utf-8'),
    // }, 'called auth handler')
    console.log('Authenticating user:', username, 'on handler:', password);

    return true;
  }

  @MQTTAuthorizePublish()
  authorizePublish(client: MQTTClient, packet: MQTTPublishPacket): boolean {
    console.log(
      `Authorizing publish for client: ${client.id} to topic: ${packet.topic}`,
    );
    // Implement your authorization logic here
    return true;
  }

  @MQTTAuthorizeSubscribe()
  authorizeSubscribe(client: MQTTClient, packet: MQTTSubscribePacket): boolean {
    console.log('authorizeSubscribe', client.id, packet);
    // Implement your authorization logic here
    return true;
  }

  @MQTTPreConnect()
  preConnect(client: MQTTClient, packet: MQTTConnectPacket): boolean {
    console.log('preconnect->', this);
    console.log('preconnect->', this.configService.get('app'));
    console.log('preConnect', client.id, packet.clientId);
    console.log(`Pre-connecting client: ${client.id}`);
    // Implement your pre-connection logic here
    return true;
  }

  @MQTTPublished()
  onPublished(client: MQTTClient, packet: MQTTPublishPacket): void {
    console.log(
      `Message published to topic: ${packet.topic} by client: ${client.id}`,
    );
    // Implement your post-publish logic here
  }
}
