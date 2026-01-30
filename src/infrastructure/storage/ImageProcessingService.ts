import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessImageDTO {
  buffer: Buffer;
  folder: 'tours' | 'users' | 'reviews';
  originalname: string;
}

export interface ProcessedImage {
  buffer: Buffer;
  key: string;
  mimetype: string;
  size: number;
}

export class ImageProcessingService {
  /**
   * Process and optimize image
   * - Resize to max dimensions
   * - Compress to reduce file size
   * - Convert to JPEG format
   * - Generate unique S3 key
   */
  async processImage(dto: ProcessImageDTO): Promise<ProcessedImage> {
    const { buffer, folder, originalname } = dto;

    // Generate unique key
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = 'jpg';
    const key = `${folder}/${timestamp}-${uuid}.${extension}`;

    // Process image based on folder type
    let processedBuffer: Buffer;

    if (folder === 'users') {
      // User avatars: 500x500, high quality
      processedBuffer = await sharp(buffer)
        .resize(500, 500, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    } else if (folder === 'tours') {
      // Tour images: 2000x1333, good quality
      processedBuffer = await sharp(buffer)
        .resize(2000, 1333, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else {
      // Review images: 1200x800, standard quality
      processedBuffer = await sharp(buffer)
        .resize(1200, 800, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    }

    return {
      buffer: processedBuffer,
      key,
      mimetype: 'image/jpeg',
      size: processedBuffer.length,
    };
  }

  /**
   * Validate image file
   */
  validateImage(mimetype: string, size: number): void {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || '').split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10);

    if (!allowedTypes.includes(mimetype)) {
      throw new Error(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    if (size > maxSize) {
      throw new Error(
        `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }
}
