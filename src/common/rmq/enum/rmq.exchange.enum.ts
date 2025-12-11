/*
  the Exchange is the router that receives messages from producers 
  and decides where to send them, while the Binding is the rule/link 
  connecting an Exchange to a Queue, telling the Exchange how to route
  messages (using keys/headers) to specific queues.

  It is considered a good practice to publish messages to an exchange
  rather than directly to a queue in RabbitMQ, primarily because it
  decouples the producer from the consumer.

  By using exchanges, you gain flexibility in routing messages,
  scalability in adding/removing consumers, and the ability to implement
  complex messaging patterns without changing the producer logic.
*/

const ENV = process.env.NODE_ENV;

const RmqExchangeEnum = {
  DEVICE_COMMAND_SEND: `${ENV}.device.command.send`,
  DEVICE_MESSAGE_RECEIVE: `${ENV}.device.message.receive`,
  DEVICE_HANDSHAKE: `${ENV}.device.handshake`,
  DEVICE_COMMAND_BROADCAST: `${ENV}.device.command.broadcast`,
} as const;

export type RmqExchangeEnumType =
  (typeof RmqExchangeEnum)[keyof typeof RmqExchangeEnum];

export default RmqExchangeEnum;
