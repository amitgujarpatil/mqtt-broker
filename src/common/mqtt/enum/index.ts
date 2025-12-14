export enum MQTTEventEnum {
    PUBLISH = 'publish',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
    CLOSED = 'closed',
    CLIENT = 'client',
    CLIENT_READY = 'clientReady',
    CLIENT_DISCONNECT = 'clientDisconnect',
    CLIENT_ERROR = 'clientError',
    CONNECTION_ERROR = 'connectionError',
    ACK = 'ack',
    CONNACK_SENT = 'connackSent',
    KEEPALIVE_TIMEOUT = 'keepaliveTimeout',
    PING = 'ping',
    RECONNECT = 'reconnect'
}

export enum MQTTHookEnum {
    PRE_CONNECT = 'preConnect',
    AUTHENTICATE = 'authenticate',
    AUTHORIZE_PUBLISH = 'authorizePublish',
    AUTHORIZE_SUBSCRIBE = 'authorizeSubscribe',
    PUBLISHED = 'published'
}