export interface CompressionOptions {
  enabled: boolean;
  algorithm: 'gzip' | 'deflate';
  level?: number; // 0-9 for gzip/deflate, 0-11 for brotli
  threshold?: number; // Minimum size in bytes to compress
}

export interface CompressionResult {
  data: Buffer;
  compressed: boolean;
  algorithm?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  compressionTime?: number;
}

export interface DecompressionOptions {
  algorithm?: 'gzip' | 'deflate';
}
