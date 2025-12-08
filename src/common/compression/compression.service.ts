import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zlib from 'zlib';
import { promisify } from 'util';
import {
  CompressionOptions,
  CompressionResult,
  DecompressionOptions,
} from './interface/index.interface';

/**
 * CompressionService
 *
 * Handles all compression and decompression operations for RabbitMQ messages.
 * Supports multiple algorithms: gzip, deflate
 *
 * Features:
 * ✅ Automatic compression for large messages
 * ✅ Configurable compression threshold
 * ✅ Multiple compression algorithms
 * ✅ Compression statistics tracking
 * ✅ Fallback to uncompressed on errors
 */

// Promisify zlib methods for async/await
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);
const deflateAsync = promisify(zlib.deflate);
const inflateAsync = promisify(zlib.inflate);

const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  enabled: true,
  algorithm: 'gzip',
  level: 6, // Balance between speed and compression ratio
  threshold: 1024, // Only compress messages > 1KB
};

@Injectable()
export class CompressionService {
  private readonly _logger = new Logger(CompressionService.name);
  private _options: CompressionOptions;

  // Statistics tracking
  private _stats = {
    totalCompressed: 0,
    totalDecompressed: 0,
    totalBytesSaved: 0,
    totalCompressionRatios: [] as number[],
  };

  constructor(private readonly configService: ConfigService) {
    // Load compression options from config
    const configOptions = this.configService.get('compression', {});
    this._options = {
      ...DEFAULT_COMPRESSION_OPTIONS,
      ...configOptions,
    };

    this._logger.log('Compression service initialized', this._options);
  }

  /**
   * Compress buffer or string content
   * @param content Content to compress
   * @param options Override default compression options
   * @returns Compression result with metadata
   */
  async compress(
    content: Buffer | string,
    options?: Partial<CompressionOptions>,
  ): Promise<CompressionResult> {
    const opts = { ...this._options, ...options };

    // Convert string to buffer if needed
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);

    const originalSize = buffer.length;

    // Check if compression is disabled or content is too small
    if (!opts.enabled || originalSize < opts.threshold) {
      return {
        data: buffer,
        compressed: false,
        originalSize,
        compressedSize: originalSize,
      };
    }

