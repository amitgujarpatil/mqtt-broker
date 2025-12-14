import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MqttModuleOptions } from './interface';
import { MqttBrokerService, MqttBrokerDiscoveryService } from './service';
import { MQTT_BROKER_MODULE_OPTIONS_CONSTANT } from './constant';
import { DynamicModuleOptions } from './type';

/**
 * The main module for integrating an MQTT broker into a NestJS application.
 * It provides configuration methods for synchronous and asynchronous initialization.
 *
 * The module depends on:
 * - DiscoveryModule from @nestjs/core for finding MQTT subscriber methods in other modules.
 * - MqttBrokerService to manage the MQTT broker lifecycle.
 * - MqttBrokerDiscoveryService to handle reflection and subscription logic.
 *
 * The configuration type `MqttModuleOptions` defines broker settings:
 * ```typescript
 * export interface MqttModuleOptions {
 *   broker: {
 *     port: number;
 *     host?: string;
 *     ssl?: boolean;
 *     sslOptions?: {
 *       key?: Buffer;
 *       cert?: Buffer;
 *       ca?: Buffer;
 *      rejectUnauthorized?: boolean;
 *      requestCert?: boolean;
 *     },
 *     maxConnections?: number;
 *     keepaliveTimeout?: number;
 *     concurrency?: number;
 *     aedesOptions?: AedesOptions; // Options passed directly to the Aedes broker instance
 *     logs?: boolean; // enable or disable logs
 *     logger?: Logger; // custom logger instance
 *     };
 *   };
 * ```
 */
@Module({})
export class MqttBrokerModule {
  /**
   * Configures the MqttBrokerModule synchronously using a static configuration object.
   * This method is suitable when all configuration values are available at startup time.
   *
   * @param options The configuration options for the MQTT broker. Can use useValue, useClass, or useFactory.
   * @returns A DynamicModule configured with the necessary providers and imports.
   *
   * @example
   * ```typescript
   * // In app.module.ts
   * import { Module } from '@nestjs/common';
   * import { MqttBrokerModule } from 'mqtt-aedes-broker';
   *
   * @Module({
   *   imports: [
   *     MqttBrokerModule.forRoot({
   *       useValue: {
   *         broker: {
   *           port: 1883,
   *           host: 'localhost',
   *           logs: true,
   *         },
   *       },
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRoot(
    options: DynamicModuleOptions<MqttModuleOptions>,
  ): DynamicModule {
    return {
      module: MqttBrokerModule,
      imports: [DiscoveryModule],
      providers: [
        {
          // This provider makes the MqttModuleOptions available throughout the module
          provide: MQTT_BROKER_MODULE_OPTIONS_CONSTANT,
          useFactory: options.useFactory,
          inject: options.inject || [],
          ...('useValue' in options ? { useValue: options.useValue } : {}),
          ...('useClass' in options ? { useClass: options.useClass } : {}),
        },
        MqttBrokerDiscoveryService,
        MqttBrokerService,
      ],
      exports: [],
    };
  }

  /**
   * Configures the MqttBrokerModule asynchronously, typically used with the built-in ConfigService.
   * This allows configuration to be loaded dynamically from environment variables, files, etc.,
   * after the main application context is initialized.
   *
   * @param options The asynchronous configuration options (useFactory is typical).
   * @returns A DynamicModule configured for asynchronous setup.
   *
   * @example
   * ```typescript
   * // In app.module.ts
   * import { Module } from '@nestjs/common';
   * import { ConfigModule, ConfigService } from '@nestjs/config';
   * import { MqttBrokerModule } from 'mqtt-aedes-broker';
   *
   * @Module({
   *   imports: [
   *     ConfigModule.forRoot(), // Ensure ConfigModule is imported first
   *     MqttBrokerModule.forRootAsync({
   *       imports: [ConfigModule], // Required if injecting ConfigService
   *       useFactory: (configService: ConfigService) => ({
   *         broker: {
   *           port: configService.get<number>('MQTT_PORT', 1883),
   *           host: configService.get<string>('MQTT_HOST', 'localhost'),
   *         },
   *       }),
   *       inject: [ConfigService],
   *     }),
   *   ],
   * })
   * export class AppModule {}
   * ```
   */
  static forRootAsync(
    options: DynamicModuleOptions<MqttModuleOptions>,
  ): DynamicModule {
    return {
      module: MqttBrokerModule,
      // You may need to add options.imports here if they exist, but generally they are defined in the consuming module
      imports: [DiscoveryModule],
      providers: [
        {
          provide: MQTT_BROKER_MODULE_OPTIONS_CONSTANT,
          // useFactory dynamically resolves the options
          useFactory: options.useFactory,
          inject: options.inject || [],
          ...('useValue' in options ? { useValue: options.useValue } : {}),
          ...('useClass' in options ? { useClass: options.useClass } : {}),
        },
        MqttBrokerDiscoveryService,
        MqttBrokerService,
      ],
      exports: [],
    };
  }
}