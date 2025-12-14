export type DynamicModuleOptions<T> = {
  useFactory: (
    ...args: any[]
  ) => Promise<T> | T;
  inject?: any[];
  useValue?: T;
  useClass?: new (...args: any[]) => T;
};