    try {
      const startTime = Date.now();
      let compressed: Buffer;

      // Compress based on algorithm
      switch (opts.algorithm) {
        case 'gzip':
          compressed = await this._compressGzip(buffer, opts.level);
          break;

        case 'deflate':
          compressed = await this._compressDeflate(buffer, opts.level);
          break;

        default:
          throw new Error(
            `Unsupported compression algorithm: ${opts.algorithm}`,
          );
      }

      const compressionTime = Date.now() - startTime;
      const compressedSize = compressed.length;
      const compressionRatio = (1 - compressedSize / originalSize) * 100;

      // Update statistics
      this._stats.totalCompressed++;
      this._stats.totalBytesSaved += originalSize - compressedSize;
      this._stats.totalCompressionRatios.push(compressionRatio);

      this._logger.debug(
        `Compressed ${originalSize} bytes → ${compressedSize} bytes ` +
          `(${compressionRatio.toFixed(2)}% reduction) using ${opts.algorithm} in ${compressionTime}ms`,
      );

      return {
        data: compressed,
        compressed: true,
        algorithm: opts.algorithm,
        originalSize,
        compressedSize,
        compressionRatio,
        compressionTime,
      };
    } catch (error) {
      this._logger.error('Compression failed, returning uncompressed', error);

      // Fallback to uncompressed on error
      return {
        data: buffer,
        compressed: false,
        originalSize,
        compressedSize: originalSize,
      };
    }
  }

  /**
   * Decompress buffer content
   * @param content Compressed buffer
   * @param options Decompression options
   * @returns Decompressed buffer
   */
  async decompress(
    content: Buffer,
    options?: DecompressionOptions,
  ): Promise<Buffer> {
    const algorithm = options?.algorithm || this._options.algorithm;

    try {
      const startTime = Date.now();
      const originalSize = content.length;
      let decompressed: Buffer;

      // Decompress based on algorithm
      switch (algorithm) {
        case 'gzip':
          decompressed = await this._decompressGzip(content);
          break;

        case 'deflate':
          decompressed = await this._decompressDeflate(content);
          break;

        default:
          throw new Error(`Unsupported decompression algorithm: ${algorithm}`);
      }

      const decompressionTime = Date.now() - startTime;
      const decompressedSize = decompressed.length;

      // Update statistics
      this._stats.totalDecompressed++;

      this._logger.debug(
        `Decompressed ${originalSize} bytes → ${decompressedSize} bytes ` +
          `using ${algorithm} in ${decompressionTime}ms`,
      );

      return decompressed;
    } catch (error) {
      // Handle Z_DATA_ERROR gracefully
      if (error.code === 'Z_DATA_ERROR' || error.errno === -3) {
        this._logger.warn(
          `Decompression failed (Z_DATA_ERROR) - data might not be compressed or wrong algorithm. ` +
            `Returning original content. Error: ${error.message}`,
        );
        // Return original content if decompression fails
        return content;
      }

      this._logger.error('Decompression failed with unexpected error', error);
      throw new Error(
        `Failed to decompress message using ${algorithm}: ${error.message}`,
      );
    }
  }

  /**
   * Safely decompress content - returns original if decompression fails
   * This is useful when you're not sure if content is compressed
   * @param content Buffer to decompress
   * @param options Decompression options
   * @returns Decompressed buffer or original content on failure
   */
  async safeDecompress(
    content: Buffer,
    options?: DecompressionOptions,
  ): Promise<Buffer> {
    try {
      return await this.decompress(content, options);
    } catch (error) {
      this._logger.warn(
        'Safe decompression fallback to original content',
        error.message,
      );
      return content;
    }
  }

  /**
   * Check if buffer is compressed by checking magic bytes
   * @param buffer Buffer to check
   * @param algorithm Compression algorithm to check for
   * @returns true if buffer appears to be compressed
   */
  isCompressed(buffer: Buffer, algorithm?: string): boolean {
    if (!buffer || buffer.length < 2) {
      return false;
    }

    const algo = algorithm || this._options.algorithm;

    switch (algo) {
      case 'gzip':
        // Gzip magic bytes: 0x1f 0x8b
        return buffer[0] === 0x1f && buffer[1] === 0x8b;

      case 'deflate':
        // Deflate magic bytes: 0x78 (followed by 0x01, 0x9c, 0xda, or 0x5e)
        return (
          buffer[0] === 0x78 && [0x01, 0x9c, 0xda, 0x5e].includes(buffer[1])
        );

      default:
        // Default to gzip check
        return buffer[0] === 0x1f && buffer[1] === 0x8b;
    }
  }

  /**
   * Check if content should be compressed
   */
  shouldCompress(size: number): boolean {
    return this._options.enabled && size >= this._options.threshold;
  }

  /**
   * Get compression statistics
   */
  getStats() {
    const avgRatio =
      this._stats.totalCompressionRatios.length > 0
        ? this._stats.totalCompressionRatios.reduce((a, b) => a + b, 0) /
          this._stats.totalCompressionRatios.length
        : 0;

    return {
      totalCompressed: this._stats.totalCompressed,
      totalDecompressed: this._stats.totalDecompressed,
      totalBytesSaved: this._stats.totalBytesSaved,
      averageCompressionRatio: avgRatio,
      compressionEnabled: this._options.enabled,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this._stats = {
      totalCompressed: 0,
      totalDecompressed: 0,
      totalBytesSaved: 0,
      totalCompressionRatios: [],
    };
    this._logger.log('Compression statistics reset');
  }

  /**
   * Update compression options at runtime
   */
  setOptions(options: Partial<CompressionOptions>): void {
    this._options = {
      ...this._options,
      ...options,
    };
    this._logger.log('Compression options updated', this._options);
  }

  /**
   * Get current compression options
   */
  getOptions(): CompressionOptions {
    return { ...this._options };
  }

  // ============================================
  // Private compression/decompression methods
  // ============================================

  private async _compressGzip(
    buffer: Buffer,
    level: number = 6,
  ): Promise<Buffer> {
    return await gzipAsync(buffer, { level });
  }

  private async _decompressGzip(buffer: Buffer): Promise<Buffer> {
    return await gunzipAsync(buffer);
  }

  private async _compressDeflate(
    buffer: Buffer,
    level: number = 6,
  ): Promise<Buffer> {
    return await deflateAsync(buffer, { level });
  }

  private async _decompressDeflate(buffer: Buffer): Promise<Buffer> {
    return await inflateAsync(buffer);
  }
}
