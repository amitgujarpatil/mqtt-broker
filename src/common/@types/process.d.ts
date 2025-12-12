import { z } from 'zod';
import schema from "../../config/config.validations";

// add schema type in process env type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

