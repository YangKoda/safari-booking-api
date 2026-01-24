import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IFileUploadService, UploadFileDTO, UploadedFile } from '@application/ports/output/IFileUploadService';
import { S3Config } from './S3Config';
import { ImageProcessingService } from './ImageProcessingService';
import Logger from '@shared/utils/logger';

export class S3UploadService implements IFileUploadService {
  private imageProcessor = new ImageProcessingService();

  // Lazy load S3 client only when needed
  private getClient() {
    return S3Config.getClient();
  }
  private getBucketName() {
    return S3Config.getBucketName()
  }
  private getBaseUrl() {
    return S3Config.getBaseUrl();
  }

  /**
   * Upload image to S3 with processing
   */
  async uploadImage(dto: UploadFileDTO): Promise<UploadedFile> {
    const { buffer, mimetype, originalname, folder } = dto;

    // Validate image
    this.imageProcessor.validateImage(mimetype, buffer.length);

    // Process image (resize, compress, optimize)
    const processed = await this.imageProcessor.processImage({
      buffer,
      folder,
      originalname,
    });

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: this.getBucketName(),
      Key: processed.key,
      Body: processed.buffer,
      ContentType: processed.mimetype,
      CacheControl: 'max-age=31536000', // 1 year cache
    });

    await this.getClient().send(command);

    Logger.info(`File uploaded to S3: ${processed.key}`);

    return {
      key: processed.key,
      url: `${this.getBaseUrl()}/${processed.key}`,
      size: processed.size,
    };
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    await this.getClient().send(command);

    Logger.info(`File deleted from S3: ${key}`);
  }

  /**
   * Generate presigned URL for secure temporary access
   */
  async generateSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.getClient(), command, {
      expiresIn,
    });

    return signedUrl;
  }
}
