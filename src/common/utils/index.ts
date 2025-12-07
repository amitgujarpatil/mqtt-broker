import { Logger } from '@nestjs/common';

export const retrySafe = async <T>(
  fn: () => Promise<T>,
  options: {
    retries: number;
    delay: number;
    logger?: Logger;
  } = { retries: 3, delay: 1000, logger: new Logger('RetrySafe') },
): Promise<T> => {
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn();
    } catch (error) {
      options.logger.error(`Retry ${i + 1}/${options.retries} failed:`, error);
      if (i < options.retries - 1) {
        await new Promise((res) => setTimeout(res, options.delay));
      }
    }
  }
};
