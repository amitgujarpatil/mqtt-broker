export type ICreateChannelPoolOptions = {
  min?: number;
  max?: number;
  connectionName?: string;
  channelOptions?: {
    channelName?: string;
    confirmChannel?: boolean;
  };
};
