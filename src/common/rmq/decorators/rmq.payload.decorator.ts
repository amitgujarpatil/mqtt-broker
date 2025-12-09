import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract parsed payload from RabbitMQ message
 */
export const RMQPayload = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const message = ctx.getArgByIndex(0);
    // @ts-ignore
    const payload = message?.parsedPayload || message;

    // If data is specified, return that property
    if (data) {
      return payload?.[data];
    }

    return payload;
  },
);

/**
 * Extract the full RabbitMQ message
 */
export const RMQMessage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.getArgByIndex(0);
  },
);

/**
 * Extract message fields (deliveryTag, routingKey, etc.)
 */
export const RMQFields = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const message = ctx.getArgByIndex(0);
    const fields = message?.fields;

    if (data) {
      return fields?.[data];
    }

    return fields;
  },
);

/**
 * Extract message properties/headers
 */
export const RMQHeaders = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const message = ctx.getArgByIndex(0);
    const headers = message?.properties?.headers;

    if (data) {
      return headers?.[data];
    }

    return headers;
  },
);

/**
 * Get the channel for manual ack/nack
 */
export const RMQChannel = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.getArgByIndex(1);
  },
);
