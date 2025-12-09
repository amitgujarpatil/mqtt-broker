import { Inject } from '@nestjs/common';
import { RMQ_CONSUMER_SERVICE, RMQ_PUBLISHER_SERVICE } from '../constants';

export const RMQPublisherService = () => Inject(RMQ_PUBLISHER_SERVICE);
export const RMQConsumerService = () => Inject(RMQ_CONSUMER_SERVICE);
