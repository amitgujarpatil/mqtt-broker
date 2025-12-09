const ENV = process.env.NODE_ENV;
const BROKER_ID = process.env.BROKER_ID;

const RmqQueueEnum = {
  DEVICE_COMMAND_SEND: `${ENV}.device.command.send.id.${BROKER_ID}`,
  DEVICE_MESSAGE_RECEIVE: `${ENV}.device.message.receive`,
  DEVICE_HANDSHAKE: `${ENV}.device.handshake`,
} as const;

export type RmqQueueEnumType = (typeof RmqQueueEnum)[keyof typeof RmqQueueEnum];

export default RmqQueueEnum;
